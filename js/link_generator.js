document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[data-country]').forEach(link => {
    const country = link.dataset.country;
    const category = link.dataset.category; // 👈 YENİ
    const id = link.dataset.id;

    let url = `template_tours_grid_page.html?country=${encodeURIComponent(country)}`;

    // 🔥 category varsa URL'ye ekle
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }

    const lang = typeof getSelectedLang === 'function'
      ? getSelectedLang()
      : (typeof getActiveLang === 'function' ? getActiveLang() : 'tr');
    if (lang !== 'tr') {
      url += `&lang=${encodeURIComponent(lang)}`;
    }

    link.href = url;
  });
});
