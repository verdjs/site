
/**
 * Leaderboard / Trending Logic
 */

const VerdisLeaderboard = (() => {

    async function init() {
        // Only run if we are in the games page context or if specific container exists
        // But the games wrapper is hidden by default. We can load when it opens?
        // Or just load once on startup.

        if (VerdisBackend && VerdisBackend.isConfigured()) {
            loadTrending();
        }
    }

    async function loadTrending() {
        const games = await VerdisBackend.getMostPlayed();
        if (!games || games.length === 0) return;

        // Find games wrapper
        const wrapper = document.querySelector('.games-wrapper');
        if (!wrapper) return;

        // Check if trending already exists
        if (document.getElementById('trending-section')) return;

        // Create Trending Section
        const section = document.createElement('div');
        section.id = 'trending-section';
        section.innerHTML = `
            <h2 style="margin-left: 20px; font-size: 20px; margin-bottom: 10px; color: var(--accent);">
                <i class="fas fa-fire"></i> Trending This Week
            </h2>
            <div class="trending-container" style="display: flex; overflow-x: auto; padding: 0 20px 20px 20px; gap: 15px;">
                <!-- Items injected here -->
            </div>
            <h2 style="margin-left: 20px; font-size: 20px; margin-bottom: 10px;">All Games</h2>
        `;

        // Insert after search bar (which is first child usually, or find specific place)
        const searchInput = wrapper.querySelector('input');
        if (searchInput) {
            searchInput.insertAdjacentElement('afterend', section);
        } else {
            wrapper.prepend(section);
        }

        const container = section.querySelector('.trending-container');

        // Render Cards (Reuse existing card style but smaller?)
        // We need the original game data to render the card properly (img, url).
        // The backend `games` table might only have ID/Stats. 
        // We need to map ID back to the local `games.json` data.

        // This requires access to the full games list.
        // `data` variable in index.html holds the last loaded JSON? No, that's local scope.
        // We should fetch games.json again or expose it.

        try {
            const store = (localStorage.getItem("verdis_gameStore") ?? "gn-math").toLowerCase();
            const res = await fetch(`/assets/json/${store}.json`);
            if (!res.ok) throw new Error('Failed to load games JSON');
            const allGames = await res.json();

            games.forEach(stat => {
                const gameData = allGames.find(g => slugify(g.name) === stat.id);
                if (gameData) {
                    const card = createMiniCard(gameData, stat);
                    container.appendChild(card);
                }
            });

        } catch (e) { console.error('Error loading local games for trending', e); }
    }

    function createMiniCard(item, stat) {
        const div = document.createElement('div');
        div.className = 'app'; // Re-use main app class for style
        // Modify style slightly for carousel
        div.style.minWidth = '150px';
        div.style.width = '150px';
        div.style.height = '150px';

        // Check local fav
        const isFav = VerdiFavorites.isFavorite('games', item.name);

        div.innerHTML = `
            <div class="trending-badge" style="position: absolute; top: 10px; left: 10px; background: var(--accent); color: white; padding: 2px 8px; border-radius: 6px; font-size: 10px; z-index: 20;">
                <i class="fas fa-user"></i> ${stat.play_count || 0}
            </div>
            <button class="favorite-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavoriteCard(this, 'games', ${JSON.stringify(item).replace(/"/g, '&quot;')})">
                <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
            </button>
            <button class="info-btn" onclick="event.stopPropagation(); openGameDetails('games', ${JSON.stringify(item).replace(/"/g, '&quot;')})">
                <i class="fas fa-info-circle"></i>
            </button>
            <div class="bg-img" style="background-image: url('${item.img}')"></div>
            <div class="app-title-cont">
                <h2 class="app-title-h2" style="font-size: 14px;">${item.name}</h2>
            </div>
        `;

        const type = 'games';
        const functionName = 'Games';
        const toRun = 'navTo';
        const additions = 'play.html?launch=';

        div.onclick = () => {
            // Mimic index.html logic
            toggleGames();
            navTo(additions + item.url);
        };

        return div;
    }

    return {
        init
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    // Wait for supabase init
    // setTimeout(() => VerdisLeaderboard.init(), 1500);
});
