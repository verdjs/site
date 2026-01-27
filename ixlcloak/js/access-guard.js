/**
 * IXL Access Guard
 * Protects the IXL page - redirects to auth page if user is not authenticated or in queue
 */
(function() {
    'use strict';

    // Wait for IXLAuth to be available
    function checkAccess() {
        if (typeof IXLAuth === 'undefined') {
            // IXLAuth not loaded yet, try again
            setTimeout(checkAccess, 100);
            return;
        }

        // Check if user is authenticated
        if (!IXLAuth.isAuthenticated()) {
            console.log('User not authenticated, redirecting to auth page...');
            window.location.href = '/ixlcloak/auth.html';
            return;
        }

        // Check if user has access (not in queue)
        if (!IXLAuth.hasAccess()) {
            console.log('User in queue, redirecting to auth page...');
            window.location.href = '/ixlcloak/auth.html';
            return;
        }

        // User is authenticated and has access
        console.log('IXL Access granted');
        
        // Add logout functionality
        addLogoutButton();
    }

    function addLogoutButton() {
        // Create a floating logout button
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'ixl-logout-btn';
        logoutBtn.innerHTML = '🚪 Logout';
        logoutBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 999999;
            padding: 8px 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transition: all 0.3s;
        `;

        logoutBtn.addEventListener('mouseenter', () => {
            logoutBtn.style.transform = 'translateY(-2px)';
            logoutBtn.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
        });

        logoutBtn.addEventListener('mouseleave', () => {
            logoutBtn.style.transform = 'translateY(0)';
            logoutBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        });

        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                IXLAuth.logout();
                window.location.href = '/ixlcloak/auth.html';
            }
        });

        document.body.appendChild(logoutBtn);
    }

    // Start the access check
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAccess);
    } else {
        checkAccess();
    }
})();
