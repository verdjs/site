/**
 * Verdis Music Mini Player Widget
 * Floating player that persists across page navigation
 */

(function () {
    // Only run in main page context, not in iframes
    if (window.self !== window.top) return;

    // Wait for VerdiMusic to be available
    function waitForMusic(callback) {
        if (window.VerdiMusic) {
            callback();
        } else {
            setTimeout(() => waitForMusic(callback), 100);
        }
    }

    waitForMusic(init);

    function init() {
        createWidget();
        attachEvents();

        // Initial state
        const track = VerdiMusic.getCurrentTrack();
        if (track && VerdiMusic.getIsPlaying()) {
            showWidget();
            updateWidget(track);
        }
    }

    function createWidget() {
        // Check if widget already exists
        if (document.getElementById('musicMiniPlayer')) return;

        const widget = document.createElement('div');
        widget.id = 'musicMiniPlayer';
        widget.className = 'music-mini-player';
        widget.innerHTML = `
            <!-- Collapsed view (just album art circle) -->
            <div class="mini-player-collapsed">
                <img id="miniCollapsedCover" src="/assets/img/fav.png" alt="">
            </div>
            
            <!-- Expanded view -->
            <div class="mini-player-expanded">
                <div class="mini-now-playing">
                    <div class="cover">
                        <img id="miniCover" src="/assets/img/fav.png" alt="">
                    </div>
                    <div class="info">
                        <div class="title" id="miniTitle">Not Playing</div>
                        <div class="artist" id="miniArtist">-</div>
                    </div>
                    <button class="collapse-btn" onclick="toggleMiniCollapse()">
                        <i class="ri-subtract-line"></i>
                    </button>
                </div>
                
                <div class="mini-controls">
                    <button class="mini-control-btn" onclick="VerdiMusic.previous()">
                        <i class="ri-skip-back-fill"></i>
                    </button>
                    <button class="mini-play-btn" id="miniPlayBtn" onclick="VerdiMusic.togglePlay()">
                        <i class="ri-play-fill"></i>
                    </button>
                    <button class="mini-control-btn" onclick="VerdiMusic.next()">
                        <i class="ri-skip-forward-fill"></i>
                    </button>
                </div>
                
                <div class="mini-progress">
                    <div class="mini-progress-fill" id="miniProgressFill"></div>
                </div>
            </div>
        `;

        document.body.appendChild(widget);

        // Make collapse function global
        window.toggleMiniCollapse = function () {
            widget.classList.toggle('collapsed');
        };

        // Click on collapsed to expand
        widget.querySelector('.mini-player-collapsed').addEventListener('click', () => {
            widget.classList.remove('collapsed');
        });
    }

    function attachEvents() {
        window.addEventListener('verdimusic:trackchange', (e) => {
            if (e.detail.track) {
                showWidget();
                updateWidget(e.detail.track);
            }
        });

        window.addEventListener('verdimusic:play', () => {
            showWidget();
            const icon = document.querySelector('#miniPlayBtn i');
            if (icon) icon.className = 'ri-pause-fill';
        });

        window.addEventListener('verdimusic:pause', () => {
            const icon = document.querySelector('#miniPlayBtn i');
            if (icon) icon.className = 'ri-play-fill';
        });

        window.addEventListener('verdimusic:timeupdate', (e) => {
            const { currentTime, duration } = e.detail;
            if (duration) {
                const percent = (currentTime / duration) * 100;
                const fill = document.getElementById('miniProgressFill');
                if (fill) fill.style.width = percent + '%';
            }
        });

        window.addEventListener('verdimusic:ended', () => {
            // Optionally hide when playback ends
        });
    }

    function showWidget() {
        const widget = document.getElementById('musicMiniPlayer');
        if (widget) {
            widget.classList.add('visible');
        }
    }

    function hideWidget() {
        const widget = document.getElementById('musicMiniPlayer');
        if (widget) {
            widget.classList.remove('visible');
        }
    }

    function updateWidget(track) {
        const miniCover = document.getElementById('miniCover');
        const miniCollapsedCover = document.getElementById('miniCollapsedCover');
        const miniTitle = document.getElementById('miniTitle');
        const miniArtist = document.getElementById('miniArtist');

        if (miniCover) miniCover.src = track.thumbnail || '/assets/img/fav.png';
        if (miniCollapsedCover) miniCollapsedCover.src = track.thumbnail || '/assets/img/fav.png';
        if (miniTitle) miniTitle.textContent = track.title;
        if (miniArtist) miniArtist.textContent = track.artist;

        // Update play/pause icon
        const icon = document.querySelector('#miniPlayBtn i');
        if (icon) {
            icon.className = VerdiMusic.getIsPlaying() ? 'ri-pause-fill' : 'ri-play-fill';
        }
    }

    // Expose functions for external control
    window.MusicWidget = {
        show: showWidget,
        hide: hideWidget,
        update: updateWidget
    };
})();
