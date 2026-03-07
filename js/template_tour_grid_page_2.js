console.log("template_tour_grid_page_2.js yüklendi");

/* 🔑 URL'den country slug al */
const countrySlug = new URLSearchParams(window.location.search).get("country");

let overviewRendered = false;
let cachedDatas = null;

/* 🔹 datas.json fetch (tek sefer) */
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
        throw new Error("datas.json bulunamadı");
    }

    cachedDatas = await res.json();
    return cachedDatas;
}

/* 🔹 Overview render */
async function renderOverview() {
    console.log("renderOverview çağrıldı");

    const container = document.getElementById("overview-section");
    if (!container) return;

    const datas = await fetchCountryDatas();
    const overview = datas.find(d => d.type === "overview");

    const MainParagraph = document.getElementById("MainParagraphOverview");
    const MainTitle = document.getElementById("MainTitleOverview");
    
    MainParagraph.innerHTML = overview.Main_Paragraph;
    MainTitle.innerHTML = overview.Main_Title;

    if (!overview) return;

    let html = "";

    /* Subtitle */
    if (overview.Subtitle) {
        html += `
            <h2 class="text-dark text-center py-4">
                ${overview.Subtitle}
            </h2>
        `;
    }

    /* image1 */
    if (overview.image1) {
        html += `
            <div class="tour-bg__image"
                 style="background-image: url(${overview.image1});">
            </div>
        `;
    }

    /* Dinamik Title / Paragraph blokları */
    let blockIndex = 0;

    Object.keys(overview).forEach(key => {
        if (!key.startsWith("Title")) return;

        const idx = key.replace("Title", "");
        const title = overview[`Title${idx}`];
        const paragraph = overview[`Paragraph${idx}`];

        if (!title || !paragraph) return;

        blockIndex++;

        html += `
            <div class="py-5">
                <h4>${title}</h4>
                <p>${paragraph}</p>
            </div>
        `;

        /* image2 → 1. bloktan sonra */
        if (blockIndex === 1 && overview.image2) {
            html += `
                <div class="tour-bg__image"
                     style="background-image: url(${overview.image2});">
                </div>
            `;
        }

        /* image3 → 3. bloktan sonra */
        if (blockIndex === 3 && overview.image3) {
            html += `
                <div class="tour-bg__image"
                     style="background-image: url(${overview.image3});">
                </div>
            `;
        }
    });

    container.innerHTML = html;
}

/* 🔹 Sayfa yüklenince */
document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM loaded (overview)");

    const overviewTabBtn = document.getElementById("tour-tab");

    if (!overviewTabBtn) return;

    try {
        const datas = await fetchCountryDatas();
        const hasOverview = datas.some(d => d.type === "overview");

        /* ❌ overview yok → tab tamamen kaldır */
        if (!hasOverview) {
            overviewTabBtn.remove();
            return;
        }
    } catch (err) {
        console.error("Overview kontrol hatası:", err);
        overviewTabBtn.remove();
        return;
    }

    /* ✅ Tab’a ilk açılışta render */
    overviewTabBtn.addEventListener("shown.bs.tab", async () => {
        if (overviewRendered) return;
        await renderOverview();
        overviewRendered = true;
    });

    /* Eğer tab default active ise */
    if (overviewTabBtn.classList.contains("active")) {
        await renderOverview();
        overviewRendered = true;
    }
});
