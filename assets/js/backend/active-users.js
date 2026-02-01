/**
 * Active Users Tracking with Supabase Realtime
 * Tracks and displays real-time active user count
 */

const VerdisActiveUsers = (() => {
    let sessionId = null;
    let heartbeatInterval = null;
    let realtimeChannel = null;
    let isInitialized = false;

    // Generate a unique session ID for this browser session
    function generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    // Initialize the session
    async function init() {
        if (!VerdisBackend || !VerdisBackend.isConfigured()) {
            console.warn('VerdisBackend not configured. Active users tracking disabled.');
            console.warn('Showing fallback count of 0');
            // Set counter to 0 as fallback
            const userCountEl = document.getElementById('user-count');
            if (userCountEl) {
                userCountEl.textContent = '0';
            }
            return;
        }

        if (isInitialized) {
            console.log('Active users already initialized');
            return;
        }

        try {
            sessionId = generateSessionId();
            console.log('Initializing active users tracking with session:', sessionId);

            // Get Supabase client from VerdisBackend
            const client = VerdisBackend.getClient();
            if (!client) {
                console.error('Failed to get Supabase client - client is null');
                // Set counter to 0 as fallback
                const userCountEl = document.getElementById('user-count');
                if (userCountEl) {
                    userCountEl.textContent = '0';
                }
                return;
            }

            console.log('Supabase client obtained successfully');

            // Register this session
            await registerSession(client);

            // Set up heartbeat to keep session alive (every 20 seconds)
            heartbeatInterval = setInterval(() => updateHeartbeat(client), 20000);

            // Subscribe to realtime changes
            subscribeToActiveUsers(client);

            // Cleanup on page unload
            window.addEventListener('beforeunload', () => cleanup(client));
            window.addEventListener('pagehide', () => cleanup(client));

            // Initial count update
            await updateUserCount(client);

            isInitialized = true;
            console.log('Active users tracking initialized successfully');

        } catch (error) {
            console.error('Error initializing active users:', error);
            console.error('Error details:', error.message, error.stack);
            // Set counter to 0 as fallback on error
            const userCountEl = document.getElementById('user-count');
            if (userCountEl) {
                userCountEl.textContent = '0';
            }
        }
    }

    // Register this session in the database
    async function registerSession(client) {
        try {
            console.log('Registering session:', sessionId);
            const { data, error } = await client
                .from('active_users')
                .upsert({
                    session_id: sessionId,
                    last_seen: new Date().toISOString()
                }, {
                    onConflict: 'session_id'
                });

            if (error) {
                console.error('Error registering session:', error);
                console.error('Error message:', error.message);
                console.error('Error details:', error.details);
                console.error('Error hint:', error.hint);
                throw error;
            } else {
                console.log('Session registered successfully');
            }
        } catch (error) {
            console.error('Exception in registerSession:', error);
            throw error;
            console.error('Error in registerSession:', error);
        }
    }

    // Update heartbeat to keep session alive
    async function updateHeartbeat(client) {
        if (!sessionId) return;

        try {
            const { error } = await client
                .from('active_users')
                .update({ last_seen: new Date().toISOString() })
                .eq('session_id', sessionId);

            if (error) {
                console.error('Error updating heartbeat:', error);
            }
        } catch (error) {
            console.error('Error in updateHeartbeat:', error);
        }
    }

    // Subscribe to realtime changes on active_users table
    function subscribeToActiveUsers(client) {
        try {
            // Create a channel for realtime updates
            realtimeChannel = client
                .channel('active-users-changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
                        schema: 'public',
                        table: 'active_users'
                    },
                    (payload) => {
                        console.log('Active users change detected:', payload);
                        // Update count whenever there's a change
                        updateUserCount(client);
                    }
                )
                .subscribe((status) => {
                    console.log('Realtime subscription status:', status);
                });

        } catch (error) {
            console.error('Error subscribing to realtime:', error);
        }
    }

    // Update the user count display
    async function updateUserCount(client) {
        try {
            // Clean up stale sessions and get count
            const { data, error } = await client.rpc('get_active_user_count');

            if (error) {
                console.error('Error getting user count:', error);
                console.error('Error details:', error.message, error.hint, error.details);
                // Fallback to showing 0 on error
                const userCountEl = document.getElementById('user-count');
                if (userCountEl) {
                    userCountEl.textContent = '0';
                }
                return;
            }

            const count = data || 0;
            console.log('Active users count from database:', count);

            // Update the UI with the database count
            const userCountEl = document.getElementById('user-count');
            if (userCountEl) {
                userCountEl.textContent = count;
                console.log('Displaying count:', count);
            }

        } catch (error) {
            console.error('Error updating user count:', error);
            // Fallback to showing 0 on exception
            const userCountEl = document.getElementById('user-count');
            if (userCountEl) {
                userCountEl.textContent = '0';
            }
        }
    }

    // Cleanup when user leaves
    async function cleanup(client) {
        if (!sessionId) return;

        try {
            // Remove this session from the database
            await client
                .from('active_users')
                .delete()
                .eq('session_id', sessionId);

            // Clear heartbeat interval
            if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
                heartbeatInterval = null;
            }

            // Unsubscribe from realtime
            if (realtimeChannel) {
                await client.removeChannel(realtimeChannel);
                realtimeChannel = null;
            }

            console.log('Session cleaned up');
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    // Public API
    return {
        init,
        isInitialized: () => isInitialized
    };
})();

// Initialize when DOM is ready and backend is configured
// Listen for a custom event from VerdisBackend when it's ready
document.addEventListener('VerdisBackendReady', () => {
    console.log('VerdisBackend ready, initializing active users tracking');
    VerdisActiveUsers.init();
});

// Fallback: Also try after a delay in case the event was missed
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!VerdisActiveUsers.isInitialized()) {
            console.log('Fallback: Attempting to initialize active users tracking');
            VerdisActiveUsers.init();
        }
    }, 2000);
});
