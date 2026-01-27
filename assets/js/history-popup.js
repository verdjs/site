/**
 * ============================================
 * VERDIS HISTORY HIDING POPUP
 * Prompts users to hide site from browser history
 * ============================================
 */

const HistoryPopup = (() => {
    const STORAGE_KEY = 'verdis_historyPopupDismissed';
    const WALKTHROUGH_KEY = 'verdis_walkthroughComplete';
    const CLOAK_TITLE = 'IXL | Maths, English and Science Practice';
    const CLOAK_REDIRECT = 'https://ixl.com/au';

    let modal = null;
    let confirmationModal = null;
    let backdrop = null;

    /**
     * Initialize the history popup
     */
    function init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initPopup);
        } else {
            initPopup();
        }
    }

    /**
     * Initialize popup after DOM is ready
     */
    function initPopup() {
        modal = document.getElementById('historyPopupModal');
        confirmationModal = document.getElementById('historyConfirmationModal');

        if (!modal || !confirmationModal) {
            console.error('History popup modals not found');
            return;
        }

        // Check if we should show the popup
        if (shouldShowPopup()) {
            // Small delay to let the page load first
            setTimeout(() => {
                showPopup();
            }, 500);
        }
    }

    /**
     * Check if popup should be shown
     */
    function shouldShowPopup() {
        // Don't show if user already dismissed it
        if (localStorage.getItem(STORAGE_KEY) === 'true') {
            return false;
        }

        // Only show if walkthrough is complete
        const walkthroughComplete = localStorage.getItem(WALKTHROUGH_KEY) === 'true' || 
                                    hasWalkthroughCookie();

        return walkthroughComplete;
    }

    /**
     * Check for walkthrough completion cookie
     */
    function hasWalkthroughCookie() {
        if (!document.cookie) {
            return false;
        }

        return document.cookie.split(';').some(cookie => {
            const trimmed = cookie.trim();
            const equalIndex = trimmed.indexOf('=');
            if (equalIndex === -1) return false;
            
            const name = trimmed.slice(0, equalIndex);
            const value = trimmed.slice(equalIndex + 1);
            return name.startsWith(WALKTHROUGH_KEY) && value === 'true';
        });
    }

    /**
     * Show the popup with backdrop
     */
    function showPopup() {
        // Create backdrop if it doesn't exist
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'history-popup-backdrop settings-hidden';
            document.body.appendChild(backdrop);
        }

        // Show backdrop
        backdrop.classList.remove('settings-hidden');
        backdrop.classList.add('settings-shown');

        // Show modal
        modal.classList.remove('settings-hidden');
        modal.classList.add('settings-shown');
    }

    /**
     * Hide the popup
     */
    function hidePopup() {
        if (modal) {
            modal.classList.remove('settings-shown');
            modal.classList.add('settings-hidden');
        }

        if (backdrop) {
            backdrop.classList.remove('settings-shown');
            backdrop.classList.add('settings-hidden');
        }
    }

    /**
     * Show confirmation dialog
     */
    function showConfirmation() {
        // Hide main popup
        if (modal) {
            modal.classList.remove('settings-shown');
            modal.classList.add('settings-hidden');
        }

        // Show confirmation modal
        confirmationModal.classList.remove('settings-hidden');
        confirmationModal.classList.add('settings-shown');
    }

    /**
     * Hide confirmation dialog
     */
    function hideConfirmation() {
        if (confirmationModal) {
            confirmationModal.classList.remove('settings-shown');
            confirmationModal.classList.add('settings-hidden');
        }

        if (backdrop) {
            backdrop.classList.remove('settings-shown');
            backdrop.classList.add('settings-hidden');
        }
    }

    /**
     * Close popup with confirmation
     */
    function closeWithConfirmation() {
        showConfirmation();
    }

    /**
     * Hide from history - "Yes ofc" button
     */
    function hideHistory() {
        // Store that user chose to hide history
        localStorage.setItem(STORAGE_KEY, 'true');

        // Hide all modals
        hidePopup();
        hideConfirmation();

        // Small delay before opening about:blank
        setTimeout(() => {
            openInAboutBlank();
        }, 100);
    }

    /**
     * Acknowledge risks - "Yes I understand the risks" button
     */
    function acknowledgeRisks() {
        // Store that user dismissed the popup
        localStorage.setItem(STORAGE_KEY, 'true');

        // Hide all modals
        hideConfirmation();
    }

    /**
     * Open site in about:blank and redirect current tab
     */
    function openInAboutBlank() {
        // Don't run in iframes to prevent unexpected behavior in embedded contexts
        if (window.self !== window.top) return;

        const targetUrl = window.location.href;

        // Try to open about:blank window
        let cloakWin = window.open("about:blank", "_blank");
        let usedFallback = false;

        // Build the HTML for the about:blank page
        const buildBlobHtml = (url) => {
            const doc = document.implementation.createHTMLDocument(CLOAK_TITLE);
            doc.documentElement.lang = "en";
            
            const link = doc.createElement("link");
            link.rel = "icon";
            link.href = "https://www.ixl.com/dv3/ZjMyYmZiN/favicon.ico";
            doc.head.appendChild(link);

            doc.body.style.margin = "0";
            doc.body.style.overflow = "hidden";

            const iframe = doc.createElement("iframe");
            iframe.src = url;
            iframe.style.cssText = "width: 100%; height: 100%; border: 0;";
            doc.body.appendChild(iframe);

            return "<!doctype html>\n" + doc.documentElement.outerHTML;
        };

        // Fallback if popup blocker prevents opening
        if (!cloakWin) {
            const blobHtml = buildBlobHtml(targetUrl);
            const blob = new Blob([blobHtml], { type: "text/html" });
            const blobUrl = URL.createObjectURL(blob);
            cloakWin = window.open(blobUrl, "_blank");
            setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
            usedFallback = true;
        }

        if (!cloakWin) {
            // If popup blocked, use existing toast notification system instead of alert
            if (typeof showToast === 'function') {
                showToast("error", "Please allow popups for this site to use the history hiding feature.", "fas fa-exclamation-circle");
            } else {
                console.error("Popup blocked: Please allow popups for this site to use the history hiding feature.");
            }
            return;
        }

        try {
            // Set title and favicon
            cloakWin.document.title = CLOAK_TITLE;
            const link = cloakWin.document.createElement("link");
            link.rel = "icon";
            link.href = "https://www.ixl.com/dv3/ZjMyYmZiN/favicon.ico";
            cloakWin.document.head.appendChild(link);
        } catch (e) {
            // Cross-origin access errors are expected when popup blocker redirects
            console.debug("Cross-origin access prevented (expected behavior):", e.message);
        }

        if (!usedFallback) {
            // Create iframe with the site
            const iframe = cloakWin.document.createElement('iframe');
            iframe.style.cssText = 'width: 100%; height: 100%; border: none; margin: 0;';
            cloakWin.document.body.style.margin = '0';
            iframe.src = targetUrl;
            cloakWin.document.body.appendChild(iframe);
        }

        // Note: Fullscreen API is intentionally not used here because it requires
        // direct user interaction to work in modern browsers. The fullscreen request
        // would fail silently since this code runs after a user clicked a button
        // (indirect interaction). Users can manually fullscreen if desired using F11 or browser controls.

        // Redirect current tab to IXL (validates URL is HTTPS to prevent security issues)
        if (CLOAK_REDIRECT.startsWith('https://')) {
            window.location.replace(CLOAK_REDIRECT);
        } else {
            console.error("Invalid redirect URL - must be HTTPS");
        }
    }

    // Initialize on load
    init();

    // Public API
    return {
        showPopup,
        hidePopup,
        closeWithConfirmation,
        hideHistory,
        acknowledgeRisks
    };
})();
