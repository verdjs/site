/**
 * IXL Authentication Module
 * Handles user authentication for the IXL page using Supabase
 */

const IXLAuth = (() => {
    // Use the existing Supabase client from supabase-client.js
    // If you want separate credentials, update these:
    const SUPABASE_URL = 'https://tdhcdcafkdpctzsdplyi.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGNkY2Fma2RwY3R6c2RwbHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTY4NjEsImV4cCI6MjA4MTgzMjg2MX0.tsQQ7MvlMWicF2hbxj8AvoZ3Wv6dCbjtmS7CB_MIVUg';

    let _client = null;
    let _currentUser = null;

    // Session storage key (will be cleared on refresh as required)
    const SESSION_KEY = 'ixl_session';

    function init() {
        if (typeof supabase === 'undefined') {
            console.warn('Supabase SDK not loaded for IXL Auth.');
            return false;
        }
        
        _client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('IXL Auth Initialized');
        
        // Clear session on page load (sign out on refresh)
        sessionStorage.removeItem(SESSION_KEY);
        
        return true;
    }

    /**
     * Register a new user
     * @param {string} username 
     * @param {string} password 
     * @param {string} email (optional)
     * @returns {Promise<{success: boolean, user?: object, error?: string}>}
     */
    async function register(username, password, email = null) {
        if (!_client) {
            return { success: false, error: 'Authentication not initialized' };
        }

        if (!username || !password) {
            return { success: false, error: 'Username and password are required' };
        }

        if (password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' };
        }

        try {
            const { data, error } = await _client.rpc('register_user', {
                p_username: username,
                p_password: password,
                p_email: email
            });

            if (error) {
                console.error('Registration error:', error);
                if (error.message.includes('duplicate key')) {
                    return { success: false, error: 'Username already exists' };
                }
                return { success: false, error: error.message };
            }

            if (data && data.length > 0) {
                const user = data[0];
                return { 
                    success: true, 
                    user: {
                        id: user.user_id,
                        username: user.username,
                        inQueue: user.in_queue,
                        queuePosition: user.queue_position
                    }
                };
            }

            return { success: false, error: 'Registration failed' };
        } catch (err) {
            console.error('Registration exception:', err);
            return { success: false, error: err.message };
        }
    }

    /**
     * Login with username and password
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<{success: boolean, user?: object, error?: string}>}
     */
    async function login(username, password) {
        if (!_client) {
            return { success: false, error: 'Authentication not initialized' };
        }

        if (!username || !password) {
            return { success: false, error: 'Username and password are required' };
        }

        try {
            const { data, error } = await _client.rpc('check_user_credentials', {
                p_username: username,
                p_password: password
            });

            if (error) {
                console.error('Login error:', error);
                return { success: false, error: 'Invalid credentials' };
            }

            if (data && data.length > 0) {
                const user = data[0];
                _currentUser = {
                    id: user.user_id,
                    username: user.username,
                    inQueue: user.in_queue,
                    queuePosition: user.queue_position
                };

                // Store in session storage (will be cleared on refresh)
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(_currentUser));

                return { success: true, user: _currentUser };
            }

            return { success: false, error: 'Invalid credentials' };
        } catch (err) {
            console.error('Login exception:', err);
            return { success: false, error: err.message };
        }
    }

    /**
     * Get current user session
     * @returns {object|null} User object or null if not logged in
     */
    function getCurrentUser() {
        if (_currentUser) {
            return _currentUser;
        }

        // Try to restore from session storage
        const sessionData = sessionStorage.getItem(SESSION_KEY);
        if (sessionData) {
            try {
                _currentUser = JSON.parse(sessionData);
                return _currentUser;
            } catch (e) {
                console.error('Failed to parse session data:', e);
                sessionStorage.removeItem(SESSION_KEY);
            }
        }

        return null;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    function isAuthenticated() {
        return getCurrentUser() !== null;
    }

    /**
     * Check if user is in queue (waiting for approval)
     * @returns {boolean}
     */
    function isInQueue() {
        const user = getCurrentUser();
        return user ? user.inQueue : false;
    }

    /**
     * Check if user has access (not in queue)
     * @returns {boolean}
     */
    function hasAccess() {
        const user = getCurrentUser();
        return user ? !user.inQueue : false;
    }

    /**
     * Logout current user
     */
    function logout() {
        _currentUser = null;
        sessionStorage.removeItem(SESSION_KEY);
    }

    return {
        init,
        register,
        login,
        logout,
        getCurrentUser,
        isAuthenticated,
        isInQueue,
        hasAccess
    };
})();

// Initialize on load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.supabase) {
            IXLAuth.init();
        } else {
            setTimeout(() => IXLAuth.init(), 1000);
        }
    });
}
