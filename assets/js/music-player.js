/**
 * Verdis Music Player
 * Full-featured music player with YouTube Music backend via Piped API
 */

const VerdiMusic = (function () {
    // API Endpoints
    const PIPED_API = 'https://pipedapi.kavin.rocks';
    const LRCLIB_API = 'https://lrclib.net/api';

    // Storage keys
    const STORAGE_KEYS = {
        playlists: 'verdis_playlists',
        queue: 'verdis_musicQueue',
        recentlyPlayed: 'verdis_recentlyPlayed',
        likedSongs: 'verdis_likedSongs',
        volume: 'verdis_musicVolume',
        currentTrack: 'verdis_currentTrack',
        repeatMode: 'verdis_repeatMode',
        shuffle: 'verdis_shuffle'
    };

    // Player state
    let audio = null;
    let currentTrack = null;
    let queue = [];
    let queueIndex = 0;
    let isPlaying = false;
    let repeatMode = 'off'; // off, one, all
    let shuffleMode = false;
    let originalQueue = [];

    // Initialize audio element (singleton for persistence)
    function getAudio() {
        if (!audio) {
            audio = new Audio();
            audio.crossOrigin = 'anonymous';

            // Event listeners
            audio.addEventListener('ended', handleTrackEnd);
            audio.addEventListener('timeupdate', handleTimeUpdate);
            audio.addEventListener('loadedmetadata', handleMetadataLoaded);
            audio.addEventListener('error', handleError);
            audio.addEventListener('play', () => {
                isPlaying = true;
                dispatchEvent('play');
            });
            audio.addEventListener('pause', () => {
                isPlaying = false;
                dispatchEvent('pause');
            });

            // Restore volume
            const savedVolume = localStorage.getItem(STORAGE_KEYS.volume);
            audio.volume = savedVolume ? parseFloat(savedVolume) : 0.7;

            // Attach to window for persistence across navigation
            window.__verdisMusicAudio = audio;
        }
        return audio;
    }

    // Check if audio already exists from previous page
    function init() {
        if (window.__verdisMusicAudio) {
            audio = window.__verdisMusicAudio;
            // Re-attach event listeners
            audio.removeEventListener('ended', handleTrackEnd);
            audio.addEventListener('ended', handleTrackEnd);
        } else {
            getAudio();
        }

        // Restore state
        const savedRepeat = localStorage.getItem(STORAGE_KEYS.repeatMode);
        if (savedRepeat) repeatMode = savedRepeat;

        const savedShuffle = localStorage.getItem(STORAGE_KEYS.shuffle);
        if (savedShuffle) shuffleMode = savedShuffle === 'true';

        const savedQueue = localStorage.getItem(STORAGE_KEYS.queue);
        if (savedQueue) {
            try {
                const parsed = JSON.parse(savedQueue);
                queue = parsed.queue || [];
                queueIndex = parsed.index || 0;
                originalQueue = parsed.original || [];
            } catch (e) { }
        }

        const savedTrack = localStorage.getItem(STORAGE_KEYS.currentTrack);
        if (savedTrack) {
            try {
                currentTrack = JSON.parse(savedTrack);
            } catch (e) { }
        }

        return VerdiMusic;
    }

    // Save queue state
    function saveQueueState() {
        localStorage.setItem(STORAGE_KEYS.queue, JSON.stringify({
            queue: queue,
            index: queueIndex,
            original: originalQueue
        }));
        if (currentTrack) {
            localStorage.setItem(STORAGE_KEYS.currentTrack, JSON.stringify(currentTrack));
        }
    }

    // Dispatch custom events
    function dispatchEvent(type, detail = {}) {
        window.dispatchEvent(new CustomEvent('verdimusic:' + type, {
            detail: { ...detail, track: currentTrack, isPlaying, queue, queueIndex }
        }));
    }

    // Event handlers
    function handleTrackEnd() {
        if (repeatMode === 'one') {
            audio.currentTime = 0;
            audio.play();
        } else if (queueIndex < queue.length - 1) {
            next();
        } else if (repeatMode === 'all') {
            queueIndex = 0;
            playFromQueue();
        } else {
            isPlaying = false;
            dispatchEvent('ended');
        }
    }

    function handleTimeUpdate() {
        dispatchEvent('timeupdate', {
            currentTime: audio.currentTime,
            duration: audio.duration
        });
    }

    function handleMetadataLoaded() {
        dispatchEvent('loaded', { duration: audio.duration });
    }

    function handleError(e) {
        console.error('Audio error:', e);
        dispatchEvent('error', { error: e });
    }

    // ========== SEARCH ==========
    async function search(query, filter = 'music_songs') {
        try {
            const url = `${PIPED_API}/search?q=${encodeURIComponent(query)}&filter=${filter}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Search failed');
            const data = await res.json();

            // Transform results
            return (data.items || []).map(item => ({
                id: item.url?.replace('/watch?v=', '') || item.videoId,
                title: item.title,
                artist: item.uploaderName || item.uploader,
                thumbnail: item.thumbnail,
                duration: item.duration,
                durationText: formatDuration(item.duration),
                type: item.type
            })).filter(item => item.id);
        } catch (e) {
            console.error('Search error:', e);
            return [];
        }
    }

    // Get stream URL for a video
    async function getStreamUrl(videoId) {
        try {
            const url = `${PIPED_API}/streams/${videoId}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch stream');
            const data = await res.json();

            // Find best audio stream
            const audioStreams = data.audioStreams || [];
            const bestAudio = audioStreams
                .filter(s => s.mimeType?.includes('audio'))
                .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

            return {
                streamUrl: bestAudio?.url || data.hls,
                title: data.title,
                artist: data.uploader,
                thumbnail: data.thumbnailUrl,
                duration: data.duration
            };
        } catch (e) {
            console.error('Stream error:', e);
            return null;
        }
    }

    // ========== PLAYBACK ==========
    async function play(track) {
        if (!track || !track.id) return false;

        try {
            const streamData = await getStreamUrl(track.id);
            if (!streamData || !streamData.streamUrl) {
                console.error('No stream URL found');
                return false;
            }

            currentTrack = {
                ...track,
                streamUrl: streamData.streamUrl,
                thumbnail: streamData.thumbnail || track.thumbnail,
                duration: streamData.duration || track.duration
            };

            getAudio().src = streamData.streamUrl;
            await audio.play();

            // Add to recently played
            addToRecentlyPlayed(currentTrack);

            saveQueueState();
            dispatchEvent('trackchange', { track: currentTrack });

            return true;
        } catch (e) {
            console.error('Play error:', e);
            return false;
        }
    }

    function pause() {
        if (audio) {
            audio.pause();
        }
    }

    function resume() {
        if (audio && currentTrack) {
            audio.play();
        }
    }

    function togglePlay() {
        if (isPlaying) {
            pause();
        } else {
            resume();
        }
    }

    function seek(time) {
        if (audio) {
            audio.currentTime = time;
        }
    }

    function seekPercent(percent) {
        if (audio && audio.duration) {
            audio.currentTime = audio.duration * (percent / 100);
        }
    }

    // ========== QUEUE ==========
    function setQueue(tracks, startIndex = 0) {
        originalQueue = [...tracks];
        queue = shuffleMode ? shuffleArray([...tracks]) : [...tracks];
        queueIndex = startIndex;
        saveQueueState();
        dispatchEvent('queuechange');
    }

    function addToQueue(track) {
        queue.push(track);
        originalQueue.push(track);
        saveQueueState();
        dispatchEvent('queuechange');
    }

    function removeFromQueue(index) {
        if (index >= 0 && index < queue.length) {
            queue.splice(index, 1);
            if (index < queueIndex) queueIndex--;
            saveQueueState();
            dispatchEvent('queuechange');
        }
    }

    function clearQueue() {
        queue = [];
        originalQueue = [];
        queueIndex = 0;
        saveQueueState();
        dispatchEvent('queuechange');
    }

    function playFromQueue(index) {
        if (index !== undefined) queueIndex = index;
        if (queue[queueIndex]) {
            play(queue[queueIndex]);
        }
    }

    function next() {
        if (queueIndex < queue.length - 1) {
            queueIndex++;
            playFromQueue();
        } else if (repeatMode === 'all') {
            queueIndex = 0;
            playFromQueue();
        }
    }

    function previous() {
        if (audio && audio.currentTime > 3) {
            // Restart current track if more than 3 seconds in
            audio.currentTime = 0;
        } else if (queueIndex > 0) {
            queueIndex--;
            playFromQueue();
        }
    }

    // ========== VOLUME ==========
    function setVolume(vol) {
        vol = Math.max(0, Math.min(1, vol));
        if (audio) audio.volume = vol;
        localStorage.setItem(STORAGE_KEYS.volume, vol.toString());
        dispatchEvent('volumechange', { volume: vol });
    }

    function getVolume() {
        return audio ? audio.volume : 0.7;
    }

    function mute() {
        if (audio) audio.muted = true;
    }

    function unmute() {
        if (audio) audio.muted = false;
    }

    // ========== REPEAT & SHUFFLE ==========
    function setRepeatMode(mode) {
        repeatMode = mode;
        localStorage.setItem(STORAGE_KEYS.repeatMode, mode);
        dispatchEvent('repeatchange', { mode });
    }

    function toggleRepeat() {
        const modes = ['off', 'all', 'one'];
        const currentIndex = modes.indexOf(repeatMode);
        setRepeatMode(modes[(currentIndex + 1) % modes.length]);
        return repeatMode;
    }

    function toggleShuffle() {
        shuffleMode = !shuffleMode;
        localStorage.setItem(STORAGE_KEYS.shuffle, shuffleMode.toString());

        if (shuffleMode) {
            const currentTrackId = queue[queueIndex]?.id;
            queue = shuffleArray([...originalQueue]);
            // Move current track to front
            const idx = queue.findIndex(t => t.id === currentTrackId);
            if (idx > 0) {
                const [track] = queue.splice(idx, 1);
                queue.unshift(track);
            }
            queueIndex = 0;
        } else {
            const currentTrackId = queue[queueIndex]?.id;
            queue = [...originalQueue];
            queueIndex = queue.findIndex(t => t.id === currentTrackId);
            if (queueIndex < 0) queueIndex = 0;
        }

        saveQueueState();
        dispatchEvent('shufflechange', { shuffle: shuffleMode });
        return shuffleMode;
    }

    // ========== PLAYLISTS ==========
    function getPlaylists() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.playlists)) || [];
        } catch (e) {
            return [];
        }
    }

    function createPlaylist(name) {
        const playlists = getPlaylists();
        const newPlaylist = {
            id: 'pl_' + Date.now(),
            name,
            tracks: [],
            createdAt: Date.now()
        };
        playlists.push(newPlaylist);
        localStorage.setItem(STORAGE_KEYS.playlists, JSON.stringify(playlists));
        dispatchEvent('playlistschange');
        return newPlaylist;
    }

    function deletePlaylist(id) {
        const playlists = getPlaylists().filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEYS.playlists, JSON.stringify(playlists));
        dispatchEvent('playlistschange');
    }

    function addToPlaylist(playlistId, track) {
        const playlists = getPlaylists();
        const playlist = playlists.find(p => p.id === playlistId);
        if (playlist) {
            if (!playlist.tracks.some(t => t.id === track.id)) {
                playlist.tracks.push(track);
                localStorage.setItem(STORAGE_KEYS.playlists, JSON.stringify(playlists));
                dispatchEvent('playlistschange');
                return true;
            }
        }
        return false;
    }

    function removeFromPlaylist(playlistId, trackId) {
        const playlists = getPlaylists();
        const playlist = playlists.find(p => p.id === playlistId);
        if (playlist) {
            playlist.tracks = playlist.tracks.filter(t => t.id !== trackId);
            localStorage.setItem(STORAGE_KEYS.playlists, JSON.stringify(playlists));
            dispatchEvent('playlistschange');
        }
    }

    // ========== LIKED SONGS ==========
    function getLikedSongs() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.likedSongs)) || [];
        } catch (e) {
            return [];
        }
    }

    function isLiked(trackId) {
        return getLikedSongs().some(t => t.id === trackId);
    }

    function toggleLike(track) {
        const liked = getLikedSongs();
        const index = liked.findIndex(t => t.id === track.id);

        if (index >= 0) {
            liked.splice(index, 1);
            localStorage.setItem(STORAGE_KEYS.likedSongs, JSON.stringify(liked));
            dispatchEvent('likechange', { liked: false, track });
            return false;
        } else {
            liked.unshift({ ...track, likedAt: Date.now() });
            localStorage.setItem(STORAGE_KEYS.likedSongs, JSON.stringify(liked));
            dispatchEvent('likechange', { liked: true, track });
            return true;
        }
    }

    // ========== RECENTLY PLAYED ==========
    function getRecentlyPlayed() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.recentlyPlayed)) || [];
        } catch (e) {
            return [];
        }
    }

    function addToRecentlyPlayed(track) {
        const recent = getRecentlyPlayed().filter(t => t.id !== track.id);
        recent.unshift({ ...track, playedAt: Date.now() });
        // Keep only last 50
        localStorage.setItem(STORAGE_KEYS.recentlyPlayed, JSON.stringify(recent.slice(0, 50)));
    }

    // ========== LYRICS ==========
    async function getLyrics(title, artist) {
        try {
            // Clean up title and artist for better matching
            const cleanTitle = title.replace(/\(.*?\)|\[.*?\]/g, '').trim();
            const cleanArtist = artist.replace(/- Topic$/i, '').trim();

            const url = `${LRCLIB_API}/search?q=${encodeURIComponent(cleanTitle + ' ' + cleanArtist)}`;
            const res = await fetch(url);
            if (!res.ok) return null;

            const results = await res.json();
            if (!results || results.length === 0) return null;

            // Get the first result with synced lyrics
            const withSynced = results.find(r => r.syncedLyrics);
            if (withSynced) {
                return {
                    synced: true,
                    lyrics: parseLRC(withSynced.syncedLyrics),
                    plain: withSynced.plainLyrics
                };
            }

            // Fall back to plain lyrics
            const withPlain = results.find(r => r.plainLyrics);
            if (withPlain) {
                return {
                    synced: false,
                    lyrics: null,
                    plain: withPlain.plainLyrics
                };
            }

            return null;
        } catch (e) {
            console.error('Lyrics error:', e);
            return null;
        }
    }

    // Parse LRC format
    function parseLRC(lrc) {
        if (!lrc) return [];

        const lines = lrc.split('\n');
        const parsed = [];

        for (const line of lines) {
            // Match [mm:ss.xx] or [mm:ss:xx]
            const match = line.match(/\[(\d{2}):(\d{2})[.:](\d{2,3})\](.*)/);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const ms = parseInt(match[3].padEnd(3, '0'));
                const time = minutes * 60 + seconds + ms / 1000;
                const text = match[4].trim();

                if (text) {
                    parsed.push({ time, text });
                }
            }
        }

        return parsed.sort((a, b) => a.time - b.time);
    }

    // ========== UTILITIES ==========
    function formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ========== GETTERS ==========
    function getCurrentTrack() {
        return currentTrack;
    }

    function getQueue() {
        return queue;
    }

    function getQueueIndex() {
        return queueIndex;
    }

    function getIsPlaying() {
        return isPlaying;
    }

    function getRepeatMode() {
        return repeatMode;
    }

    function getShuffleMode() {
        return shuffleMode;
    }

    function getCurrentTime() {
        return audio ? audio.currentTime : 0;
    }

    function getDuration() {
        return audio ? audio.duration : 0;
    }

    // Public API
    return {
        init,
        // Search
        search,
        getStreamUrl,
        // Playback
        play,
        pause,
        resume,
        togglePlay,
        seek,
        seekPercent,
        // Queue
        setQueue,
        addToQueue,
        removeFromQueue,
        clearQueue,
        playFromQueue,
        next,
        previous,
        // Volume
        setVolume,
        getVolume,
        mute,
        unmute,
        // Repeat/Shuffle
        setRepeatMode,
        toggleRepeat,
        toggleShuffle,
        // Playlists
        getPlaylists,
        createPlaylist,
        deletePlaylist,
        addToPlaylist,
        removeFromPlaylist,
        // Liked
        getLikedSongs,
        isLiked,
        toggleLike,
        // Recent
        getRecentlyPlayed,
        // Lyrics
        getLyrics,
        parseLRC,
        // Utilities
        formatDuration,
        // Getters
        getCurrentTrack,
        getQueue,
        getQueueIndex,
        getIsPlaying,
        getRepeatMode,
        getShuffleMode,
        getCurrentTime,
        getDuration
    };
})();

// Auto-initialize
window.VerdiMusic = VerdiMusic.init();
