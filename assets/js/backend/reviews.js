
/**
 * Game Reviews & Details Logic
 */

let activeGameId = null;
let activeGameData = null;
let currentRating = 5;

// Open the details modal
function openGameDetails(type, item) {
    if (!item) return;

    // Normalize data (sometimes passed as JSON string, sometimes object)
    if (typeof item === 'string') {
        try {
            item = JSON.parse(item);
        } catch (e) { console.error('Error parsing item', e); return; }
    }

    activeGameData = item;
    activeGameId = slugify(item.name); // Simple ID generation

    // Populate Modal
    document.getElementById('modalGameTitle').textContent = item.name;
    document.getElementById('modalHeroBg').style.backgroundImage = `url('${item.img}')`;

    // Setup Play Button
    const playBtn = document.getElementById('modalPlayBtn');
    // Reconstruct the play action
    let playAction = '';
    if (type === 'games') {
        playAction = `navTo('play.html?launch=${item.url}')`;
    } else if (type === 'apps') {
        playAction = `rSearch('${item.url}')`;
    }

    playBtn.setAttribute('onclick', `closeGameDetails(); ${playAction}`);

    // Show Modal
    const modal = document.getElementById('gameDetailsModal');
    modal.classList.remove('settings-hidden');
    modal.classList.add('settings-shown');

    // Reset State
    switchModalTab('reviews');
    document.getElementById('reviewForm').style.display = 'none';

    // Load Data
    loadReviews(activeGameId);
    loadStats(activeGameId);
}

function closeGameDetails() {
    const modal = document.getElementById('gameDetailsModal');
    modal.classList.remove('settings-shown');
    modal.classList.add('settings-hidden');
}

function switchModalTab(tabName) {
    // Buttons
    document.querySelectorAll('.modal-tab').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active'); // Assumes triggered by click

    // Content
    document.querySelectorAll('.modal-tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`modal-tab-${tabName}`).classList.add('active');
}

// --- REVIEWS LOGIC ---

function toggleReviewForm() {
    const form = document.getElementById('reviewForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    setRating(5); // Reset rating
    document.getElementById('reviewComment').value = '';
}

function setRating(n) {
    currentRating = n;
    const stars = document.querySelectorAll('.star-rating-input i');
    stars.forEach(s => {
        const r = parseInt(s.dataset.rating);
        if (r <= n) {
            s.classList.remove('far');
            s.classList.add('fas');
        } else {
            s.classList.remove('fas');
            s.classList.add('far');
        }
    });
}

async function submitReviewAction() {
    const name = document.getElementById('reviewName').value.trim() || 'Anonymous';
    const comment = document.getElementById('reviewComment').value.trim();

    if (!comment) {
        showToast('error', 'Please write a comment!', 'fas fa-pen');
        return;
    }

    // Call Backend
    if (VerdisBackend && VerdisBackend.isConfigured()) {
        const { error } = await VerdisBackend.submitReview(activeGameId, currentRating, comment, name);
        if (error) {
            showToast('error', 'Failed to post review.', 'fas fa-exclamation-triangle');
        } else {
            showToast('success', 'Review posted!', 'fas fa-check');
            toggleReviewForm();
            loadReviews(activeGameId); // Reload
        }
    } else {
        // Fallback for demo (Local Storage?)
        // OR just tell user to setup backend
        showToast('info', 'Backend not configured. Check the implementation plan!', 'fas fa-server');
        // Simulate success for UX testing
        const mockReview = { user_name: name, rating: currentRating, comment: comment, created_at: new Date().toISOString() };
        renderReviews([mockReview]); // Append to list basically
    }
}

async function loadReviews(gameId) {
    const container = document.getElementById('reviewsList');
    container.innerHTML = '<div class="loading-spinner">Loading reviews...</div>';

    if (VerdisBackend && VerdisBackend.isConfigured()) {
        const reviews = await VerdisBackend.getReviews(gameId);
        renderReviews(reviews);
    } else {
        container.innerHTML = `<div style="text-align:center; padding: 20px; opacity: 0.6;">
            <i class="fas fa-server" style="font-size: 24px; margin-bottom: 10px;"></i><br>
            Backend not connected.<br>See "backend-setup.md" to enable.
        </div>`;
    }
}

function renderReviews(reviews) {
    const container = document.getElementById('reviewsList');
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<div style="padding: 20px; text-align: center; opacity: 0.6;">No reviews yet. Be the first!</div>';
        return;
    }

    container.innerHTML = '';
    reviews.forEach(r => {
        const div = document.createElement('div');
        div.className = 'review-item';
        const safeName = escapeHtml(censorText(r.user_name || 'Anonymous'));
        const safeComment = escapeHtml(censorText(r.comment));
        div.innerHTML = `
            <div class="review-header">
                <span class="review-author">${safeName}</span>
                <span class="review-stars">${getStarHtml(r.rating)}</span>
            </div>
            <div class="review-text">${safeComment}</div>
            <span class="review-date">${new Date(r.created_at).toLocaleDateString()}</span>
        `;
        container.appendChild(div);
    });
}

// --- STATS LOGIC ---

async function loadStats(gameId) {
    // Reset
    document.getElementById('statViews').textContent = '-';
    document.getElementById('statRating').textContent = '-';

    if (VerdisBackend && VerdisBackend.isConfigured()) {
        // Fetch stats (mocked call in client for now or real if implemented)
        // For now, let's just track a view
        VerdisBackend.trackPlay(gameId);
    }
}

// --- UTILS ---

// Profanity filter - basic list, can be extended
const BANNED_WORDS = ['fuck', 'shit', 'bitch', 'ass', 'damn', 'cunt', 'dick', 'cock', 'pussy', 'nigger', 'nigga', 'faggot', 'retard', 'whore', 'slut'];

function censorText(text) {
    if (!text) return text;
    let result = text;
    BANNED_WORDS.forEach(word => {
        const regex = new RegExp(word, 'gi');
        const stars = '*'.repeat(word.length);
        result = result.replace(regex, stars);
    });
    return result;
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getStarHtml(rating) {
    let html = '';
    for (let i = 0; i < 5; i++) {
        if (i < rating) html += '<i class="fas fa-star"></i>';
        else html += '<i class="far fa-star"></i>';
    }
    return html;
}

