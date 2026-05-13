(function () {
    function getUrlParam(name) {
        return new URLSearchParams(window.location.search).get(name);
    }

    function getLang() {
        const urlLang = getUrlParam("lang");
        if (urlLang) return urlLang;
        if (window.currentLang) return window.currentLang;
        return "tr";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderStars(rating) {
        const value = Math.max(0, Math.min(5, Number(rating) || 0));
        return `${"★".repeat(value)}${"☆".repeat(5 - value)}`;
    }

    function formatDate(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return date.toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    function showReviewsTab() {
        const tabItem = document.getElementById("reviews-tab-item");
        if (tabItem) tabItem.classList.remove("d-none");
    }

    function renderEmptyState(message) {
        showReviewsTab();
        const container = document.getElementById("reviews-container");
        if (!container) return;
        const text = message || "Bu destinasyon için henüz doğrulanmış misafir yorumu bulunmuyor.";
        container.innerHTML = `
            <div class="text-center py-5">
                <h2 class="lh-base mb-3">Misafir Yorumları</h2>
                <p class="text-muted mb-0">${escapeHtml(text)}</p>
            </div>
        `;
    }

    function renderReviews(reviews) {
        const container = document.getElementById("reviews-container");
        if (!container) return;

        const total = reviews.length;
        const average = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / total;
        const items = reviews.map((review) => {
            const title = escapeHtml(review.title || "Misafir yorumu");
            const guestName = escapeHtml(review.guestName || "Misafir");
            const dateText = formatDate(review.travelDate || review.approvedAt || review.createdAt);
            const meta = dateText ? `${guestName} &nbsp;&nbsp; ${escapeHtml(dateText)}` : guestName;

            return `
                <div class="mb-4 pb-4 border-bottom">
                    <div class="text-warning mb-2" aria-label="${Number(review.rating) || 0} / 5">${renderStars(review.rating)}</div>
                    <h6 class="fw-bold mb-1">${title}</h6>
                    <div class="text-muted small mb-2">${meta}</div>
                    <p class="mb-0">${escapeHtml(review.comment)}</p>
                </div>
            `;
        }).join("");

        container.innerHTML = `
            <div class="text-center mb-4">
                <h2 class="lh-base">Misafir Yorumları</h2>
            </div>
            <div class="d-flex align-items-center mb-3">
                <div class="text-warning fs-4 me-2">${renderStars(Math.round(average))}</div>
                <span class="fs-5 fw-semibold me-3">${average.toFixed(1)}</span>
                <span class="text-muted">${total} doğrulanmış misafir yorumu</span>
            </div>
            <div class="row">
                <div class="col-lg-12 p-0">${items}</div>
            </div>
        `;
    }

    async function loadDestinationReviews() {
        const destination = getUrlParam("country");
        if (!destination || typeof ApiService === "undefined" || typeof ApiService.getReviewsByDestination !== "function") {
            renderEmptyState();
            return;
        }

        try {
            const reviews = await ApiService.getReviewsByDestination(destination, getLang());
            if (!Array.isArray(reviews) || reviews.length === 0) {
                renderEmptyState();
                return;
            }

            renderReviews(reviews);
            showReviewsTab();
        } catch (error) {
            console.warn("Reviews could not be loaded:", error);
            renderEmptyState("Misafir yorumları şu anda görüntülenemiyor.");
        }
    }

    document.addEventListener("DOMContentLoaded", loadDestinationReviews);
})();
