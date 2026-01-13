// Fake Error Overlay Manager
(function() {
    'use strict';

    const STORAGE_KEY = 'verdis_fakeErrorShown';
    const ERROR_HTML = `<!DOCTYPE html>
<!-- saved from url=(0029)chrome-error://chromewebdata/ -->
<html dir="ltr" lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#fff">
  <meta name="viewport" content="width=device-width, initial-scale=1.0,
                                 maximum-scale=1.0, user-scalable=no">
  <title>Site unreachable</title>
  <style>
    /* Copyright 2017 The Chromium Authors
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file. */

    a {
      color: var(--link-color);
    }

    body {
      --background-color: #fff;
      --error-code-color: var(--google-gray-700);
      --google-blue-50: rgb(232, 240, 254);
      --google-blue-100: rgb(210, 227, 252);
      --google-blue-300: rgb(138, 180, 248);
      --google-blue-600: rgb(26, 115, 232);
      --google-blue-700: rgb(25, 103, 210);
      --google-gray-100: rgb(241, 243, 244);
      --google-gray-300: rgb(218, 220, 224);
      --google-gray-500: rgb(154, 160, 166);
      --google-gray-50: rgb(248, 249, 250);
      --google-gray-600: rgb(128, 134, 139);
      --google-gray-700: rgb(95, 99, 104);
      --google-gray-800: rgb(60, 64, 67);
      --google-gray-900: rgb(32, 33, 36);
      --heading-color: var(--google-gray-900);
      --link-color: rgb(88, 88, 88);
      --primary-button-fill-color-active: var(--google-blue-700);
      --primary-button-fill-color: var(--google-blue-600);
      --primary-button-text-color: #fff;
      --quiet-background-color: rgb(247, 247, 247);
      --secondary-button-border-color: var(--google-gray-500);
      --secondary-button-fill-color: #fff;
      --secondary-button-hover-border-color: var(--google-gray-600);
      --secondary-button-hover-fill-color: var(--google-gray-50);
      --secondary-button-text-color: var(--google-gray-700);
      --small-link-color: var(--google-gray-700);
      --text-color: var(--google-gray-700);
      background: var(--background-color);
      color: var(--text-color);
      word-wrap: break-word;
      margin: 0;
      padding: 0;
    }

    .nav-wrapper .secondary-button {
      background: var(--secondary-button-fill-color);
      border: 1px solid var(--secondary-button-border-color);
      color: var(--secondary-button-text-color);
      float: none;
      margin: 0;
      padding: 8px 16px;
    }

    .hidden {
      display: none;
    }

    html {
      -webkit-text-size-adjust: 100%;
      font-size: 125%;
    }

    .icon {
      background-repeat: no-repeat;
      background-size: 100%;
    }

    @media (prefers-color-scheme: dark) {
      body {
        --background-color: var(--google-gray-900);
        --error-code-color: var(--google-gray-500);
        --heading-color: var(--google-gray-500);
        --link-color: var(--google-blue-300);
        --primary-button-fill-color-active: rgb(129, 162, 208);
        --primary-button-fill-color: var(--google-blue-300);
        --primary-button-text-color: var(--google-gray-900);
        --quiet-background-color: var(--background-color);
        --secondary-button-border-color: var(--google-gray-700);
        --secondary-button-fill-color: var(--google-gray-900);
        --secondary-button-hover-fill-color: rgb(48, 51, 57);
        --secondary-button-text-color: var(--google-blue-300);
        --small-link-color: var(--google-blue-300);
        --text-color: var(--google-gray-500);
      }
    }

    button {
      border: 0;
      border-radius: 20px;
      box-sizing: border-box;
      color: var(--primary-button-text-color);
      cursor: pointer;
      float: right;
      font-size: .875em;
      margin: 0;
      padding: 8px 16px;
      transition: box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
    }

    [dir='rtl'] button {
      float: left;
    }

    .neterror button {
      background: var(--primary-button-fill-color);
    }

    button:active {
      background: var(--primary-button-fill-color-active);
      outline: 0;
    }

    .error-code {
      color: var(--error-code-color);
      font-size: .8em;
      margin-top: 12px;
      text-transform: uppercase;
    }

    h1 {
      color: var(--heading-color);
      font-size: 1.6em;
      font-weight: normal;
      line-height: 1.25em;
      margin-bottom: 16px;
    }

    .icon {
      height: 72px;
      margin: 0 0 40px;
      width: 72px;
    }

    .interstitial-wrapper {
      box-sizing: border-box;
      font-size: 1em;
      line-height: 1.6em;
      margin: 14vh auto 0;
      max-width: 600px;
      width: 100%;
    }

    #main-message>p {
      display: inline;
    }

    .nav-wrapper {
      margin-top: 51px;
    }

    .nav-wrapper::after {
      clear: both;
      content: '';
      display: table;
      width: 100%;
    }

    .small-link {
      color: var(--small-link-color);
      font-size: .875em;
    }

    .icon-generic {
      content: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABIAQMAAABvIyEEAAAABlBMVEUAAABTU1OoaSf/AAAAAXRSTlMAQObYZgAAAENJREFUeF7tzbEJACEQRNGBLeAasBCza2lLEGx0CxFGG9hBMDDxRy/72O9FMnIFapGylsu1fgoBdkXfUHLrQgdfrlJN1BdYBjQQm3UAAAAASUVORK5CYII=);
    }

    #suggestions-list a {
      color: var(--google-blue-600);
    }

    #suggestions-list p {
      margin-block-end: 0;
    }

    #suggestions-list ul {
      margin-top: 0;
    }

    .single-suggestion {
      list-style-type: none;
      padding-inline-start: 0;
    }

    @media (max-width: 700px) {
      .interstitial-wrapper {
        padding: 0 10%;
      }
    }

    @media (max-width: 420px) {
      button,
      [dir='rtl'] button,
      .small-link {
        float: none;
        font-size: .825em;
        font-weight: 500;
        margin: 0;
        width: 100%;
      }

      button {
        padding: 16px 24px;
      }

      #details {
        margin: 20px 0 20px 0;
      }

      #details p:not(:first-of-type) {
        margin-top: 10px;
      }

      .secondary-button:not(.hidden) {
        display: block;
        margin-top: 20px;
        text-align: center;
        width: 100%;
      }

      .interstitial-wrapper {
        padding: 0 5%;
      }

      .nav-wrapper {
        margin-top: 30px;
      }
    }

    #details {
      margin: 0 0 50px;
    }

    #details p:not(:first-of-type) {
      margin-top: 20px;
    }

    .suggestion-header {
      font-weight: bold;
      margin-bottom: 4px;
    }

    .suggestion-body {
      color: #777;
    }

    #details-button {
      box-shadow: none;
      min-width: 0;
    }

    .suggested-left>#control-buttons,
    .suggested-right>#details-button {
      float: left;
    }

    .suggested-right>#control-buttons,
    .suggested-left>#details-button {
      float: right;
    }

    .suggested-left .secondary-button {
      margin-inline-end: 0;
      margin-inline-start: 16px;
    }

    #details-button.singular {
      float: none;
    }

    #buttons::after {
      clear: both;
      content: '';
      display: block;
      width: 100%;
    }
  </style>
</head>

<body class="neterror" style="font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 75%">
  <div id="content">
    <div id="main-frame-error" class="interstitial-wrapper">
      <div id="main-content">
        <div class="icon icon-generic"></div>
        <div id="main-message">
          <h1>
            <span>This site can't be reached</span>
          </h1>
          <p><strong id="url">${window.location.origin}</strong> took too long to respond.</p>

          <div id="suggestions-list">
            <p>Try:</p>
            <ul class="">
              <li>Checking the connection</li>
              <li><a href="#buttons" onclick="event.preventDefault(); window.FakeErrorOverlay.hideOverlay()">Checking the proxy and the firewall</a></li>
            </ul>
          </div>

          <div class="error-code">ERR_TIMED_OUT</div>
        </div>
      </div>
      <div id="buttons" class="nav-wrapper suggested-left">
        <div id="control-buttons">
          <button id="reload-button" class="blue-button text-button" onclick="event.preventDefault(); window.FakeErrorOverlay.hideOverlay()">
            Reload
          </button>
        </div>
        <button id="details-button" class="secondary-button text-button small-link" onclick="event.preventDefault(); document.getElementById('details').classList.toggle('hidden')">
          Details
        </button>
      </div>
      <div id="details" class="hidden">
        <div class="suggestions">
          <div class="suggestion-header">Check your Internet connection</div>
          <div class="suggestion-body">Check any cables and reboot any routers, modems, or other network devices you may be using.</div>
        </div>
        <div class="suggestions">
          <div class="suggestion-header">Allow Brave to access the network in your firewall or antivirus settings.</div>
          <div class="suggestion-body">If it is already listed as a program allowed to access the network, try removing it from the list and adding it again.</div>
        </div>
        <div class="suggestions">
          <div class="suggestion-header">If you use a proxy server…</div>
          <div class="suggestion-body">Go to the Brave menu &gt; <span>Settings</span> &gt; <span>System</span> &gt; <span>Open your computer's proxy settings</span> &gt; Network & internet &gt; Proxy and deselect "Automatically detect settings".</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

    // Fake Error Overlay Manager
    window.FakeErrorOverlay = {
        overlayElement: null,
        originalTitle: document.title,
        originalIcon: null,
        isFirstTime: false,

        init: function() {
            // Check if this is the first time
            if (!localStorage.getItem(STORAGE_KEY)) {
                this.isFirstTime = true;
                localStorage.setItem(STORAGE_KEY, 'true');
                this.showFirstTimeNotice();
            }

            // Create overlay element
            this.createOverlay();
            
            // Save original icon
            this.saveOriginalIcon();

            // Set up blur event listener
            window.addEventListener('blur', () => this.showOverlay());
            window.addEventListener('focus', () => {
                // Optional: you could auto-hide on focus if desired
                // this.hideOverlay();
            });

            // Set tab title to "Site unreachable" immediately
            this.setUnreachableTitle();
        },

        createOverlay: function() {
            if (this.overlayElement) return;

            this.overlayElement = document.createElement('div');
            this.overlayElement.id = 'fake-error-overlay';
            this.overlayElement.innerHTML = ERROR_HTML;
            document.body.appendChild(this.overlayElement);
        },

        showOverlay: function() {
            if (!this.overlayElement) return;
            
            this.overlayElement.classList.add('show');
            this.setUnreachableTitle();
        },

        hideOverlay: function() {
            if (!this.overlayElement) return;
            
            this.overlayElement.classList.remove('show');
            // Restore original title
            document.title = this.originalTitle;
            if (this.originalIcon) {
                this.restoreOriginalIcon();
            }
        },

        setUnreachableTitle: function() {
            document.title = 'Site unreachable';
            
            // Remove all existing favicons
            const links = document.querySelectorAll('link[rel*="icon"]');
            links.forEach(link => link.remove());
            
            // Don't add any icon (no icon requirement)
        },

        saveOriginalIcon: function() {
            const iconLink = document.querySelector('link[rel*="icon"]');
            if (iconLink) {
                this.originalIcon = {
                    rel: iconLink.rel,
                    href: iconLink.href,
                    type: iconLink.type
                };
            }
        },

        restoreOriginalIcon: function() {
            if (!this.originalIcon) return;

            const link = document.createElement('link');
            link.rel = this.originalIcon.rel;
            link.href = this.originalIcon.href;
            if (this.originalIcon.type) {
                link.type = this.originalIcon.type;
            }
            document.head.appendChild(link);
        },

        showFirstTimeNotice: function() {
            const notice = document.createElement('div');
            notice.id = 'first-time-notice';
            notice.innerHTML = `
                <div>
                    <strong>Fake Error Screen Activated!</strong>
                    <p style="margin: 10px 0;">From now on, when you click away from this page, a fake error screen will appear.</p>
                    <p style="margin: 10px 0;">To dismiss it, click on "<strong>Checking the proxy and the firewall</strong>" or the "<strong>Reload</strong>" button.</p>
                    <button onclick="this.parentElement.parentElement.remove()">Got it!</button>
                </div>
            `;
            document.body.appendChild(notice);

            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (notice.parentElement) {
                    notice.remove();
                }
            }, 10000);
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.FakeErrorOverlay.init();
        });
    } else {
        window.FakeErrorOverlay.init();
    }
})();
