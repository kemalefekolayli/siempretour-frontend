(function () {
  var metadata = { categories: [], statuses: [] };
  var charts = {};
  var tourImageFields = ["mainPhoto", "image1", "image2", "image3", "image4", "image5", "image6"];
  var newTourDraftKey = "siempre.admin.newTourDraft";
  var activeTourFormId = "";
  var activeTourDraftKey = "";
  var routeCoordinates = [];

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
        var node = document.querySelector('[name="' + field + '"]');
        if (node) node.value = data[field] || "";
      });
      if (Array.isArray(data.routeCoordinates)) {
        routeCoordinates = data.routeCoordinates;
        renderRouteStops();
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
      '<td>' + fmt(tour.price) + '</td>' +
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

  async function initTourForm() {
    var id = new URLSearchParams(location.search).get("id");
    var form = document.getElementById("tour-form");
    var imageInput = document.getElementById("tour-images");
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
    ["name", "slug", "language", "destination", "departureCity", "duration", "price", "discountedPrice", "dates", "minimumAge", "personNumber", "mainPhoto", "image1", "image2", "image3", "image4", "image5", "image6", "imagealt", "generalInfo", "placesVisited", "whatExpect", "meet"].forEach(function (field) {
      var node = document.querySelector('[name="' + field + '"]');
      if (node) node.value = tour[field] || "";
    });
    document.getElementById("tour-category").value = enumCategory(tour.category);
    document.getElementById("tour-status").value = tour.status || "";
    document.getElementById("tour-active").checked = tour.isActive !== false;
    var eventTypeEl = document.getElementById("tour-event-type");
    if (eventTypeEl) eventTypeEl.value = tour.eventType || "";
    var startDateEl = document.getElementById("tour-start-date");
    if (startDateEl) startDateEl.value = tour.startDate ? tour.startDate.substring(0, 10) : "";
    var endDateEl = document.getElementById("tour-end-date");
    if (endDateEl) endDateEl.value = tour.endDate ? tour.endDate.substring(0, 10) : "";
    var shipCompanyEl = document.getElementById("tour-ship-company");
    if (shipCompanyEl) shipCompanyEl.value = tour.shipCompany || "";
    var shipNameEl = document.getElementById("tour-ship-name");
    if (shipNameEl) shipNameEl.value = tour.shipName || "";
    routeCoordinates = Array.isArray(tour.routeCoordinates) ? tour.routeCoordinates.slice() : [];
    renderRouteStops();
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
    var startDateEl = document.getElementById("tour-start-date");
    var endDateEl = document.getElementById("tour-end-date");
    data.startDate = startDateEl && startDateEl.value ? startDateEl.value + "T00:00:00" : null;
    data.endDate = endDateEl && endDateEl.value ? endDateEl.value + "T23:59:59" : null;
    data.routeCoordinates = routeCoordinates.length ? routeCoordinates : [];
    var eventTypeEl = document.getElementById("tour-event-type");
    data.eventType = eventTypeEl && eventTypeEl.value ? eventTypeEl.value : null;
    // Görsel alanları: boş olanları "" olarak gönder ki backend silmeyi uygulasın
    // (backend yalnızca null OLMAYAN alanları günceller; null gönderilirse görsel silinmez).
    tourImageFields.forEach(function (field) {
      if (!data[field]) data[field] = "";
    });
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

  document.addEventListener("DOMContentLoaded", async function () {
    if (!requireAdmin()) return;
    var page = document.body.dataset.adminPage;
    try {
      if (page === "analytics") await initAnalytics();
      if (page === "tours") await initTours();
      if (page === "tour-form") await initTourForm();
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
