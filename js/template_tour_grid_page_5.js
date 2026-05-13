console.log("extra text js yÃ¼klendi");

/* ===============================
   EXTRA TEXT RENDER
   (_countrySlug zaten baÅŸka dosyada var)
================================ */
async function renderExtraTexts() {
    if (typeof _countrySlug === "undefined" || !_countrySlug) return;

    const container = document.getElementById("extraTextSection");
    if (!container) return;

    try {
        const res = await fetch(
            `data/siempre_tour_country_datas_tr/${_countrySlug}/datas.json`,
            { cache: "no-store" }
        );

        if (!res.ok) {
            container.innerHTML = "";
            return;
        }

        const datas = await res.json();
        const bestTime = datas.find(d => d.type === "best-time-to");
        const images = await (window.CountryPageImages?.pickMany(_countrySlug, [bestTime?.image1], 1) || Promise.resolve([]));

        if (!bestTime) {
            container.innerHTML = "";
            return;
        }

        const introWrap = document.querySelector("#guide-tab-pane .col-lg-12.d-md-flex");
        if (introWrap) {
            introWrap.classList.add("best-time-editorial");
        }

        function figureCaption(index, fallback) {
            const caption = bestTime[`image${index}Caption`] || bestTime[`caption${index}`] || "";
            return caption ? `<figcaption>${caption}</figcaption>` : "";
        }

        const img1 = document.getElementById("image1forwhentogo");
        if (img1 && images[0]) {
            img1.innerHTML = `
                <figure class="country-guide-image">
                    <img src="${images[0]}" alt="${bestTime.Main_Title || _countrySlug}">
                    ${figureCaption(1, bestTime.Main_Title || _countrySlug)}
                </figure>
            `;
        }


        container.innerHTML = "";


        for (let i = 1; i <= 20; i++) {
            const title = bestTime[`title${i}`];
            const paragraph = bestTime[`paragraph${i}`];

            if (!title && !paragraph) break;

            if (title) {
                const h4 = document.createElement("h4");
                h4.textContent = title;
                container.appendChild(h4);
            }

            if (paragraph) {
                const p = document.createElement("p");
                p.innerHTML = paragraph.replace(/\n/g, "<br>");
                container.appendChild(p);
            }
        }

    } catch (err) {
        console.error("Extra text yÃ¼klenemedi:", err);
        container.innerHTML = "";
    }
}

/* ===============================
   DOM READY
================================ */
document.addEventListener("DOMContentLoaded", renderExtraTexts);
