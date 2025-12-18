(() => {
  const ui = {
    status: document.getElementById("chat-status"),
    nameInput: document.getElementById("display-name"),
    messageInput: document.getElementById("chat-text"),
    sendBtn: document.getElementById("send-chat"),
    messages: document.getElementById("message-feed"),
    peerCount: document.getElementById("peer-count"),
    imageBtn: document.getElementById("imageBtn"),
    imageInput: document.getElementById("imageInput"),
  };

  const peers = new Map(); // peerId -> { pc, channel }
  const seenMessages = new Set();
  const selfId = `peer-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(16).slice(2)}`;
  const signal = new BroadcastChannel("p2p-chat-signal");

  const randomId = () => {
    if (typeof crypto === "undefined") {
      return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
    if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
    if (typeof crypto.getRandomValues === "function") {
      const buf = new Uint32Array(4);
      crypto.getRandomValues(buf);
      return `msg-${Array.from(buf)
        .map((n) => n.toString(16).padStart(8, "0"))
        .join("")}`;
    }
    return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const setStatus = (text) => {
    ui.status.textContent = text;
  };

  const displayName = () => ui.nameInput.value.trim() || "Guest";

  const persistName = () => {
    try {
      localStorage.setItem("p2p_chat_name", displayName());
    } catch {
      /* ignore */
    }
  };

  const loadName = () => {
    try {
      const saved = localStorage.getItem("p2p_chat_name");
      if (saved) ui.nameInput.value = saved;
    } catch {
      /* ignore */
    }
    if (!ui.nameInput.value.trim()) {
      ui.nameInput.value = `Guest-${Math.floor(Math.random() * 9999)}`;
    }
  };

  const updatePeerCount = () => {
    ui.peerCount.textContent = peers.size;
  };

  const addMessage = ({ from, text, timestamp, imageData }, isLocal) => {
    const row = document.createElement("div");
    row.className = `message-row${isLocal ? " local" : ""}`;

    const header = document.createElement("div");
    header.className = "message-header";
    header.textContent = `${from} • ${new Date(timestamp).toLocaleTimeString()}`;

    const body = document.createElement("div");
    body.className = "message-body";
    if (text) {
      const textNode = document.createElement("div");
      textNode.textContent = text;
      body.appendChild(textNode);
    }
    if (imageData) {
      const img = document.createElement("img");
      img.src = imageData;
      img.alt = "Shared image";
      body.appendChild(img);
    }

    row.appendChild(header);
    row.appendChild(body);
    ui.messages.appendChild(row);
    ui.messages.scrollTop = ui.messages.scrollHeight;
  };

  const broadcastMessage = (payload) => {
    const serialized = JSON.stringify(payload);
    peers.forEach((info) => {
      const channel = info.channel;
      if (channel && channel.readyState === "open") {
        try {
          channel.send(serialized);
        } catch (err) {
          console.error("P2P chat: failed to send message", err);
        }
      }
    });
  };

  const handleIncoming = (payload) => {
    if (!payload || seenMessages.has(payload.id)) return;
    seenMessages.add(payload.id);
    addMessage(payload, payload.from === displayName());
  };

  const setupChannel = (peerId, channel) => {
    const info = peers.get(peerId);
    info.channel = channel;

    channel.onopen = () => {
      updatePeerCount();
      setStatus(`Connected to ${peers.size} peer(s).`);
    };
    channel.onclose = () => {
      peers.delete(peerId);
      updatePeerCount();
      setStatus("Peer disconnected.");
    };
    channel.onerror = () => setStatus("Data channel error. Try reconnecting.");
    channel.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        handleIncoming(payload);
      } catch {
        /* ignore bad payloads */
      }
    };
  };

  const createPeer = (peerId, isInitiator) => {
    if (peers.has(peerId)) return peers.get(peerId).pc;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    peers.set(peerId, { pc, channel: null });

    if (isInitiator) {
      const channel = pc.createDataChannel("p2p-chat");
      setupChannel(peerId, channel);
    } else {
      pc.ondatachannel = (event) => setupChannel(peerId, event.channel);
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signal.postMessage({
          type: "ice",
          from: selfId,
          to: peerId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
        peers.delete(peerId);
        updatePeerCount();
      }
    };

    return pc;
  };

  const makeOffer = async (peerId) => {
    const pc = createPeer(peerId, true);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    signal.postMessage({ type: "offer", from: selfId, to: peerId, sdp: offer });
  };

  const handleOffer = async ({ from, sdp }) => {
    const pc = createPeer(from, false);
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    signal.postMessage({ type: "answer", from: selfId, to: from, sdp: answer });
  };

  const handleAnswer = async ({ from, sdp }) => {
    const info = peers.get(from);
    if (!info) return;
    await info.pc.setRemoteDescription(new RTCSessionDescription(sdp));
  };

  const handleIce = async ({ from, candidate }) => {
    const info = peers.get(from);
    if (!info || !candidate) return;
    try {
      await info.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("P2P chat: failed to add ICE", err);
    }
  };

  const sendChat = () => {
    const text = ui.messageInput.value.trim();
    if (!text) return;

    const payload = {
      id: randomId(),
      from: displayName(),
      text,
      timestamp: Date.now(),
    };
    seenMessages.add(payload.id);
    addMessage(payload, true);
    broadcastMessage(payload);
    ui.messageInput.value = "";
  };

  const handleImageUpload = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 150 * 1024) {
      setStatus("Image too large. Max 150KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const maxSize = 800;
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        const payload = {
          id: randomId(),
          from: displayName(),
          text: ui.messageInput.value.trim(),
          imageData,
          timestamp: Date.now(),
        };
        seenMessages.add(payload.id);
        addMessage(payload, true);
        broadcastMessage(payload);
        ui.messageInput.value = "";
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const init = () => {
    loadName();
    setStatus("Connecting to shared room…");
    updatePeerCount();

    ui.nameInput.addEventListener("input", persistName);
    ui.sendBtn.addEventListener("click", sendChat);
    ui.messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendChat();
      }
    });
    if (ui.imageBtn && ui.imageInput) {
      ui.imageBtn.addEventListener("click", () => ui.imageInput.click());
      ui.imageInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (file) handleImageUpload(file);
        ui.imageInput.value = "";
      });
    }

    document.addEventListener("paste", (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          handleImageUpload(file);
          break;
        }
      }
    });

    signal.onmessage = async (event) => {
      const data = event.data;
      if (!data || data.from === selfId) return;
      if (data.type === "hello") {
        if (!peers.has(data.from) && selfId > data.from) {
          await makeOffer(data.from);
        }
      } else if (data.to && data.to !== selfId) {
        return;
      } else if (data.type === "offer") {
        await handleOffer(data);
      } else if (data.type === "answer") {
        await handleAnswer(data);
      } else if (data.type === "ice") {
        await handleIce(data);
      }
    };

    signal.postMessage({ type: "hello", from: selfId });
    setStatus("Connected to shared room.");
  };

  init();
})();
