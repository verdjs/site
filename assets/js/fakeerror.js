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
                <p class="chrome-error-message"><strong>${window.location.hostname}</strong> unexpectedly closed the connection.</p>
                <p class="chrome-error-suggestion">Try:</p>
                <ul class="chrome-error-list">
                    <li>Checking the connection</li>
                    <li>Checking the proxy and the firewall</li>
                </ul>
                <p class="chrome-error-code">ERR_CONNECTION_CLOSED</p>
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
                font-family: 'Segoe UI', Tahoma, sans-serif;
            }

            #chrome-fake-error-overlay.show {
                display: flex;
            }

            .chrome-error-container {
                max-width: 600px;
                padding: 40px 20px;
                text-align: left;
            }

            .chrome-error-icon {
                margin-bottom: 32px;
                text-align: center;
            }

            .chrome-error-title {
                font-size: 32px;
                font-weight: 400;
                color: #202124;
                margin: 0 0 16px 0;
                letter-spacing: 0;
            }

            .chrome-error-message {
                font-size: 16px;
                color: #5f6368;
                line-height: 1.5;
                margin: 0 0 24px 0;
            }

            .chrome-error-message strong {
                color: #202124;
                font-weight: 600;
            }

            .chrome-error-suggestion {
                font-size: 16px;
                color: #5f6368;
                margin: 0 0 8px 0;
            }

            .chrome-error-list {
                font-size: 16px;
                color: #5f6368;
                margin: 0 0 24px 0;
                padding-left: 20px;
            }

            .chrome-error-list li {
                margin: 4px 0;
            }

            .chrome-error-code {
                font-size: 14px;
                color: #80868b;
                margin: 0 0 32px 0;
                font-family: 'Consolas', 'Courier New', monospace;
                letter-spacing: 0.5px;
            }

            .chrome-error-reload-button {
                background: #1a73e8;
                color: white;
                border: none;
                padding: 9px 24px;
                font-size: 14px;
                font-weight: 500;
                border-radius: 4px;
                cursor: pointer;
                margin-bottom: 32px;
                transition: background 0.2s;
                font-family: 'Segoe UI', Tahoma, sans-serif;
                letter-spacing: 0.25px;
            }

            .chrome-error-reload-button:hover {
                background: #1765cc;
                box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
            }

            .chrome-error-reload-button:active {
                background: #1557b0;
                box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15);
            }

            .chrome-error-details {
                margin-top: 32px;
            }

            .chrome-error-details details {
                text-align: left;
            }

            .chrome-error-details summary {
                color: #1a73e8;
                font-size: 14px;
                cursor: pointer;
                padding: 8px 0;
                list-style: none;
                outline: none;
            }

            .chrome-error-details summary::-webkit-details-marker {
                display: none;
            }

            .chrome-error-details summary::before {
                content: '▸';
                display: inline-block;
                margin-right: 6px;
                transition: transform 0.2s;
                font-size: 12px;
            }

            .chrome-error-details details[open] summary::before {
                transform: rotate(90deg);
            }

            .chrome-error-details p {
                font-size: 14px;
                color: #5F6368;
                margin: 12px 0 0 18px;
                padding: 0;
                line-height: 1.5;
            }

            /* Hide navbar when error is shown */
            body.chrome-error-active #main-nav,
            body.chrome-error-active nav {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Show error
    function showError() {
        if (isErrorShowing) return;
        
        isErrorShowing = true;
        setErrorState();
        
        // Hide navbar
        document.body.classList.add('chrome-error-active');
        
        const overlay = document.getElementById('chrome-fake-error-overlay');
        if (overlay) {
            overlay.classList.add('show');
        }
    }

    // Dismiss error
    function dismissError() {
        isErrorShowing = false;
        restoreOriginalState();
        
        // Show navbar again
        document.body.classList.remove('chrome-error-active');
        
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
