/**
 * Verdis Favorites System
 * Manage favorites/bookmarks for games, apps, and movies
 */

const VerdiFavorites = (function () {
    const STORAGE_KEY = 'verdis_favorites';

    // Initialize favorites structure
    function getAll() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) {
                return { games: [], apps: [], movies: [] };
            }
            return JSON.parse(data);
        } catch (e) {
            console.error('Error reading favorites:', e);
            return { games: [], apps: [], movies: [] };
        }
    }

    function save(favorites) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        } catch (e) {
            console.error('Error saving favorites:', e);
        }
    }

    /**
     * Get favorites by type
     * @param {string} type - 'games', 'apps', or 'movies'
     * @returns {Array} Array of favorite items
     */
    function getFavorites(type) {
        const all = getAll();
        return all[type] || [];
    }

    /**
     * Add item to favorites
     * @param {string} type - 'games', 'apps', or 'movies'
     * @param {Object} item - { id, name, img, url }
     */
    function addFavorite(type, item) {
        const MAX_FAVORITES = 6;
        const all = getAll();
        if (!all[type]) all[type] = [];

        // Check if already exists
        const exists = all[type].some(f => f.id === item.id || f.name === item.name);
        if (exists) return false;

        // Check total favorites limit - auto-remove oldest if at limit
        const totalFavorites = all.games.length + all.apps.length + all.movies.length;
        let removedItem = null;
        if (totalFavorites >= MAX_FAVORITES) {
            // Find and remove the oldest favorite across all types
            const allFavs = [
                ...all.games.map(f => ({ ...f, type: 'games' })),
                ...all.apps.map(f => ({ ...f, type: 'apps' })),
                ...all.movies.map(f => ({ ...f, type: 'movies' }))
            ];

            // Sort by oldest first
            allFavs.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));

            if (allFavs.length > 0) {
                const oldest = allFavs[0];
                removedItem = oldest;
                // Remove from appropriate array
                const idx = all[oldest.type].findIndex(f => f.id === oldest.id || f.name === oldest.name);
                if (idx !== -1) {
                    all[oldest.type].splice(idx, 1);
                }
            }
        }

        // Add with timestamp
        all[type].unshift({
            ...item,
            addedAt: Date.now()
        });

        save(all);

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('favoritesUpdated', {
            detail: { type, action: 'add', item, removedItem }
        }));

        return true;
    }

    /**
     * Remove item from favorites
     * @param {string} type - 'games', 'apps', or 'movies'
     * @param {string} id - Item ID or name
     */
    function removeFavorite(type, id) {
        const all = getAll();
        if (!all[type]) return false;

        const index = all[type].findIndex(f => f.id === id || f.name === id);
        if (index === -1) return false;

        const [removed] = all[type].splice(index, 1);
        save(all);

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('favoritesUpdated', {
            detail: { type, action: 'remove', item: removed }
        }));

        return true;
    }

    /**
     * Toggle favorite status
     * @param {string} type - 'games', 'apps', or 'movies'
     * @param {Object} item - { id, name, img, url }
     * @returns {boolean} New favorite status (true = favorited)
     */
    function toggleFavorite(type, item) {
        if (isFavorite(type, item.id || item.name)) {
            removeFavorite(type, item.id || item.name);
            return false;
        } else {
            addFavorite(type, item);
            return true;
        }
    }

    /**
     * Check if item is favorited
     * @param {string} type - 'games', 'apps', or 'movies' 
     * @param {string} id - Item ID or name
     * @returns {boolean}
     */
    function isFavorite(type, id) {
        const favorites = getFavorites(type);
        return favorites.some(f => f.id === id || f.name === id);
    }

    /**
     * Get all favorites combined (for Quick Access)
     * @param {number} limit - Max number to return
     * @returns {Array} Combined favorites sorted by most recent
     */
    function getAllFavorites(limit = 10) {
        const all = getAll();
        const combined = [
            ...all.games.map(f => ({ ...f, type: 'games' })),
            ...all.apps.map(f => ({ ...f, type: 'apps' })),
            ...all.movies.map(f => ({ ...f, type: 'movies' }))
        ];

        // Sort by most recently added
        combined.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));

        return limit ? combined.slice(0, limit) : combined;
    }

    /**
     * Clear all favorites
     */
    function clearAll() {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent('favoritesUpdated', {
            detail: { action: 'clear' }
        }));
    }

    // Public API
    return {
        getFavorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        getAllFavorites,
        clearAll
    };
})();

// Make globally accessible
window.VerdiFavorites = VerdiFavorites;
