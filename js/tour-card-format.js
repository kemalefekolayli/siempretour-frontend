/*
 * Tur kartlarında fiyat + kalkış tarihlerini tutarlı biçimde göstermek için
 * ortak yardımcılar. Çoklu kalkış (departures) varsa hepsini gösterir; yoksa
 * eski `dates` serbest metni / `startDate` alanına zarifçe düşer.
 * window.TourCardFormat olarak grid, arama ve cruise kartlarında kullanılır.
 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtNum(n) {
    var num = Number(n);
    if (isNaN(num)) return '';
    return num.toLocaleString('tr-TR');
  }

  // "yyyy-MM-dd" (veya ISO datetime) -> "dd.MM.yyyy"
  function fmtDate(value) {
    if (!value) return '';
    var s = String(value).substring(0, 10);
    var p = s.split('-');
    if (p.length === 3) return p[2] + '.' + p[1] + '.' + p[0];
    return s;
  }

  // Bir tur/kalkış için geçerli fiyat: indirimli varsa o, yoksa normal fiyat.
  function effPrice(o) {
    if (!o) return null;
    var d = o.discountedPrice;
    if (d != null && d !== '' && Number(d) > 0) return Number(d);
    var p = o.price;
    if (p != null && p !== '' && Number(p) > 0) return Number(p);
    return null;
  }

  function departures(tour) {
    return Array.isArray(tour && tour.departures)
      ? tour.departures.filter(function (x) { return x && x.departureDate; })
      : [];
  }

  // "yyyy-MM-dd" (veya ISO datetime) -> yerel Date (saat dilimi kaymasını önlemek için
  // bileşenlerden elle kurulur). Ayrıştırılamazsa null.
  function parseDateOnly(value) {
    if (!value) return null;
    var s = String(value).substring(0, 10);
    var p = s.split('-');
    if (p.length !== 3) return null;
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return isNaN(d.getTime()) ? null : d;
  }

  // Admin turlarını "bugüne en yakın kalkış tarihi önce" sıralamak için: bir turun
  // bugünden itibaren (dahil) en erken kalkış tarihi; kalkış (departures) yoksa
  // startDate'e düşer; gelecekte tarih yoksa null döner.
  function earliestUpcomingDeparture(tour) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var dates = departures(tour)
      .map(function (d) { return parseDateOnly(d.departureDate); })
      .filter(function (d) { return d && d >= today; });
    if (dates.length) {
      return dates.reduce(function (min, d) { return d < min ? d : min; });
    }
    var start = parseDateOnly(tour && tour.startDate);
    return (start && start >= today) ? start : null;
  }

  function tbdHtml(isEn) {
    var tbd = isEn ? 'Price to be determined' : 'Fiyat Belirlenecek';
    return '<p class="mb-0 tour-card-price tour-card-price--tbd"><i class="fa fa-tag"></i> ' + esc(tbd) + '</p>';
  }

  function priceHtml(tour, isEn) {
    // Yalnızca admin panelinden eklenen turların fiyatı gerçek. Toplu içe aktarılan
    // (adminCreated=false) turlarda fiyat değeri olsa bile "Fiyat Belirlenecek" göster.
    if (!tour || tour.adminCreated !== true) return tbdHtml(isEn);

    var deps = departures(tour);
    var prices = [];
    deps.forEach(function (d) {
      var e = effPrice(d);
      if (e != null) prices.push(e);
    });

    var min = null;
    var multiple = false;
    if (prices.length) {
      min = Math.min.apply(null, prices);
      multiple = Math.max.apply(null, prices) !== min;
    } else {
      min = effPrice(tour);
    }
    // Admin turu ama fiyat girilmemişse yine bilgilendir.
    if (min == null) return tbdHtml(isEn);

    var priceStr = fmtNum(min) + ' €'; // fiyatlar euro cinsinden
    var label;
    if (multiple) {
      label = isEn ? ('from ' + priceStr) : (priceStr + "'den başlayan");
    } else {
      label = priceStr;
    }
    return '<p class="mb-0 tour-card-price"><i class="fa fa-tag"></i> ' + esc(label) + '</p>';
  }

  function datesHtml(tour, isEn) {
    var deps = departures(tour);
    var badges = '';
    if (deps.length) {
      badges = deps.map(function (d) {
        return '<span class="tour-date-badge">' + esc(fmtDate(d.departureDate)) + '</span>';
      }).join('');
    } else if (tour && tour.dates) {
      badges = '<span class="tour-date-badge">' + esc(tour.dates) + '</span>';
    } else if (tour && tour.startDate) {
      badges = '<span class="tour-date-badge">' + esc(fmtDate(tour.startDate)) + '</span>';
    }
    if (!badges) return '';
    var label = isEn ? 'Dates' : 'Tarihler';
    return '<div class="tour-card-dates"><span class="tour-card-dates-label">' + label + ':</span> ' + badges + '</div>';
  }

  // Çok ülkeli turlarda (ör. "İtalya-Fransa-İspanya") kart üzerindeki ülke
  // rozetinde tüm ülkeler virgülle gösterilir. `destinations` boşsa (eski
  // turlar) tek `destination` alanına düşer.
  function destinationLabel(tour) {
    var list = (tour && Array.isArray(tour.destinations) && tour.destinations.length)
      ? tour.destinations
      : (tour && tour.destination ? [tour.destination] : []);
    var seen = {};
    var names = [];
    list.forEach(function (d) {
      if (!d) return;
      var label = (typeof countryNameTr === 'function') ? countryNameTr(d) : d;
      if (!seen[label]) { seen[label] = true; names.push(label); }
    });
    return names.join(', ');
  }

  window.TourCardFormat = {
    priceHtml: priceHtml,
    datesHtml: datesHtml,
    fmtDate: fmtDate,
    effPrice: effPrice,
    departures: departures,
    destinationLabel: destinationLabel,
    earliestUpcomingDeparture: earliestUpcomingDeparture
  };
})();
