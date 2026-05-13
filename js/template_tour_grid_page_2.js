console.log("template_tour_grid_page_2.js yÃ¼klendi");

/* ğŸ”‘ URL'den country slug al */
const countrySlug = new URLSearchParams(window.location.search).get("country");

let overviewRendered = false;
let cachedDatas = null;

/* ğŸ”¹ datas.json fetch (tek sefer) */
async function fetchCountryDatas() {
    if (cachedDatas) return cachedDatas;

    if (!countrySlug) {
        throw new Error("country parametresi yok");
    }

    const res = await fetch(
        `data/siempre_tour_country_datas_tr/${countrySlug}/datas.json`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("datas.json bulunamadÄ±");
    }

    cachedDatas = await res.json();
    return cachedDatas;
}

/* ğŸ”¹ Overview render */
async function renderOverview() {
    console.log("renderOverview Ã§aÄŸrÄ±ldÄ±");

    const container = document.getElementById("overview-section");
    if (!container) return;

    const datas = await fetchCountryDatas();
    const overview = datas.find(d => d.type === "overview");
    if (!overview) return;
    const images = await (window.CountryPageImages?.pickMany(countrySlug, [overview.image1], 1) || Promise.resolve([]));

    function fixTurkishText(value) {
        const text = String(value || "");
        const replacements = [
            ["Ä°", "İ"], ["Ä±", "ı"], ["ÄŸ", "ğ"], ["Äž", "Ğ"],
            ["ÅŸ", "ş"], ["Å", "Ş"], ["Åž", "Ş"],
            ["Ã§", "ç"], ["Ã‡", "Ç"], ["Ã¼", "ü"], ["Ãœ", "Ü"],
            ["Ã¶", "ö"], ["Ã–", "Ö"], ["Ã¢", "â"], ["Ã®", "î"],
            ["Â°C", "°C"], ["Â ", " "], ["â€™", "’"], ["â€“", "–"]
        ];
        function applyMap(input) {
            return replacements.reduce((current, pair) => current.split(pair[0]).join(pair[1]), input);
        }
        if (!/[ÃÄÅÂâ]/.test(text)) return text;
        try {
            return applyMap(decodeURIComponent(escape(text)));
        } catch (error) {
            return applyMap(text);
        }
    }

    const MainParagraph = document.getElementById("MainParagraphOverview");
    const MainTitle = document.getElementById("MainTitleOverview");
    
    if (MainParagraph) MainParagraph.innerHTML = "";
    if (MainTitle) MainTitle.innerHTML = "";

    let html = "";

    if (overview.Main_Title || overview.Main_Paragraph) {
        html += `
            <header class="country-story-intro">
                ${overview.Main_Title ? `<h2>${fixTurkishText(overview.Main_Title)}</h2>` : ""}
                ${overview.Main_Paragraph ? `<p>${fixTurkishText(overview.Main_Paragraph)}</p>` : ""}
            </header>
        `;
    }

    function figureCaption(index, fallback) {
        const caption = overview[`image${index}Caption`] || overview[`caption${index}`] || "";
        return caption ? `<figcaption>${caption}</figcaption>` : "";
    }

    /* image1 */
    if (images[0]) {
        html += `
            <figure class="country-story-image country-story-image--wide">
                <img src="${images[0]}" alt="${fixTurkishText(overview.Subtitle || overview.Main_Title || countrySlug)}">
                ${figureCaption(1, overview.Subtitle || overview.Main_Title)}
            </figure>
        `;
    }

    if (overview.Subtitle) {
        html += `
            <h2 class="country-story-heading">${fixTurkishText(overview.Subtitle)}</h2>
        `;
    }

    /* Dinamik Title / Paragraph bloklarÄ± */
    let blockIndex = 0;

    Object.keys(overview).forEach(key => {
        if (!key.startsWith("Title")) return;

        const idx = key.replace("Title", "");
        const title = overview[`Title${idx}`];
        const paragraph = overview[`Paragraph${idx}`];

        if (!title || !paragraph) return;

        blockIndex++;

        html += `
            <article class="country-story-block">
                <h4>${fixTurkishText(title)}</h4>
                <p>${fixTurkishText(paragraph)}</p>
            </article>
        `;
    });

    container.innerHTML = html;
}

/* ğŸ”¹ Sayfa yÃ¼klenince */
document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM loaded (overview)");

    const overviewTabBtn = document.getElementById("tour-tab");

    if (!overviewTabBtn) return;

    try {
        const datas = await fetchCountryDatas();
        const hasOverview = datas.some(d => d.type === "overview");

        /* âŒ overview yok â†’ tab kaldÄ±r, turlar tabÄ±nÄ± aktif yap */
        if (!hasOverview) {
            switchToToursTab();
            return;
        }
    } catch (err) {
        console.error("Overview kontrol hatasÄ±:", err);
        switchToToursTab();
        return;
    }

    function switchToToursTab() {
        overviewTabBtn.remove();
        const overviewPane = document.getElementById("tour-tab-pane");
        if (overviewPane) overviewPane.classList.remove("show", "active");
        const toursBtn = document.getElementById("overview-tab");
        if (toursBtn) toursBtn.classList.add("active");
        const toursPane = document.getElementById("overview-tab-pane");
        if (toursPane) toursPane.classList.add("show", "active");
    }

    /* âœ… Tabâ€™a ilk aÃ§Ä±lÄ±ÅŸta render */
    overviewTabBtn.addEventListener("shown.bs.tab", async () => {
        if (overviewRendered) return;
        await renderOverview();
        overviewRendered = true;
    });

    /* EÄŸer tab default active ise */
    if (overviewTabBtn.classList.contains("active")) {
        await renderOverview();
        overviewRendered = true;
    }
});
