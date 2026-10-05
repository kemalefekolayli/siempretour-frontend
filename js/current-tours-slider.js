(function () {
  var slider = document.getElementById('currentToursSlider');
  var track = document.getElementById('currentToursTrack');
  if (!slider || !track || typeof ApiService === 'undefined') return;

  var PAGE_SIZE = 10;
  var INTERVAL_MS = 4000;
  var paused = false;
  var timer = null;

  function lang() {
    return typeof getActiveLang === 'function' ? getActiveLang() : 'tr';
  }

  function resolve(url) {
    return window.AssetCdn && typeof window.AssetCdn.resolve === 'function' ? window.AssetCdn.resolve(url) : url;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function detailUrl(tour) {
    var url = 'template_tour_page.html?id=' + encodeURIComponent(tour.slug || '') +
      '&country=' + encodeURIComponent(tour.destination || '');
    var l = lang();
    if (l && l !== 'tr') url += '&lang=' + encodeURIComponent(l);
    return url;
  }

  function cardHtml(tour) {
    var image = resolve(tour.image1 || tour.mainPhoto || '');
    var dest = window.TourCardFormat ? window.TourCardFormat.destinationLabel(tour) : (tour.destination || '');
    var days = tour.durationDays ? (tour.durationDays + ' günlük tur') : '';
    return '<a class="current-tours__card" href="' + esc(detailUrl(tour)) + '">' +
      (image ? '<img loading="lazy" src="' + esc(image) + '" alt="' + esc(tour.imagealt || tour.tourName || '') + '">' : '') +
      '<div class="current-tours__body">' +
        '<div class="current-tours__dest">' + esc(dest) + '</div>' +
        '<h4 class="current-tours__title">' + esc(tour.tourName || '') + '</h4>' +
        '<div class="current-tours__meta">' + esc(days) + '</div>' +
      '</div></a>';
  }

  function step() {
    if (paused) return;
    var first = track.firstElementChild;
    if (!first || slider.scrollWidth <= slider.clientWidth) return;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 22;
    var advance = first.offsetWidth + gap;
    var atEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 4;
    if (atEnd) {
      slider.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      slider.scrollBy({ left: advance, behavior: 'smooth' });
    }
  }

  function startAutoplay() {
    if (timer) return;
    timer = setInterval(step, INTERVAL_MS);
  }

  function stopAutoplay() {
    clearInterval(timer);
    timer = null;
  }

  slider.addEventListener('mouseenter', function () { paused = true; });
  slider.addEventListener('mouseleave', function () { paused = false; });
  slider.addEventListener('focusin', function () { paused = true; });
  slider.addEventListener('focusout', function () { paused = false; });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAutoplay(); else startAutoplay();
  });

  ApiService.filterTours({ adminOnly: true, language: lang(), isActive: true }, 0, PAGE_SIZE)
    .then(function (res) {
      var tours = (res && res.content) || [];
      if (!tours.length) {
        var section = document.querySelector('.current-tours');
        if (section) section.style.display = 'none';
        return;
      }
      track.innerHTML = tours.map(cardHtml).join('');
      startAutoplay();
    })
    .catch(function (err) {
      console.error('Güncel turlar yüklenemedi:', err);
      var section = document.querySelector('.current-tours');
      if (section) section.style.display = 'none';
    });
})();
