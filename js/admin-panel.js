(function () {
  var metadata = { categories: [], statuses: [] };
  var charts = {};
  var tourImageFields = ["mainPhoto", "image1", "image2", "image3", "image4", "image5", "image6"];
  var newTourDraftKey = "siempre.admin.newTourDraft";
  var activeTourFormId = "";
  var activeTourDraftKey = "";
  var routeCoordinates = [];
  var dayInfo = [];
  var departures = [];

  function user() {
    try {
      return JSON.parse(localStorage.getItem("user_info") || "null");
    } catch (error) {
      return null;
    }
  }

  function isAdmin() {
    return (user() && String(user().role || "").toUpperCase() === "ADMIN") || tokenRole() === "ADMIN";
  }

  function tokenRole() {
    var token = localStorage.getItem("jwt_token");
    if (!token || token.split(".").length < 2) return "";
    try {
      var payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      return String(payload.role || "").toUpperCase();
    } catch (error) {
      return "";
    }
  }

  // Giris yapan kullanicinin e-postasi: once user_info, yoksa JWT 'sub' alani.
  function currentEmail() {
    var u = user();
    if (u && u.email) return String(u.email).toLowerCase();
    var token = localStorage.getItem("jwt_token");
    if (token && token.split(".").length >= 2) {
      try {
        var payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        if (payload && payload.sub) return String(payload.sub).toLowerCase();
      } catch (error) { /* yok say */ }
    }
    return "";
  }

  // Backend hedef anahtari — yalnizca superadmin@siempretour.com hesabinda gorunur.
  // Otomatik / Local / Railway secenekleri arasinda gecis yapar; secim
  // window.SiempreBackend uzerinden localStorage'a yazilir ve sayfa yenilenir.
  function setupBackendToggle() {
    var el = document.getElementById("backend-toggle");
    if (!el) return;
    if (currentEmail() !== "superadmin@siempretour.com") return; // klasik admin gormez
    if (!window.SiempreBackend) return;

    el.hidden = false;
    var buttons = el.querySelectorAll(".backend-toggle__btn");
    var activeLabel = document.getElementById("backend-toggle-active");

    function paint() {
      var env = window.SiempreBackend.getEnv(); // 'auto' | 'local' | 'railway'
      Array.prototype.forEach.call(buttons, function (b) {
        b.classList.toggle("is-active", b.dataset.env === env);
      });
      if (activeLabel) {
        var label = env === "auto" ? "Otomatik" : (env === "local" ? "Local" : "Railway");
        activeLabel.textContent = label + " · " + window.SiempreBackend.current;
      }
    }

    paint();
    Array.prototype.forEach.call(buttons, function (b) {
      b.addEventListener("click", function () {
        if (b.dataset.env === window.SiempreBackend.getEnv()) return;
        window.SiempreBackend.setEnv(b.dataset.env); // localStorage yaz + reload
      });
    });
  }

  function requireAdmin() {
    if (isAdmin()) return true;
    document.body.innerHTML = [
      '<main class="admin-forbidden">',
      '<section class="admin-card">',
      '<h1>Yetkisiz Erişim</h1>',
      '<p>Bu sayfaya erişmek için admin hesabı ile giriş yapmalısınız.</p>',
      '<a class="admin-btn primary" href="../login.html">Giriş Yap</a>',
      '</section>',
      '</main>'
    ].join("");
    return false;
  }

  function toast(message) {
    var node = document.createElement("div");
    node.className = "admin-toast";
    node.textContent = message;
    document.body.appendChild(node);
    setTimeout(function () { node.remove(); }, 2800);
  }

  function setState(id, message) {
    var node = document.getElementById(id);
    if (node) node.innerHTML = '<div class="admin-state">' + message + '</div>';
  }

  function setUploadStatus(message) {
    var node = document.getElementById("image-upload-status");
    if (node) node.textContent = message || "";
  }

  function getTourDraftKey(id) {
    return id ? "" : newTourDraftKey;
  }

  function collectTourDraft() {
    var form = document.getElementById("tour-form");
    var data = {};
    if (!form) return data;
    new FormData(form).forEach(function (value, key) {
      data[key] = value;
    });
    var active = document.getElementById("tour-active");
    data.isActive = active ? active.checked : true;
    data.routeCoordinates = routeCoordinates.slice();
    data.dayInfo = dayInfo.slice();
    data.departures = departures.slice();
    return data;
  }

  function saveTourDraft(key) {
    if (!key || !window.sessionStorage) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(collectTourDraft()));
    } catch (error) {
      // Draft persistence is best-effort; upload/save should keep working.
    }
  }

  function clearTourDraft(key) {
    if (!key || !window.sessionStorage) return;
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      // Ignore storage errors.
    }
  }

  function restoreTourDraft(key) {
    if (!key || !window.sessionStorage) return false;
    var raw = sessionStorage.getItem(key);
    if (!raw) return false;
    try {
      var data = JSON.parse(raw);
      Object.keys(data || {}).forEach(function (field) {
        if (field === "isActive") {
          var active = document.getElementById("tour-active");
          if (active) active.checked = data[field] !== false;
          return;
        }
        if (field === "routeCoordinates") return;
        if (field === "dayInfo") return;
        if (field === "departures") return;
        var node = document.querySelector('[name="' + field + '"]');
        if (node) node.value = data[field] || "";
      });
      if (Array.isArray(data.routeCoordinates)) {
        routeCoordinates = data.routeCoordinates;
        renderRouteStops();
      }
      if (Array.isArray(data.dayInfo)) {
        dayInfo = data.dayInfo;
        renderDayInfo();
      }
      if (Array.isArray(data.departures)) {
        departures = data.departures;
        renderDepartures();
      }
      renderImagePreview();
      setUploadStatus("Kaydedilmemis form taslagi geri yuklendi.");
      setUploadStatus("Kaydedilmemiş form taslağı geri yüklendi.");
      setUploadStatus("Kaydedilmemis form taslagi geri yuklendi.");
      return true;
    } catch (error) {
      clearTourDraft(key);
      return false;
    }
  }

  function bindTourDraft(form, key) {
    if (!form || !key) return;
    form.addEventListener("input", function () { saveTourDraft(activeTourDraftKey); });
    form.addEventListener("change", function () { saveTourDraft(activeTourDraftKey); });
  }

  function value(id) {
    var node = document.getElementById(id);
    return node ? node.value : "";
  }

  function paramsFromFilters() {
    return {
      startDate: value("filter-start"),
      endDate: value("filter-end"),
      tourId: value("filter-tour"),
      category: value("filter-category"),
      type: value("filter-type")
    };
  }

  async function loadMetadata() {
    metadata = await ApiService.adminMetadata();
    fillSelect("filter-category", metadata.categories, "Tüm kategoriler");
    fillSelect("tour-category", metadata.categories, "Kategori seçin");
    fillSelect("tour-status", (metadata.statuses || []).map(function (status) {
      return { name: status, displayName: status };
    }), "Durum seçin");
  }

  function fillSelect(id, items, placeholder) {
    var select = document.getElementById(id);
    if (!select) return;
    var current = select.value;
    select.innerHTML = '<option value="">' + placeholder + '</option>' + (items || []).map(function (item) {
      return '<option value="' + item.name + '">' + (item.displayName || item.name) + '</option>';
    }).join("");
    if (current) select.value = current;
  }

  function fmt(value) {
    if (value === null || value === undefined || value === "") return "-";
    return value;
  }

  // Serbest metni (public iletişim formundan gelir) tablo HTML'ine güvenle yerleştir
  function esc(value) {
    if (value === null || value === undefined || value === "") return "-";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Admin sayfaları /admin/ altında olduğu için göreli görsel yollarını bir üst dizine çöz
  function resolveImageUrl(url) {
    if (!url) return "";
    if (/^(https?:)?\/\//.test(url) || url.charAt(0) === "/") return url;
    return "../" + url.replace(/^\.\//, "");
  }

  function imageFor(tour) {
    return resolveImageUrl(tour.image1 || tour.mainPhoto) || "../images/destination/destination1.jpg";
  }

  async function initAnalytics() {
    await loadMetadata();
    await refreshAnalytics();
    document.getElementById("analytics-filters").addEventListener("submit", function (event) {
      event.preventDefault();
      refreshAnalytics();
    });
  }

  async function refreshAnalytics() {
    setState("recent-requests", "Yükleniyor...");
    var params = paramsFromFilters();
    try {
      var summary = await ApiService.adminSummary(params);
      var timeline = await ApiService.adminRequestsOverTime(params);
      var topTours = await ApiService.adminTopTours(Object.assign({}, params, { limit: 8 }));
      var topCategories = await ApiService.adminTopCategories(Object.assign({}, params, { limit: 8 }));
      var requests = await ApiService.adminRequests(Object.assign({}, params, { page: 0, size: 8 }));

      document.getElementById("kpi-reservations").textContent = summary.totalReservationRequests || 0;
      document.getElementById("kpi-info").textContent = summary.totalInformationRequests || 0;
      document.getElementById("kpi-month").textContent = summary.thisMonthRequests || 0;
      document.getElementById("kpi-tour").textContent = summary.mostRequestedTour ? summary.mostRequestedTour.name : "Veri yok";
      document.getElementById("kpi-category").textContent = summary.mostPopularCategory ? summary.mostPopularCategory.name : "Veri yok";

      renderLineChart("requests-chart", timeline);
      renderBarChart("tour-chart", topTours, "totalRequests");
      renderBarChart("category-chart", topCategories, "totalRequests");
      renderRequestsTable("recent-requests", requests.content || []);
      renderDemandTable("top-tours-table", topTours);
      renderDemandTable("top-categories-table", topCategories);
    } catch (error) {
      setState("recent-requests", "Admin verileri yüklenemedi: " + error.message);
    }

    try {
      var contactMessages = await ApiService.adminContactMessages({ page: 0, size: 10 });
      renderContactMessagesTable("contact-messages-table", contactMessages.content || []);
    } catch (error) {
      setState("contact-messages-table", "İletişim mesajları yüklenemedi: " + error.message);
    }
  }

  function renderContactMessagesTable(id, rows) {
    var node = document.getElementById(id);
    if (!node) return;
    if (!rows.length) {
      setState(id, "Henüz iletişim mesajı yok.");
      return;
    }
    node.innerHTML = table(["Ad Soyad", "E-posta", "Konu", "Mesaj", "Tarih"], rows.map(function (row) {
      return [esc(row.name), esc(row.email), esc(row.subject), esc(row.message), esc((row.createdAt || "").slice(0, 10))];
    }));
  }

  function renderLineChart(id, points) {
    if (!window.Chart) return;
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(document.getElementById(id), {
      type: "line",
      data: {
        labels: points.map(function (p) { return p.date; }),
        datasets: [
          { label: "Rezervasyon", data: points.map(function (p) { return p.reservations; }), borderColor: "#000", tension: 0.3 },
          { label: "Bilgi Talebi", data: points.map(function (p) { return p.informationRequests; }), borderColor: "#96c43f", tension: 0.3 }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: "bottom" } } }
    });
  }

  function renderBarChart(id, rows, field) {
    if (!window.Chart) return;
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(document.getElementById(id), {
      type: "bar",
      data: {
        labels: rows.map(function (row) { return row.name || row.category || "-"; }),
        datasets: [{ label: "Talep", data: rows.map(function (row) { return row[field] || 0; }), backgroundColor: "#000" }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }

  function renderRequestsTable(id, rows) {
    var node = document.getElementById(id);
    if (!node) return;
    if (!rows.length) {
      setState(id, "Bu filtrelerle talep bulunamadı.");
      return;
    }
    node.innerHTML = table(["Tür", "Tur", "Kişi", "E-posta", "Telefon", "Durum", "Tarih"], rows.map(function (row) {
      return [row.type === "reservation" ? "Rezervasyon" : "Bilgi", fmt(row.tourName), fmt(row.requesterName || row.requesterEmail), fmt(row.requesterEmail), fmt(row.requesterPhone), fmt(row.status), fmt((row.createdAt || "").slice(0, 10))];
    }));
  }

  function renderDemandTable(id, rows) {
    var node = document.getElementById(id);
    if (!node) return;
    if (!rows.length) {
      setState(id, "Gösterilecek veri yok.");
      return;
    }
    node.innerHTML = table(["Ad", "Kategori", "Hedef", "Talep"], rows.map(function (row) {
      return [fmt(row.name), fmt(row.category), fmt(row.destination), fmt(row.totalRequests)];
    }));
  }

  function table(headers, rows) {
    return '<div class="admin-table-wrap"><table class="admin-table"><thead><tr>' +
      headers.map(function (head) { return "<th>" + head + "</th>"; }).join("") +
      "</tr></thead><tbody>" +
      rows.map(function (row) {
        return "<tr>" + row.map(function (cell) { return "<td>" + cell + "</td>"; }).join("") + "</tr>";
      }).join("") +
      "</tbody></table></div>";
  }

  async function initTours() {
    await loadMetadata();
    await refreshTours();
    document.getElementById("tour-filters").addEventListener("submit", function (event) {
      event.preventDefault();
      refreshTours();
    });
  }

  async function refreshTours() {
    setState("tour-list", "Turlar yükleniyor...");
    try {
      var response = await ApiService.adminTours({
        q: value("tour-q"),
        category: value("filter-category"),
        destination: value("tour-destination-filter"),
        status: value("tour-status-filter"),
        isActive: value("tour-active-filter"),
        page: 0,
        size: 50
      });
      await renderTours(response.content || []);
    } catch (error) {
      setState("tour-list", "Turlar yüklenemedi: " + error.message);
    }
  }

  function tourRowHtml(tour, isChild) {
    var preview = "../template_tour_page.html?id=" + encodeURIComponent(tour.slug || "") + "&country=" + encodeURIComponent(tour.destination || "");
    var langCode = (tour.language || "").toLowerCase();
    var langText = langCode === "en" ? "🇬🇧 İngilizce" : (langCode === "tr" ? "🇹🇷 Türkçe" : fmt(tour.language));
    var langBadge = '<span class="admin-lang-badge ' + (langCode === "en" ? "en" : "tr") + '">' + langText + (isChild ? " versiyon" : "") + '</span>';
    var active = tour.isActive !== false;
    return '<tr class="' + (isChild ? "admin-subrow" : "") + '">' +
      '<td><img class="admin-thumb" src="' + imageFor(tour) + '" alt=""></td>' +
      '<td>' + langBadge + '<br><strong>' + fmt(tour.name || tour.tourName) + '</strong><br><small>' + fmt(tour.slug) + '</small></td>' +
      '<td>' + fmt(tour.category) + '</td>' +
      '<td>' + fmt(tour.destination) + '</td>' +
      '<td>' + (tour.price != null && tour.price !== "" ? Number(tour.price).toLocaleString("tr-TR") + " €" : fmt(tour.price)) + '</td>' +
      '<td><span class="admin-badge ' + (active ? "ok" : "warn") + '">' + (active ? "Aktif" : "Pasif") + " / " + fmt(tour.status) + '</span></td>' +
      '<td>' + fmt((tour.updatedAt || "").slice(0, 10)) + '</td>' +
      '<td><div class="admin-actions">' +
      '<a class="admin-btn" href="tour-form.html?id=' + tour.id + '">Düzenle</a>' +
      '<a class="admin-btn" href="' + preview + '" target="_blank">Önizle</a>' +
      '<button class="admin-btn" data-deactivate="' + tour.id + '">Pasifleştir</button>' +
      '<button class="admin-btn danger" data-delete="' + tour.id + '">Kalıcı Sil</button>' +
      '</div></td>' +
      '</tr>';
  }

  function missingPairRowHtml(otherLang) {
    var label = otherLang === "en" ? "İngilizce" : "Türkçe";
    return '<tr class="admin-subrow admin-subrow-empty"><td></td>' +
      '<td colspan="7"><small>' + label + ' versiyonu bulunamadı.</small></td></tr>';
  }

  async function renderTours(tours) {
    var node = document.getElementById("tour-list");
    if (!tours.length) {
      setState("tour-list", "Tur bulunamadı.");
      return;
    }
    // Aynı slug'a sahip TR/EN kayıtlarını eşleştir (Türkçe ana satır, İngilizce alt satır)
    var pageMap = {};
    tours.forEach(function (t) {
      if (!t.slug) return;
      if (!pageMap[t.slug]) pageMap[t.slug] = {};
      pageMap[t.slug][(t.language || "").toLowerCase()] = t;
    });
    var processed = {};
    var entries = [];
    tours.forEach(function (t) {
      if (!t.slug) { entries.push({ primary: t }); return; }
      if (processed[t.slug]) return;
      processed[t.slug] = true;
      var pair = pageMap[t.slug] || {};
      var primary = pair.tr || pair.en || t;
      var otherLang = (primary.language || "").toLowerCase() === "tr" ? "en" : "tr";
      entries.push({ primary: primary, child: pair[otherLang] || null, otherLang: otherLang, slug: t.slug, needFetch: !pair[otherLang] });
    });
    // Sonuçlarda olmayan dil versiyonunu slug ile getir
    await Promise.all(entries.filter(function (e) { return e.needFetch && e.slug; }).map(function (e) {
      return ApiService.getTourBySlug(e.slug, e.otherLang)
        .then(function (res) { e.child = res || null; })
        .catch(function () { e.child = null; });
    }));

    var rows = entries.map(function (e) {
      var html = tourRowHtml(e.primary, false);
      if (e.child) {
        html += tourRowHtml(e.child, true);
      } else if (e.needFetch) {
        html += missingPairRowHtml(e.otherLang);
      }
      return html;
    }).join("");

    node.innerHTML = '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Görsel</th><th>Tur</th><th>Kategori</th><th>Hedef</th><th>Fiyat</th><th>Durum</th><th>Güncelleme</th><th>İşlemler</th></tr></thead><tbody>' +
      rows + "</tbody></table></div>";

    node.querySelectorAll("[data-deactivate]").forEach(function (button) {
      button.addEventListener("click", function () { deactivateTour(button.dataset.deactivate); });
    });
    node.querySelectorAll("[data-delete]").forEach(function (button) {
      button.addEventListener("click", function () { permanentlyDeleteTour(button.dataset.delete); });
    });
  }

  async function deactivateTour(id) {
    if (!confirm("Bu tur pasifleştirilecek ve public sayfalarda gizlenecek. Devam edilsin mi?")) return;
    await ApiService.adminDeactivateTour(id);
    toast("Tour deactivated successfully");
    refreshTours();
  }

  async function permanentlyDeleteTour(id) {
    var impact = await ApiService.adminDeleteCheck(id);
    if (!impact.canPermanentlyDelete) {
      alert(impact.message);
      return;
    }
    var phrase = prompt("Kalıcı silme için DELETE yazın.");
    if (phrase !== "DELETE") return;
    await ApiService.adminPermanentlyDeleteTour(id);
    toast("Tour permanently deleted");
    refreshTours();
  }

  function renderRouteStops() {
    var list = document.getElementById("map-stops-list");
    if (!list) return;
    if (!routeCoordinates.length) {
      list.innerHTML = '<div class="admin-state" style="margin:0;padding:12px 0">Henüz durak eklenmedi.</div>';
      return;
    }
    list.innerHTML = routeCoordinates.map(function (stop, i) {
      return '<div class="admin-map-stop">' +
        '<span class="admin-map-stop-num">' + (i + 1) + '</span>' +
        '<span class="admin-map-stop-info">' +
          '<strong>' + (stop.name || '-') + '</strong>' +
          (stop.country ? ', ' + stop.country : '') +
          ' <small>(' + (stop.lat || '?') + ', ' + (stop.lng || '?') + ')</small>' +
        '</span>' +
        '<button type="button" class="admin-btn danger" style="min-height:34px;padding:6px 12px;font-size:13px" data-remove-stop="' + i + '">Sil</button>' +
        '</div>';
    }).join('');
    list.querySelectorAll('[data-remove-stop]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        routeCoordinates.splice(Number(btn.dataset.removeStop), 1);
        renderRouteStops();
        saveTourDraft(activeTourDraftKey);
      });
    });
  }

  function renderDayInfo() {
    var list = document.getElementById("day-info-list");
    if (!list) return;
    if (!dayInfo.length) {
      list.innerHTML = '<div class="admin-state" style="margin:0;padding:12px 0">Henüz gün eklenmedi.</div>';
      return;
    }
    // Gün numarasina gore sirali tut ki ekran ve indexler uyumlu olsun.
    dayInfo = dayInfo.slice().sort(function (a, b) { return (a.dayNumber || 0) - (b.dayNumber || 0); });
    list.innerHTML = dayInfo.map(function (d, i) {
      return '<div class="admin-map-stop">' +
        '<span class="admin-map-stop-num">' + (d.dayNumber || (i + 1)) + '</span>' +
        '<span class="admin-map-stop-info">' +
          '<strong>' + esc(d.title) + '</strong>' +
          (d.description ? '<br><small>' + esc(d.description) + '</small>' : '') +
        '</span>' +
        '<button type="button" class="admin-btn danger" style="min-height:34px;padding:6px 12px;font-size:13px" data-remove-day="' + i + '">Sil</button>' +
        '</div>';
    }).join('');
    list.querySelectorAll('[data-remove-day]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        dayInfo.splice(Number(btn.dataset.removeDay), 1);
        renderDayInfo();
        saveTourDraft(activeTourDraftKey);
      });
    });
  }

  function fmtDepartureDate(value) {
    if (!value) return "";
    // value "yyyy-MM-dd" -> "dd.MM.yyyy"
    var parts = String(value).substring(0, 10).split("-");
    if (parts.length === 3) return parts[2] + "." + parts[1] + "." + parts[0];
    return String(value);
  }

  function renderDepartures() {
    var list = document.getElementById("departure-list");
    if (!list) return;
    if (!departures.length) {
      list.innerHTML = '<div class="admin-state" style="margin:0;padding:12px 0">Henüz kalkış tarihi eklenmedi.</div>';
      return;
    }
    // Tarihe gore sirali tut ki ekran ve indexler uyumlu olsun.
    departures = departures.slice().sort(function (a, b) {
      return String(a.departureDate || "").localeCompare(String(b.departureDate || ""));
    });
    list.innerHTML = departures.map(function (d, i) {
      var priceLabel = (d.price != null && d.price !== "") ? Number(d.price).toLocaleString("tr-TR") + " €" : "Tur fiyatı";
      var discounted = (d.discountedPrice != null && d.discountedPrice !== "") ? ' <small>(indirimli: ' + Number(d.discountedPrice).toLocaleString("tr-TR") + ' €)</small>' : '';
      var seats = (d.availableSeats != null && d.availableSeats !== "") ? ' <small>· ' + d.availableSeats + ' kişilik</small>' : '';
      var ret = d.returnDate ? ' → ' + fmtDepartureDate(d.returnDate) : '';
      return '<div class="admin-map-stop">' +
        '<span class="admin-map-stop-num">' + (i + 1) + '</span>' +
        '<span class="admin-map-stop-info">' +
          '<strong>' + fmtDepartureDate(d.departureDate) + ret + '</strong>' +
          '<br><small>' + priceLabel + discounted + seats + '</small>' +
        '</span>' +
        '<button type="button" class="admin-btn danger" style="min-height:34px;padding:6px 12px;font-size:13px" data-remove-departure="' + i + '">Sil</button>' +
        '</div>';
    }).join('');
    list.querySelectorAll('[data-remove-departure]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        departures.splice(Number(btn.dataset.removeDeparture), 1);
        renderDepartures();
        saveTourDraft(activeTourDraftKey);
      });
    });
  }

  async function initTourForm() {
    var id = new URLSearchParams(location.search).get("id");
    var form = document.getElementById("tour-form");
    var imageInput = document.getElementById("tour-images");
    var pdfInput = document.getElementById("tour-pdf");
    activeTourFormId = id || "";
    var draftKey = getTourDraftKey(id);
    activeTourDraftKey = draftKey;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      saveTour(activeTourFormId, draftKey).catch(function (error) {
        alert(error.message);
      });
    });
    imageInput.addEventListener("change", uploadImages);
    if (pdfInput) pdfInput.addEventListener("change", uploadPdf);

    await loadMetadata();

    var categorySelect = document.getElementById("tour-category");
    var shipFields = document.getElementById("ship-cruise-fields");
    function toggleShipFields() {
      if (!shipFields) return;
      var val = categorySelect ? categorySelect.value : "";
      var selectedOption = categorySelect ? categorySelect.options[categorySelect.selectedIndex] : null;
      var displayVal = selectedOption ? selectedOption.text : "";
      shipFields.style.display = (val === "CRUISE" || displayVal === "Ship/Cruise") ? "" : "none";
    }
    if (categorySelect) categorySelect.addEventListener("change", toggleShipFields);

    routeCoordinates = [];
    renderRouteStops();
    var addStopBtn = document.getElementById("map-stop-add");
    if (addStopBtn) {
      addStopBtn.addEventListener("click", function () {
        var nameEl = document.getElementById("map-stop-name");
        var countryEl = document.getElementById("map-stop-country");
        var latEl = document.getElementById("map-stop-lat");
        var lngEl = document.getElementById("map-stop-lng");
        var name = (nameEl ? nameEl.value : "").trim();
        var country = (countryEl ? countryEl.value : "").trim();
        var lat = parseFloat(latEl ? latEl.value : "");
        var lng = parseFloat(lngEl ? lngEl.value : "");
        if (!name || isNaN(lat) || isNaN(lng)) {
          alert("Şehir adı, enlem ve boylam zorunludur.");
          return;
        }
        routeCoordinates.push({ name: name, country: country, lat: lat, lng: lng });
        if (nameEl) nameEl.value = "";
        if (countryEl) countryEl.value = "";
        if (latEl) latEl.value = "";
        if (lngEl) lngEl.value = "";
        renderRouteStops();
        saveTourDraft(activeTourDraftKey);
      });
      ["map-stop-name", "map-stop-country", "map-stop-lat", "map-stop-lng"].forEach(function (elId) {
        var el = document.getElementById(elId);
        if (el) el.addEventListener("keydown", function (e) {
          if (e.key === "Enter") { e.preventDefault(); addStopBtn.click(); }
        });
      });
    }

    dayInfo = [];
    renderDayInfo();
    var addDayBtn = document.getElementById("day-add");
    if (addDayBtn) {
      addDayBtn.addEventListener("click", function () {
        var numEl = document.getElementById("day-number");
        var titleEl = document.getElementById("day-title");
        var descEl = document.getElementById("day-description");
        var num = parseInt(numEl ? numEl.value : "", 10);
        if (isNaN(num)) num = dayInfo.length + 1;
        var title = (titleEl ? titleEl.value : "").trim();
        var description = (descEl ? descEl.value : "").trim();
        if (!title && !description) {
          alert("En az başlık veya açıklama girin.");
          return;
        }
        dayInfo.push({ dayNumber: num, title: title, description: description });
        if (numEl) numEl.value = "";
        if (titleEl) titleEl.value = "";
        if (descEl) descEl.value = "";
        renderDayInfo();
        saveTourDraft(activeTourDraftKey);
      });
    }

    departures = [];
    renderDepartures();
    var addDepartureBtn = document.getElementById("departure-add");
    if (addDepartureBtn) {
      addDepartureBtn.addEventListener("click", function () {
        var dateEl = document.getElementById("departure-date");
        var returnEl = document.getElementById("departure-return-date");
        var priceEl = document.getElementById("departure-price");
        var discEl = document.getElementById("departure-discounted-price");
        var seatsEl = document.getElementById("departure-seats");
        var date = dateEl ? dateEl.value : "";
        if (!date) {
          alert("Kalkış tarihi zorunludur.");
          return;
        }
        var price = priceEl && priceEl.value ? Number(priceEl.value) : null;
        var disc = discEl && discEl.value ? Number(discEl.value) : null;
        var seats = seatsEl && seatsEl.value ? parseInt(seatsEl.value, 10) : null;
        departures.push({
          departureDate: date,
          returnDate: returnEl && returnEl.value ? returnEl.value : null,
          price: price,
          discountedPrice: disc,
          maxSeats: seats,
          availableSeats: seats
        });
        if (dateEl) dateEl.value = "";
        if (returnEl) returnEl.value = "";
        if (priceEl) priceEl.value = "";
        if (discEl) discEl.value = "";
        if (seatsEl) seatsEl.value = "";
        renderDepartures();
        saveTourDraft(activeTourDraftKey);
      });
    }

    if (id) {
      document.getElementById("form-title").textContent = "Turu Düzenle";
      var tour = await ApiService.adminTour(id);
      fillTourForm(tour);
      toggleShipFields();
    } else {
      restoreTourDraft(draftKey);
      renderImagePreview();
      toggleShipFields();
    }
    bindTourDraft(form, draftKey);
  }

  function fillTourForm(tour) {
    ["name", "slug", "language", "destination", "departureCity", "duration", "price", "discountedPrice", "minimumAge", "mainPhoto", "image1", "image2", "image3", "image4", "image5", "image6", "imagealt", "detailPdfUrl", "generalInfo", "placesVisited", "whatExpect", "meet"].forEach(function (field) {
      var node = document.querySelector('[name="' + field + '"]');
      if (node) node.value = tour[field] || "";
    });
    document.getElementById("tour-category").value = enumCategory(tour.category);
    document.getElementById("tour-status").value = tour.status || "";
    document.getElementById("tour-active").checked = tour.isActive !== false;
    var eventTypeEl = document.getElementById("tour-event-type");
    if (eventTypeEl) eventTypeEl.value = tour.eventType || "";
    var shipCompanyEl = document.getElementById("tour-ship-company");
    if (shipCompanyEl) shipCompanyEl.value = tour.shipCompany || "";
    var shipNameEl = document.getElementById("tour-ship-name");
    if (shipNameEl) shipNameEl.value = tour.shipName || "";
    routeCoordinates = Array.isArray(tour.routeCoordinates) ? tour.routeCoordinates.slice() : [];
    renderRouteStops();
    dayInfo = Array.isArray(tour.dayInfo) ? tour.dayInfo.slice() : [];
    renderDayInfo();
    departures = Array.isArray(tour.departures) ? tour.departures.slice() : [];
    renderDepartures();
    renderImagePreview();
  }

  function enumCategory(displayName) {
    var found = (metadata.categories || []).find(function (category) {
      return category.name === displayName || category.displayName === displayName;
    });
    return found ? found.name : "";
  }

  function slugify(text) {
    var map = { "ç": "c", "ğ": "g", "ı": "i", "İ": "i", "ö": "o", "ş": "s", "ü": "u", "Ç": "c", "Ğ": "g", "Ö": "o", "Ş": "s", "Ü": "u" };
    return String(text)
      .replace(/[çğıİöşüÇĞÖŞÜ]/g, function (ch) { return map[ch] || ch; })
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function collectTourForm() {
    var data = {};
    new FormData(document.getElementById("tour-form")).forEach(function (value, key) {
      data[key] = value || null;
    });
    if (!data.slug && data.name) data.slug = slugify(data.name);
    data.isActive = document.getElementById("tour-active").checked;
    data.duration = data.duration ? Number(data.duration) : null;
    data.price = data.price ? Number(data.price) : null;
    data.discountedPrice = data.discountedPrice ? Number(data.discountedPrice) : null;
    data.destinations = data.destination ? [data.destination] : [];
    data.routeCoordinates = routeCoordinates.length ? routeCoordinates : [];
    data.dayInfo = dayInfo.length ? dayInfo : [];
    data.departures = departures.length ? departures : [];
    var eventTypeEl = document.getElementById("tour-event-type");
    data.eventType = eventTypeEl && eventTypeEl.value ? eventTypeEl.value : null;
    // Görsel alanları: boş olanları "" olarak gönder ki backend silmeyi uygulasın
    // (backend yalnızca null OLMAYAN alanları günceller; null gönderilirse görsel silinmez).
    tourImageFields.forEach(function (field) {
      if (!data[field]) data[field] = "";
    });
    if (!data.detailPdfUrl) data.detailPdfUrl = "";
    return data;
  }

  async function saveTour(id, draftKey) {
    var data = collectTourForm();
    if (!data.name || data.name.length < 3) {
      alert("Tur adı en az 3 karakter olmalı.");
      return;
    }
    if (data.price !== null && data.price <= 0) {
      alert("Fiyat sıfırdan büyük olmalı.");
      return;
    }
    if (id) {
      await ApiService.adminUpdateTour(id, data);
      var refreshed = await ApiService.adminTour(id);
      fillTourForm(refreshed);
      toast("Tour updated successfully");
    } else {
      var created = await ApiService.adminCreateTour(data);
      clearTourDraft(draftKey);
      activeTourFormId = created && created.id ? String(created.id) : "";
      activeTourDraftKey = "";
      toast("Tour created successfully");
      history.replaceState(null, "", "tour-form.html?id=" + created.id);
    }
  }

  async function uploadImages(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    var input = event && event.currentTarget ? event.currentTarget : document.getElementById("tour-images");
    var files = input ? Array.from(input.files || []) : [];
    if (!files.length) return;
    saveTourDraft(activeTourDraftKey);

    var allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    var validFiles = [];
    var clientWarnings = [];

    files.forEach(function (file) {
      if (allowedTypes.indexOf(file.type) === -1) {
        clientWarnings.push(file.name + " desteklenen bir görsel tipi değil.");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        clientWarnings.push(file.name + " 8 MB sınırından büyük.");
        return;
      }
      validFiles.push(file);
    });

    if (!validFiles.length) {
      setUploadStatus(clientWarnings.join(" "));
      if (input) input.value = "";
      return;
    }

    setUploadStatus("Görseller yükleniyor...");
    if (input) input.disabled = true;

    try {
      var response = await ApiService.adminUploadTourImages(validFiles);
      var imageUrls = response && Array.isArray(response.imageUrls) ? response.imageUrls : [];
      addUploadedImageUrls(imageUrls);
      saveTourDraft(activeTourDraftKey);
      renderImagePreview();
      var warnings = clientWarnings.concat(response && response.warnings ? response.warnings : []);
      var message = imageUrls.length ? "Görseller yüklendi." : "Görsel yüklenemedi.";
      if (warnings.length) message += " " + warnings.join(" ");
      setUploadStatus(message);
      toast(message);
    } catch (error) {
      var authError = error && (error.status === 401 || error.status === 403);
      var message = authError
        ? "Oturum suresi doldu veya admin yetkisi yok. Lutfen tekrar giris yapin."
        : "Gorsel yukleme basarisiz: " + (error.message || "HTTP hatasi");
      setUploadStatus(message);
      toast(authError ? "Oturum suresi doldu." : "Gorsel yukleme basarisiz.");
      /*
      setUploadStatus("Görsel yükleme başarısız: " + (error.message || "HTTP hatası"));
      toast("Görsel yükleme başarısız.");
      */
    } finally {
      if (input) {
        input.disabled = false;
        input.value = "";
      }
    }
  }

  function setPdfUploadStatus(message) {
    var node = document.getElementById("pdf-upload-status");
    if (node) node.textContent = message || "";
  }

  async function uploadPdf(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    var input = event && event.currentTarget ? event.currentTarget : document.getElementById("tour-pdf");
    var file = input && input.files ? input.files[0] : null;
    if (!file) return;
    saveTourDraft(activeTourDraftKey);

    if (file.type !== "application/pdf") {
      setPdfUploadStatus(file.name + " bir PDF dosyası değil.");
      if (input) input.value = "";
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setPdfUploadStatus(file.name + " 20 MB sınırından büyük.");
      if (input) input.value = "";
      return;
    }

    setPdfUploadStatus("PDF yükleniyor...");
    if (input) input.disabled = true;

    try {
      var response = await ApiService.adminUploadTourPdf(file);
      if (response && response.pdfUrl) {
        var pdfField = document.querySelector('[name="detailPdfUrl"]');
        if (pdfField) pdfField.value = response.pdfUrl;
        saveTourDraft(activeTourDraftKey);
        setPdfUploadStatus("PDF yüklendi.");
        toast("PDF yüklendi.");
      } else {
        var message = "PDF yüklenemedi." + (response && response.warning ? " " + response.warning : "");
        setPdfUploadStatus(message);
        toast("PDF yüklenemedi.");
      }
    } catch (error) {
      var authError = error && (error.status === 401 || error.status === 403);
      var message = authError
        ? "Oturum suresi doldu veya admin yetkisi yok. Lutfen tekrar giris yapin."
        : "PDF yukleme basarisiz: " + (error.message || "HTTP hatasi");
      setPdfUploadStatus(message);
      toast(authError ? "Oturum suresi doldu." : "PDF yukleme basarisiz.");
    } finally {
      if (input) {
        input.disabled = false;
        input.value = "";
      }
    }
  }

  function addUploadedImageUrls(urls) {
    (urls || []).forEach(function (url) {
      var mainPhoto = document.querySelector('[name="mainPhoto"]');
      var galleryField = ["image1", "image2", "image3", "image4", "image5", "image6"].find(function (field) {
        var node = document.querySelector('[name="' + field + '"]');
        return node && !node.value;
      });

      if (mainPhoto && !mainPhoto.value) mainPhoto.value = url;
      if (galleryField) {
        document.querySelector('[name="' + galleryField + '"]').value = url;
      } else if (mainPhoto && !mainPhoto.value) {
        mainPhoto.value = url;
      }
    });
  }

  function removeTourImage(url) {
    // Bu görseli tutan tüm alanları temizle
    tourImageFields.forEach(function (field) {
      var node = document.querySelector('[name="' + field + '"]');
      if (node && node.value === url) node.value = "";
    });
    // Kapak silindiyse, ilk dolu galeri görselini kapak yap
    var mainNode = document.querySelector('[name="mainPhoto"]');
    if (mainNode && !mainNode.value) {
      var next = ["image1", "image2", "image3", "image4", "image5", "image6"]
        .map(function (f) { return document.querySelector('[name="' + f + '"]'); })
        .filter(function (n) { return n && n.value; })[0];
      if (next) mainNode.value = next.value;
    }
    saveTourDraft(activeTourDraftKey);
    renderImagePreview();
  }

  function makeTourCover(url) {
    var mainNode = document.querySelector('[name="mainPhoto"]');
    if (mainNode) mainNode.value = url;
    saveTourDraft(activeTourDraftKey);
    renderImagePreview();
  }

  function renderImagePreview() {
    var urls = tourImageFields
      .map(function (field) {
        var node = document.querySelector('[name="' + field + '"]');
        return node ? node.value : "";
      })
      .filter(Boolean)
      .filter(function (url, index, allUrls) { return allUrls.indexOf(url) === index; });
    var node = document.getElementById("image-preview");
    if (!node) return;
    var mainNode = document.querySelector('[name="mainPhoto"]');
    var mainUrl = mainNode ? mainNode.value : "";
    node.innerHTML = urls.length ? urls.map(function (url) {
      var isCover = url === mainUrl;
      return '<div class="admin-image-item">' +
        '<img src="' + resolveImageUrl(url) + '" alt="">' +
        '<span class="admin-image-tag">' + (isCover ? "Kapak" : "Galeri") + '</span>' +
        (isCover ? "" : '<button type="button" class="admin-image-cover" data-url="' + encodeURIComponent(url) + '">Kapak yap</button>') +
        '<button type="button" class="admin-image-remove" data-url="' + encodeURIComponent(url) + '" title="Görseli kaldır">✕ Kaldır</button>' +
        '</div>';
    }).join("") : '<div class="admin-state">Henüz görsel seçilmedi.</div>';
    Array.prototype.forEach.call(node.querySelectorAll(".admin-image-remove"), function (btn) {
      btn.addEventListener("click", function () { removeTourImage(decodeURIComponent(btn.getAttribute("data-url"))); });
    });
    Array.prototype.forEach.call(node.querySelectorAll(".admin-image-cover"), function (btn) {
      btn.addEventListener("click", function () { makeTourCover(decodeURIComponent(btn.getAttribute("data-url"))); });
    });
  }

  // ---------------------------------------------------------------------------
  // Homepage editor (admin/homepage.html)
  // ---------------------------------------------------------------------------
  var hpSection1 = [];
  var hpSection2 = []; // { slug, name, destination, mainPhoto }
  var HP_S2_MAX = 5;

  function hpEsc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function renderHpSection1() {
    var list = document.getElementById("hp-s1-list");
    if (!list) return;
    if (!hpSection1.length) {
      list.innerHTML = '<p class="hp-muted">Henüz kart yok. "Kart Ekle" ile başlayın.</p>';
      return;
    }
    list.innerHTML = hpSection1.map(function (card, i) {
      return [
        '<div class="hp-row" data-index="' + i + '">',
        '<img class="hp-row__thumb" src="' + hpEsc(card.imageUrl || "") + '" alt="" onerror="this.style.opacity=0.3">',
        '<div class="hp-row__fields">',
        '<input class="hp-f-image" type="text" placeholder="Görsel URL (veya aşağıdan yükleyin)" value="' + hpEsc(card.imageUrl || "") + '">',
        '<input class="hp-f-file" type="file" accept="image/*">',
        '<input class="hp-f-title" type="text" placeholder="Başlık (örn: Küba)" value="' + hpEsc(card.title || "") + '">',
        '<input class="hp-f-country" type="text" placeholder="Ülke anahtarı (örn: Cuba, Japan)" value="' + hpEsc(card.country || "") + '">',
        '<textarea class="hp-f-desc" placeholder="Açıklama">' + hpEsc(card.description || "") + '</textarea>',
        '</div>',
        '<div class="hp-row__actions">',
        '<button class="admin-btn hp-up" type="button" title="Yukarı">↑</button>',
        '<button class="admin-btn hp-down" type="button" title="Aşağı">↓</button>',
        '<button class="admin-btn danger hp-remove" type="button" title="Sil"><i class="fa fa-trash"></i></button>',
        '</div>',
        '</div>'
      ].join("");
    }).join("");

    Array.prototype.forEach.call(list.querySelectorAll(".hp-row"), function (row) {
      var i = Number(row.getAttribute("data-index"));
      row.querySelector(".hp-f-image").addEventListener("input", function (e) {
        hpSection1[i].imageUrl = e.target.value;
        var thumb = row.querySelector(".hp-row__thumb");
        if (thumb) thumb.src = e.target.value;
      });
      row.querySelector(".hp-f-title").addEventListener("input", function (e) { hpSection1[i].title = e.target.value; });
      row.querySelector(".hp-f-country").addEventListener("input", function (e) { hpSection1[i].country = e.target.value; });
      row.querySelector(".hp-f-desc").addEventListener("input", function (e) { hpSection1[i].description = e.target.value; });
      row.querySelector(".hp-f-file").addEventListener("change", function (e) {
        hpUploadCardImage(e.target.files, i);
      });
      row.querySelector(".hp-up").addEventListener("click", function () { hpMove(i, -1); });
      row.querySelector(".hp-down").addEventListener("click", function () { hpMove(i, 1); });
      row.querySelector(".hp-remove").addEventListener("click", function () { hpSection1.splice(i, 1); renderHpSection1(); });
    });
  }

  function hpMove(index, delta) {
    var target = index + delta;
    if (target < 0 || target >= hpSection1.length) return;
    var tmp = hpSection1[index];
    hpSection1[index] = hpSection1[target];
    hpSection1[target] = tmp;
    renderHpSection1();
  }

  async function hpUploadCardImage(files, index) {
    if (!files || !files.length) return;
    try {
      toast("Görsel yükleniyor...");
      var response = await ApiService.adminUploadTourImages(files);
      var urls = response && Array.isArray(response.imageUrls) ? response.imageUrls : [];
      if (urls.length) {
        hpSection1[index].imageUrl = urls[0];
        renderHpSection1();
        toast("Görsel yüklendi.");
      } else {
        toast("Görsel yüklenemedi.");
      }
    } catch (error) {
      toast("Görsel yükleme başarısız: " + (error.message || "hata"));
    }
  }

  function renderHpSection2Selected() {
    var wrap = document.getElementById("hp-s2-selected");
    var count = document.getElementById("hp-s2-count");
    if (count) count.textContent = String(hpSection2.length);
    if (!wrap) return;
    if (!hpSection2.length) {
      wrap.innerHTML = '<p class="hp-muted">Henüz tur seçilmedi.</p>';
      return;
    }
    wrap.innerHTML = hpSection2.map(function (t, i) {
      return [
        '<div class="hp-selected__item" data-index="' + i + '">',
        '<img src="' + hpEsc(t.mainPhoto || "") + '" alt="" onerror="this.style.opacity=0.3">',
        '<div class="hp-selected__meta"><strong>' + hpEsc(t.name || t.slug) + '</strong><br><small>' + hpEsc(t.destination || "") + ' · ' + hpEsc(t.slug) + '</small></div>',
        '<button class="admin-btn hp-s2-up" type="button" title="Yukarı">↑</button>',
        '<button class="admin-btn hp-s2-down" type="button" title="Aşağı">↓</button>',
        '<button class="admin-btn danger hp-s2-remove" type="button"><i class="fa fa-times"></i></button>',
        '</div>'
      ].join("");
    }).join("");
    Array.prototype.forEach.call(wrap.querySelectorAll(".hp-selected__item"), function (item) {
      var i = Number(item.getAttribute("data-index"));
      item.querySelector(".hp-s2-up").addEventListener("click", function () { hpMoveS2(i, -1); });
      item.querySelector(".hp-s2-down").addEventListener("click", function () { hpMoveS2(i, 1); });
      item.querySelector(".hp-s2-remove").addEventListener("click", function () { hpSection2.splice(i, 1); renderHpSection2Selected(); });
    });
  }

  function hpMoveS2(index, delta) {
    var target = index + delta;
    if (target < 0 || target >= hpSection2.length) return;
    var tmp = hpSection2[index];
    hpSection2[index] = hpSection2[target];
    hpSection2[target] = tmp;
    renderHpSection2Selected();
  }

  function hpAddTour(tour) {
    if (hpSection2.length >= HP_S2_MAX) { toast("En fazla " + HP_S2_MAX + " tur seçebilirsiniz."); return; }
    if (hpSection2.some(function (t) { return t.slug === tour.slug; })) { toast("Bu tur zaten seçili."); return; }
    hpSection2.push({ slug: tour.slug, name: tour.name, destination: tour.destination, mainPhoto: tour.mainPhoto });
    renderHpSection2Selected();
  }

  async function hpSearchTours(term) {
    var results = document.getElementById("hp-s2-results");
    if (!results) return;
    if (!term || term.trim().length < 2) { results.innerHTML = '<p class="hp-muted">En az 2 harf yazın.</p>'; return; }
    results.innerHTML = '<p class="hp-muted">Aranıyor...</p>';
    try {
      var response = await ApiService.adminTours({ q: term.trim(), size: 12 });
      var tours = (response && response.content) || [];
      if (!tours.length) { results.innerHTML = '<p class="hp-muted">Sonuç bulunamadı.</p>'; return; }
      results.innerHTML = tours.map(function (t, idx) {
        return [
          '<div class="hp-result" data-idx="' + idx + '">',
          '<img src="' + hpEsc(t.mainPhoto || "") + '" alt="" onerror="this.style.opacity=0.3">',
          '<div class="hp-result__meta"><strong>' + hpEsc(t.name) + '</strong><br><small>' + hpEsc(t.destination || "") + ' · ' + hpEsc(t.language || "") + ' · ' + hpEsc(t.status || "") + '</small></div>',
          '<button class="admin-btn primary hp-add" type="button">Ekle</button>',
          '</div>'
        ].join("");
      }).join("");
      Array.prototype.forEach.call(results.querySelectorAll(".hp-result"), function (node) {
        var t = tours[Number(node.getAttribute("data-idx"))];
        node.querySelector(".hp-add").addEventListener("click", function () { hpAddTour(t); });
      });
    } catch (error) {
      results.innerHTML = '<p class="hp-muted">Arama başarısız: ' + hpEsc(error.message || "hata") + '</p>';
    }
  }

  async function hpResolveSlugs(slugs) {
    var resolved = [];
    for (var i = 0; i < slugs.length; i++) {
      var slug = slugs[i];
      if (!slug) continue;
      var entry = { slug: slug, name: slug, destination: "", mainPhoto: "" };
      try {
        var tour = await ApiService.getTourBySlug(slug, "tr");
        if (tour) { entry.name = tour.name || slug; entry.destination = tour.destination || ""; entry.mainPhoto = tour.mainPhoto || ""; }
      } catch (e) { /* keep slug-only entry */ }
      resolved.push(entry);
    }
    return resolved;
  }

  async function hpSave() {
    var btn = document.getElementById("hp-save");
    if (btn) btn.disabled = true;
    try {
      var payload = {
        section1: hpSection1
          .filter(function (c) { return (c.title && c.title.trim()) || (c.imageUrl && c.imageUrl.trim()); })
          .map(function (c) {
            return { imageUrl: (c.imageUrl || "").trim(), title: (c.title || "").trim(), description: (c.description || "").trim(), country: (c.country || "").trim() };
          }),
        section2: hpSection2.map(function (t) { return t.slug; })
      };
      await ApiService.adminSaveHomepage(payload);
      toast("Anasayfa kaydedildi.");
    } catch (error) {
      toast("Kaydetme başarısız: " + (error.message || "hata"));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function initHomepage() {
    var config = {};
    try { config = await ApiService.adminGetHomepage(); } catch (e) { config = {}; }
    hpSection1 = Array.isArray(config && config.section1) ? config.section1.map(function (c) {
      return { imageUrl: c.imageUrl || "", title: c.title || "", description: c.description || "", country: c.country || "" };
    }) : [];
    var slugs = Array.isArray(config && config.section2) ? config.section2 : [];

    renderHpSection1();
    renderHpSection2Selected();

    document.getElementById("hp-s1-add").addEventListener("click", function () {
      hpSection1.push({ imageUrl: "", title: "", description: "", country: "" });
      renderHpSection1();
    });
    document.getElementById("hp-save").addEventListener("click", hpSave);

    var searchInput = document.getElementById("hp-s2-search");
    var searchTimer = null;
    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimer);
      var term = searchInput.value;
      searchTimer = setTimeout(function () { hpSearchTours(term); }, 300);
    });

    // Resolve already-saved tour slugs to display names/photos.
    hpSection2 = await hpResolveSlugs(slugs);
    renderHpSection2Selected();
  }

  // ==================== RESERVATIONS PAGE ====================
  function initReservations() {
    var form = document.getElementById("reservations-toolbar");
    var searchEl = document.getElementById("reservation-search");
    var statusEl = document.getElementById("reservation-status");
    var resultsEl = document.getElementById("reservations-results");
    var summaryEl = document.getElementById("reservations-summary");
    if (!resultsEl) return;

    function rEsc(v) {
      return String(v == null ? "" : v).replace(/[&<>"]/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
      });
    }
    function fmtDate(v) {
      if (!v) return "";
      var p = String(v).substring(0, 10).split("-");
      return p.length === 3 ? p[2] + "." + p[1] + "." + p[0] : String(v);
    }
    function fmtDateTime(v) {
      if (!v) return "";
      var d = new Date(v);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("tr-TR") + " " + d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    }
    var STATUS_TR = { PENDING: "Onay bekliyor", APPROVED: "Onaylandı", REJECTED: "Reddedildi", CANCELLED: "İptal edildi" };
    function statusBadge(s) {
      var cls = (s || "").toLowerCase();
      return '<span class="res-badge res-badge--' + rEsc(cls) + '">' + rEsc(STATUS_TR[s] || s || "-") + "</span>";
    }

    var searchTimer = null;

    async function runSearch() {
      var q = searchEl ? searchEl.value.trim() : "";
      var status = statusEl ? statusEl.value : "";
      resultsEl.innerHTML = '<div class="admin-state">Yükleniyor...</div>';
      try {
        var rows = await ApiService.adminSearchBookings({ q: q, status: status });
        render(Array.isArray(rows) ? rows : []);
      } catch (err) {
        resultsEl.innerHTML = '<div class="admin-state">Rezervasyonlar yüklenemedi: ' + rEsc(err && err.message) + "</div>";
      }
    }

    function render(rows) {
      if (summaryEl) summaryEl.textContent = rows.length ? rows.length + " rezervasyon" : "";
      if (!rows.length) {
        resultsEl.innerHTML = '<div class="admin-state">Rezervasyon bulunamadı.</div>';
        return;
      }
      // Tura göre grupla -> her turda kalkış tarihine göre grupla
      var byTour = {}, tourOrder = [];
      rows.forEach(function (r) {
        var key = r.tourId != null ? "t" + r.tourId : "n" + (r.tourName || "");
        if (!byTour[key]) { byTour[key] = { tourName: r.tourName, destination: r.tourDestination, deps: {}, depOrder: [], total: 0 }; tourOrder.push(key); }
        var g = byTour[key]; g.total++;
        var dkey = r.departureDate || "none";
        if (!g.deps[dkey]) { g.deps[dkey] = { date: r.departureDate, ret: r.departureReturnDate, list: [], approvedPeople: 0 }; g.depOrder.push(dkey); }
        var d = g.deps[dkey]; d.list.push(r);
        if (r.status === "APPROVED") d.approvedPeople += (r.numberOfPeople || 0);
      });

      var html = "";
      tourOrder.forEach(function (key) {
        var g = byTour[key];
        html += '<section class="admin-card res-tour">';
        html += '<div class="res-tour__title">' +
          '<span class="res-tour__name"><i class="fa fa-suitcase"></i> ' + rEsc(g.tourName || "(tur)") + "</span>" +
          (g.destination ? '<span class="res-tour__dest"><i class="fa fa-map-marker-alt"></i> ' + rEsc(g.destination) + "</span>" : "") +
          '<span class="res-tour__count">' + g.total + " rezervasyon</span></div>";
        g.depOrder.forEach(function (dkey) {
          var d = g.deps[dkey];
          var dlabel = d.date ? (fmtDate(d.date) + (d.ret ? " → " + fmtDate(d.ret) : "")) : "Tarih belirtilmemiş";
          html += '<div class="res-dep">';
          html += '<div class="res-dep__head"><i class="fa fa-calendar-alt"></i> ' + rEsc(dlabel) +
            ' <span class="res-dep__meta">' + d.list.length + " rezervasyon · " + d.approvedPeople + " onaylı kişi</span></div>";
          html += '<div class="admin-table-wrap"><table class="admin-table"><thead><tr>' +
            "<th>Kişi</th><th>İletişim</th><th>Kişi Sayısı</th><th>Not</th><th>Durum</th><th>Talep Tarihi</th><th>İşlemler</th>" +
            "</tr></thead><tbody>";
          d.list.forEach(function (r) { html += renderBookingRow(r); });
          html += "</tbody></table></div></div>";
        });
        html += "</section>";
      });
      resultsEl.innerHTML = html;
      bindActions();
    }

    function renderBookingRow(r) {
      var actions = "";
      if (r.status === "PENDING") {
        actions = '<button class="admin-btn primary res-act" data-act="approve" data-id="' + r.id + '">Onayla</button> ' +
                  '<button class="admin-btn danger res-act" data-act="reject" data-id="' + r.id + '">Reddet</button> ';
      } else if (r.status === "APPROVED") {
        actions = '<button class="admin-btn res-act" data-act="cancel" data-id="' + r.id + '">İptal</button> ';
      }
      // Silme her durumda mevcut (test/eski kayıtları temizlemek için).
      actions += '<button class="admin-btn danger res-act res-act--delete" data-act="delete" data-id="' + r.id + '" title="Kalıcı olarak sil"><i class="fa fa-trash"></i> Sil</button>';
      var contact = (r.userPhone ? '<div><i class="fa fa-phone"></i> ' + rEsc(r.userPhone) + "</div>" : "") +
                    (r.userEmail ? '<div><i class="fa fa-envelope"></i> ' + rEsc(r.userEmail) + "</div>" : "");
      var note = (r.userMessage ? '<div class="res-note__msg">"' + rEsc(r.userMessage) + '"</div>' : "") +
                 (r.adminNote ? '<div class="res-note__admin">Not: ' + rEsc(r.adminNote) + "</div>" : "");
      return "<tr>" +
        "<td><strong>" + rEsc(r.userName || "-") + "</strong></td>" +
        '<td class="res-contact">' + (contact || "—") + "</td>" +
        "<td>" + (r.numberOfPeople || 1) + " kişi</td>" +
        '<td class="res-note">' + (note || "—") + "</td>" +
        "<td>" + statusBadge(r.status) + "</td>" +
        '<td class="res-date">' + rEsc(fmtDateTime(r.createdAt)) + "</td>" +
        '<td class="res-actions">' + actions + "</td>" +
      "</tr>";
    }

    function bindActions() {
      Array.prototype.forEach.call(resultsEl.querySelectorAll(".res-act"), function (btn) {
        btn.addEventListener("click", async function () {
          var id = btn.dataset.id, act = btn.dataset.act;
          try {
            if (act === "approve") {
              var note = prompt("Onay notu (zorunlu):", "Onaylandı");
              if (note === null) return;
              if (!note.trim()) { alert("Not zorunlu."); return; }
              btn.disabled = true;
              await ApiService.approveBooking(id, { adminNote: note.trim() });
            } else if (act === "reject") {
              var reason = prompt("Red nedeni (zorunlu):");
              if (reason === null) return;
              if (!reason.trim()) { alert("Red nedeni zorunlu."); return; }
              btn.disabled = true;
              await ApiService.rejectBooking(id, { rejectionReason: reason.trim() });
            } else if (act === "cancel") {
              if (!confirm("Bu rezervasyon iptal edilsin mi?")) return;
              btn.disabled = true;
              await ApiService.cancelBooking(id);
            } else if (act === "delete") {
              if (!confirm("Bu rezervasyon KALICI olarak silinsin mi? Bu işlem geri alınamaz.")) return;
              btn.disabled = true;
              await ApiService.deleteBooking(id);
            }
            await runSearch();
          } catch (err) {
            btn.disabled = false;
            alert("İşlem başarısız: " + (err && err.message ? err.message : ""));
          }
        });
      });
    }

    if (form) form.addEventListener("submit", function (e) { e.preventDefault(); runSearch(); });
    if (searchEl) searchEl.addEventListener("input", function () { clearTimeout(searchTimer); searchTimer = setTimeout(runSearch, 350); });
    if (statusEl) statusEl.addEventListener("change", runSearch);
    runSearch(); // ilk açılış: tüm rezervasyonlar
  }

  // ==================== GEMİ BİLGİLERİ (admin/ships.html) ====================
  function initShips() {
    var searchEl = document.getElementById("ship-search");
    var newBtn = document.getElementById("ship-new-btn");
    var listEl = document.getElementById("ships-list");
    var editorEl = document.getElementById("ship-editor");
    var summaryEl = document.getElementById("ships-summary");
    if (!listEl || !editorEl) return;

    var ships = [];
    var companies = [];
    var draft = null;

    function sEsc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
    function assetUrl(u) { if (!u) return ""; return /^https?:\/\//.test(u) ? u : "../" + String(u).replace(/^\//, ""); }
    function clone(o) { return JSON.parse(JSON.stringify(o)); }

    async function load() {
      summaryEl.textContent = "Yükleniyor...";
      try {
        ships = (await ApiService.listShips()) || [];
        companies = (await ApiService.listShipCompanies()) || [];
      } catch (e) { summaryEl.textContent = "Gemiler yüklenemedi: " + (e && e.message || ""); return; }
      renderList();
    }

    function renderList() {
      var q = (searchEl.value || "").toLowerCase().trim();
      var filtered = ships.filter(function (s) { return !q || ((s.name || "") + " " + (s.company || "") + " " + (s.slug || "")).toLowerCase().indexOf(q) >= 0; });
      summaryEl.textContent = ships.length + " gemi" + (q ? (" · " + filtered.length + " eşleşme") : "");
      var groups = {};
      filtered.forEach(function (s) { var c = s.company || "Diğer"; (groups[c] = groups[c] || []).push(s); });
      var html = "";
      Object.keys(groups).sort().forEach(function (c) {
        html += '<div class="ship-group"><h4>' + sEsc(c) + ' <span>(' + groups[c].length + ')</span></h4>';
        groups[c].sort(function (a, b) { return (a.name || "").localeCompare(b.name || ""); }).forEach(function (s) {
          html += '<div class="ship-row">'
            + '<img class="ship-row__img" src="' + sEsc(assetUrl((s.photos && s.photos[0]) || "")) + '" alt="" onerror="this.style.visibility=\'hidden\'">'
            + '<div class="ship-row__info"><strong>' + sEsc(s.name) + '</strong><small>' + sEsc(s.slug) + ' · ' + ((s.photos || []).length) + ' foto · ' + ((s.cabins || []).length) + ' kabin</small></div>'
            + '<button class="admin-btn ship-edit" data-slug="' + sEsc(s.slug) + '">Düzenle</button>'
            + '</div>';
        });
        html += '</div>';
      });
      listEl.innerHTML = html || '<p class="admin-muted">Eşleşen gemi yok.</p>';
      Array.prototype.forEach.call(listEl.querySelectorAll(".ship-edit"), function (b) {
        b.addEventListener("click", function () { var s = ships.find(function (x) { return x.slug === b.dataset.slug; }); if (s) openEditor(clone(s), false); });
      });
    }

    function openEditor(ship, isNew) {
      draft = ship || { slug: "", name: "", company: "", videoUrl: "", description: [], photos: [], decks: [], cabins: [] };
      draft._new = !!isNew;
      renderEditor();
      editorEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function photoCard(u, i) {
      return '<div class="ship-thumb"><img src="' + sEsc(assetUrl(u)) + '" alt="" onerror="this.style.opacity=.3">'
        + '<button class="ship-thumb-x" data-kind="photo" data-idx="' + i + '" type="button" title="Kaldır">&times;</button></div>';
    }
    function cabinRow(c, i) {
      return '<div class="ship-cabin-row">'
        + '<img src="' + sEsc(assetUrl(c.image)) + '" alt="" onerror="this.style.opacity=.3">'
        + '<input class="sf-cabin-label" data-idx="' + i + '" value="' + sEsc(c.label || "") + '" placeholder="Etiket">'
        + '<label class="sf-cabin-temsili"><input type="checkbox" data-idx="' + i + '" ' + (c.temsili ? "checked" : "") + '> Temsili</label>'
        + '<button class="ship-thumb-x" data-kind="cabin" data-idx="' + i + '" type="button">&times;</button></div>';
    }

    function renderEditor() {
      var d = draft;
      var compOpts = companies.map(function (c) { return '<option value="' + sEsc(c) + '">'; }).join("");
      editorEl.innerHTML =
        '<div class="admin-card ship-editor-card">'
        + '<div class="ship-editor-head"><h3>' + (d._new ? "Yeni Gemi" : sEsc(d.name || d.slug)) + '</h3><button class="admin-btn ship-close" type="button">Kapat</button></div>'
        + '<div class="admin-form-row">'
        + '<div class="admin-field"><label>Slug (URL anahtarı)</label><input id="sf-slug" ' + (d._new ? "" : "readonly") + ' value="' + sEsc(d.slug) + '" placeholder="orn: costa-magica"></div>'
        + '<div class="admin-field"><label>Gemi Adı</label><input id="sf-name" value="' + sEsc(d.name) + '"></div></div>'
        + '<div class="admin-form-row">'
        + '<div class="admin-field"><label>Şirket</label><input id="sf-company" list="sf-companies" value="' + sEsc(d.company) + '"><datalist id="sf-companies">' + compOpts + '</datalist></div>'
        + '<div class="admin-field"><label>Video (YouTube embed URL)</label><input id="sf-video" value="' + sEsc(d.videoUrl) + '"></div></div>'
        + '<div class="admin-field"><label>Açıklama / teknik bilgiler (her satır bir paragraf)</label><textarea id="sf-desc" rows="7">' + sEsc((d.description || []).join("\n")) + '</textarea></div>'
        + '<div class="ship-media"><label>Galeri Fotoğrafları (' + (d.photos || []).length + ')</label><div class="ship-thumbs">' + (d.photos || []).map(photoCard).join("") + '</div>'
        + '<div class="ship-media-actions"><button class="admin-btn ship-upload" data-target="photo" type="button"><i class="fa fa-upload"></i> Görsel Yükle</button><button class="admin-btn ship-addurl" data-target="photo" type="button">URL ile Ekle</button></div></div>'
        + '<div class="ship-media"><label>Kabinler (' + (d.cabins || []).length + ')</label><div id="sf-cabins">' + (d.cabins || []).map(cabinRow).join("") + '</div>'
        + '<div class="ship-media-actions"><button class="admin-btn ship-upload" data-target="cabin" type="button"><i class="fa fa-upload"></i> Kabin Görseli Yükle</button><button class="admin-btn ship-addurl" data-target="cabin" type="button">Kabin URL ile Ekle</button></div></div>'
        + '<div class="admin-field"><label>Güverte Planı Görselleri (her satır bir URL)</label><textarea id="sf-decks" rows="3">' + sEsc((d.decks || []).join("\n")) + '</textarea></div>'
        + '<div class="ship-editor-foot"><button class="admin-btn primary ship-save" type="button"><i class="fa fa-save"></i> Kaydet</button>'
        + (d._new ? "" : '<button class="admin-btn danger ship-delete" type="button">Sil</button>')
        + '<a class="admin-btn ship-preview" target="_blank" href="../template_ship_detail_page.html?ship=' + encodeURIComponent(d.slug) + '">Önizle</a></div>'
        + '</div>';
      bindEditor();
    }

    function captureFields() {
      var g = function (id) { var el = document.getElementById(id); return el ? el.value : ""; };
      draft.slug = g("sf-slug").trim().toLowerCase();
      draft.name = g("sf-name").trim();
      draft.company = g("sf-company").trim();
      draft.videoUrl = g("sf-video").trim();
      draft.description = g("sf-desc").split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean);
      draft.decks = g("sf-decks").split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean);
      Array.prototype.forEach.call(editorEl.querySelectorAll(".sf-cabin-label"), function (inp) {
        var i = +inp.dataset.idx; if (draft.cabins[i]) draft.cabins[i].label = inp.value.trim();
      });
      Array.prototype.forEach.call(editorEl.querySelectorAll(".sf-cabin-temsili input"), function (chk) {
        var i = +chk.dataset.idx; if (draft.cabins[i]) draft.cabins[i].temsili = chk.checked;
      });
    }

    function uploadTo(target) {
      var inp = document.createElement("input");
      inp.type = "file"; inp.accept = "image/*"; inp.multiple = true;
      inp.addEventListener("change", async function () {
        if (!inp.files || !inp.files.length) return;
        captureFields();
        try {
          var resp = await ApiService.uploadShipImages(inp.files);
          var urls = (resp && resp.imageUrls) || [];
          urls.forEach(function (u) {
            if (target === "photo") draft.photos.push(u);
            else draft.cabins.push({ label: "Kabin " + (draft.cabins.length + 1), image: u, temsili: false });
          });
          renderEditor();
        } catch (e) { alert("Yükleme başarısız: " + (e && e.message || "")); }
      });
      inp.click();
    }

    function bindEditor() {
      editorEl.querySelector(".ship-close").addEventListener("click", function () { editorEl.innerHTML = ""; draft = null; });
      Array.prototype.forEach.call(editorEl.querySelectorAll(".ship-upload"), function (b) { b.addEventListener("click", function () { uploadTo(b.dataset.target); }); });
      Array.prototype.forEach.call(editorEl.querySelectorAll(".ship-addurl"), function (b) {
        b.addEventListener("click", function () {
          var u = prompt("Görsel URL:"); if (!u) return; captureFields();
          if (b.dataset.target === "photo") draft.photos.push(u.trim());
          else draft.cabins.push({ label: "Kabin " + (draft.cabins.length + 1), image: u.trim(), temsili: false });
          renderEditor();
        });
      });
      Array.prototype.forEach.call(editorEl.querySelectorAll(".ship-thumb-x"), function (b) {
        b.addEventListener("click", function () {
          captureFields(); var i = +b.dataset.idx;
          if (b.dataset.kind === "photo") draft.photos.splice(i, 1); else draft.cabins.splice(i, 1);
          renderEditor();
        });
      });
      var saveBtn = editorEl.querySelector(".ship-save");
      if (saveBtn) saveBtn.addEventListener("click", saveDraft);
      var delBtn = editorEl.querySelector(".ship-delete");
      if (delBtn) delBtn.addEventListener("click", deleteDraft);
    }

    async function saveDraft() {
      captureFields();
      if (!draft.slug) { alert("Slug zorunlu."); return; }
      if (!draft.name) { alert("Gemi adı zorunlu."); return; }
      var dto = {
        slug: draft.slug, name: draft.name, company: draft.company, videoUrl: draft.videoUrl,
        description: draft.description, photos: draft.photos, decks: draft.decks,
        cabins: draft.cabins.map(function (c) { return { label: c.label, image: c.image, temsili: !!c.temsili }; }),
        isActive: true
      };
      try {
        if (draft._new) await ApiService.createShip(dto); else await ApiService.updateShip(draft.slug, dto);
        editorEl.innerHTML = ""; draft = null;
        await load();
      } catch (e) { alert("Kaydedilemedi: " + (e && e.message || "")); }
    }

    async function deleteDraft() {
      if (!confirm("Bu gemi kalıcı olarak silinsin mi?")) return;
      try { await ApiService.deleteShip(draft.slug); editorEl.innerHTML = ""; draft = null; await load(); }
      catch (e) { alert("Silinemedi: " + (e && e.message || "")); }
    }

    if (newBtn) newBtn.addEventListener("click", function () { openEditor(null, true); });
    if (searchEl) searchEl.addEventListener("input", function () { clearTimeout(initShips._t); initShips._t = setTimeout(renderList, 250); });
    load();
  }

  document.addEventListener("DOMContentLoaded", async function () {
    if (!requireAdmin()) return;
    setupBackendToggle(); // superadmin toggle (init'ten once; local kapali olsa da gorunur)
    var page = document.body.dataset.adminPage;
    try {
      if (page === "analytics") await initAnalytics();
      if (page === "tours") await initTours();
      if (page === "tour-form") await initTourForm();
      if (page === "homepage") await initHomepage();
      if (page === "reservations") initReservations();
      if (page === "ships") initShips();
    } catch (error) {
      console.error("Admin panel init failed:", error);
      var msg = (error && error.message) ? error.message : "";
      if (/403|unauthorized|forbidden/i.test(msg) || msg === "") {
        msg = "Admin oturumu doğrulanamadı. Lütfen çıkış yapıp admin hesabıyla tekrar giriş yapın.";
      }
      var bar = document.createElement("div");
      bar.style.cssText = "position:fixed;top:0;left:0;right:0;background:#b00020;color:#fff;padding:10px 16px;z-index:99999;font:14px/1.4 sans-serif;";
      bar.textContent = "Admin paneli yüklenemedi: " + msg;
      document.body.appendChild(bar);
    }
  });
})();
