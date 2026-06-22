function generateDetailUrl(tourId, tourLang) {
    const country = new URLSearchParams(window.location.search).get("country");
    if (!country || !tourId) return "#";

    let url = `template_tour_page.html?id=${encodeURIComponent(tourId)}&country=${encodeURIComponent(country)}`;
    const selectedLang = typeof getSelectedLang === 'function' ? getSelectedLang() : null;
    const lang = selectedLang && selectedLang !== 'tr'
        ? selectedLang
        : (tourLang || (typeof getActiveLang === 'function' ? getActiveLang() : 'tr'));
    if (lang !== 'tr') {
        url += `&lang=${encodeURIComponent(lang)}`;
    }
    return url;
}
