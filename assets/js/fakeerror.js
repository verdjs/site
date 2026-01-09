/**
 * Fake Chrome Error Screen
 * Triggers when user clicks away from the tab
 */

window.VerdisFakeError = (() => {
    let originalTitle = '';
    let originalFavicon = '';
    let isErrorShowing = false;

    // Save original title and favicon
    function saveOriginals() {
        originalTitle = document.title;
        const faviconEl = document.querySelector('link[rel="icon"]');
        if (faviconEl) {
            originalFavicon = faviconEl.href;
        }
    }

    // Change to error state
    function setErrorState() {
        document.title = 'Failed to load';
        const faviconEl = document.querySelector('link[rel="icon"]');
        if (faviconEl) {
            faviconEl.href = 'data:image/x-icon;base64,';
        }
    }

    // Restore original state
    function restoreOriginalState() {
        document.title = originalTitle;
        const faviconEl = document.querySelector('link[rel="icon"]');
        if (faviconEl && originalFavicon) {
            faviconEl.href = originalFavicon;
        }
    }

    // Create error overlay HTML
    function createErrorOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'chrome-fake-error-overlay';
        overlay.innerHTML = `
            <div class="chrome-error-container">
                <div class="chrome-error-icon">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#DADCE0" stroke-width="3"/>
                        <path d="M50 30 L50 55" stroke="#5F6368" stroke-width="3" stroke-linecap="round"/>
                        <circle cx="50" cy="68" r="3" fill="#5F6368"/>
                    </svg>
                </div>
                <h1 class="chrome-error-title">This site can't be reached</h1>
                <p class="chrome-error-message">The webpage at <strong>${window.location.href}</strong> might be temporarily down or it may have moved permanently to a new web address.</p>
                <p class="chrome-error-code">ERR_CONNECTION_REFUSED</p>
                <button class="chrome-error-reload-button" onclick="VerdisFakeError.dismissError()">Reload</button>
                <div class="chrome-error-details">
                    <details>
                        <summary>More information</summary>
                        <p>This page isn't working right now. If the problem continues, contact the site owner.</p>
                    </details>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    // Create CSS styles
    function injectStyles() {
        const style = document.createElement('style');
        style.id = 'chrome-fake-error-styles';
        style.textContent = `
            #chrome-fake-error-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #ffffff;
                z-index: 999999;
                display: none;
                align-items: center;
                justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }

            #chrome-fake-error-overlay.show {
                display: flex;
            }

            .chrome-error-container {
                max-width: 600px;
                padding: 40px 20px;
                text-align: center;
            }

            .chrome-error-icon {
                margin-bottom: 30px;
            }

            .chrome-error-title {
                font-size: 24px;
                font-weight: 400;
                color: #202124;
                margin: 0 0 16px 0;
            }

            .chrome-error-message {
                font-size: 14px;
                color: #5F6368;
                line-height: 1.6;
                margin: 0 0 24px 0;
            }

            .chrome-error-message strong {
                color: #202124;
                font-weight: 400;
            }

            .chrome-error-code {
                font-size: 13px;
                color: #5F6368;
                margin: 0 0 24px 0;
                font-family: monospace;
            }

            .chrome-error-reload-button {
                background: #1a73e8;
                color: white;
                border: none;
                padding: 10px 24px;
                font-size: 14px;
                font-weight: 500;
                border-radius: 4px;
                cursor: pointer;
                margin-bottom: 24px;
                transition: background 0.2s;
            }

            .chrome-error-reload-button:hover {
                background: #1765cc;
            }

            .chrome-error-reload-button:active {
                background: #1557b0;
            }

            .chrome-error-details {
                margin-top: 32px;
            }

            .chrome-error-details details {
                text-align: left;
                display: inline-block;
            }

            .chrome-error-details summary {
                color: #1a73e8;
                font-size: 14px;
                cursor: pointer;
                padding: 8px 0;
                list-style: none;
            }

            .chrome-error-details summary::-webkit-details-marker {
                display: none;
            }

            .chrome-error-details summary::before {
                content: '▶ ';
                display: inline-block;
                transition: transform 0.2s;
            }

            .chrome-error-details details[open] summary::before {
                transform: rotate(90deg);
            }

            .chrome-error-details p {
                font-size: 13px;
                color: #5F6368;
                margin: 8px 0 0 20px;
                padding: 0;
            }
        `;
        document.head.appendChild(style);
    }

    // Show error
    function showError() {
        if (isErrorShowing) return;
        
        isErrorShowing = true;
        setErrorState();
        
        const overlay = document.getElementById('chrome-fake-error-overlay');
        if (overlay) {
            overlay.classList.add('show');
        }
    }

    // Dismiss error
    function dismissError() {
        isErrorShowing = false;
        restoreOriginalState();
        
        const overlay = document.getElementById('chrome-fake-error-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    // Initialize
    function init() {
        saveOriginals();
        injectStyles();
        createErrorOverlay();

        // Listen for blur event (when user clicks away from tab)
        window.addEventListener('blur', () => {
            if (!isErrorShowing) {
                showError();
            }
        });

        // Also listen for visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && !isErrorShowing) {
                showError();
            }
        });
    }

    // Public API
    return {
        init,
        showError,
        dismissError
    };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => VerdisFakeError.init());
} else {
    VerdisFakeError.init();
}
