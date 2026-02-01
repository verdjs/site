
/**
 * Supabase Client for Verdis
 * Handles connection to the backend database for reviews and stats.
 */

const VerdisBackend = (() => {
    // HOSTED ON SUPABASE - FREE TIER
    // PLACEHOLDERS - User needs to replace these!
    const SUPABASE_URL = 'https://tdhcdcafkdpctzsdplyi.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGNkY2Fma2RwY3R6c2RwbHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTY4NjEsImV4cCI6MjA4MTgzMjg2MX0.tsQQ7MvlMWicF2hbxj8AvoZ3Wv6dCbjtmS7CB_MIVUg';

    let _client = null;

    function init() {
        if (typeof supabase === 'undefined') {
            console.warn('Supabase SDK not loaded.');
            return;
        }
        if (SUPABASE_URL.includes('YOUR_SUPABASE')) {
            console.warn('Backend not configured: Missing Supabase URL/Key.');
            return;
        }
        _client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Verdis Backend Initialized');
        
        // Dispatch event to notify other modules that backend is ready
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('VerdisBackendReady'));
        }, 100);
    }

    // --- REVIEWS API ---

    async function getReviews(gameId) {
        if (!_client) return [];
        const { data, error } = await _client
            .from('reviews')
            .select('*')
            .eq('game_id', gameId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
        return data;
    }

    async function submitReview(gameId, rating, comment, username = 'Anonymous') {
        if (!_client) return { error: 'Backend not configured' };

        console.log('Submitting review:', { gameId, rating, comment, username });

        const { data, error } = await _client
            .from('reviews')
            .insert([
                {
                    game_id: gameId,
                    rating: rating,
                    comment: comment,
                    user_name: username
                }
            ]);

        if (error) {
            console.error('Supabase Error:', error.message, error.details, error.hint);
            return { error };
        }

        // Update game stats (fire and forget)
        updateGameStats(gameId, rating);

        return { data };
    }

    // --- STATS API ---

    async function trackPlay(gameId, gameName = '') {
        if (!_client) return;

        try {
            // First try to increment existing game
            const { data: existing } = await _client
                .from('games')
                .select('play_count')
                .eq('id', gameId)
                .single();

            if (existing) {
                // Game exists - increment play count
                await _client
                    .from('games')
                    .update({ play_count: (existing.play_count || 0) + 1 })
                    .eq('id', gameId);
            } else {
                // Game doesn't exist - insert new
                await _client
                    .from('games')
                    .insert([{ id: gameId, name: gameName || gameId, play_count: 1 }]);
            }
        } catch (e) {
            console.error('Error tracking play:', e);
        }
    }

    async function getMostPlayed(days = 7) {
        if (!_client) return [];

        // This relies on a view or calculation. 
        // Simpler approach: Get top games by play_count from 'games' table
        const { data, error } = await _client
            .from('games')
            .select('*')
            .order('play_count', { ascending: false })
            .limit(10);

        if (error) return [];
        return data;
    }

    // Internal helper to update aggregated game stats
    async function updateGameStats(gameId, newRating) {
        // This is complex to do client-side securely. 
        // Ideally done via Postgres Triggers.
        // We will leave this to the "Advanced Setup" SQL script.
    }

    return {
        init,
        getReviews,
        submitReview,
        trackPlay,
        getMostPlayed,
        isConfigured: () => _client !== null,
        getClient: () => _client
    };
})();

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // We need to ensure Supabase JS SDK is loaded first
    // It will be added to index.html
    if (window.supabase) {
        VerdisBackend.init();
    } else {
        // Wait a bit or check again? 
        // Usually deferred scripts run in order.
        setTimeout(() => VerdisBackend.init(), 1000);
    }
});
