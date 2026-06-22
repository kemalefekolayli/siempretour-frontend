// ===============================================================
// SIEMPRE TOUR - Paylaşılan Lokasyon Arama / Autocomplete
// index.html ve tur-sonuclari.html tarafından kullanılır.
// window.SIEMPRE_COUNTRIES : [[enKey, trName], ...]
// window.initLocationAutocomplete(input, onSelect) : autocomplete bağlar
// window.resolveCountryKey(text) : yazılan metni enKey'e çözer (yoksa null)
// ===============================================================
(function () {
  var COUNTRIES = [["Alaska","Alaska"],["Germany","Almanya"],["Andorra","Andorra"],["Angola","Angola"],["Antarctica","Antarktika"],["Argentina","Arjantin"],["Arctic Cruises","Arktik (Kutup)"],["Albania","Arnavutluk"],["Australia","Avustralya"],["Austria","Avusturya"],["Azerbaijan","Azerbaycan"],["Bahamas","Bahamalar"],["Bali","Bali"],["Bangladesh","Bangladeş"],["Western Sahara","Batı Sahra"],["Belize","Belize"],["Benin","Benin"],["Bhutan","Bhutan"],["Uk","Birleşik Krallık"],["Bolivia","Bolivya"],["Bora Bora","Bora Bora"],["Borneo","Borneo"],["Bosnia Herzegovina","Bosna Hersek"],["Botswana","Botsvana"],["Brazil","Brezilya"],["Brunei","Brunei"],["Bulgaria","Bulgaristan"],["Burkina Faso","Burkina Faso"],["Burundi","Burundi"],["Algeria","Cezayir"],["Channel Islands","Channel Adaları"],["Djibouti","Cibuti"],["Denmark","Danimarka"],["Dominican Republic","Dominik Cumhuriyeti"],["Ecuador & Galapagos","Ekvador & Galapagos"],["Indonesia","Endonezya"],["Armenia","Ermenistan"],["Estonia","Estonya"],["Swaziland","Esvatini"],["Ethiopia","Etiyopya"],["Faroe Islands","Faroe Adaları"],["Morocco","Fas"],["Fiji","Fiji"],["Ivory Coast","Fildişi Sahili"],["Philippines","Filipinler"],["Finland","Finlandiya"],["France","Fransa"],["French Polynesia","Fransız Polinezyası"],["Gabon","Gabon"],["Gambia","Gambiya"],["Ghana","Gana"],["Guinea","Gine"],["Greenland","Grönland"],["Guatemala","Guatemala"],["Guyana","Guyana"],["South_Africa","Güney Afrika"],["South Sudan","Güney Sudan"],["India","Hindistan"],["Croatia","Hırvatistan"],["Iraq","Irak"],["Jamaica","Jamaika"],["Japan","Japonya"],["Cambodia","Kamboçya"],["Cameroon","Kamerun"],["Canada","Kanada"],["Canary Islands","Kanarya Adaları"],["Montenegro","Karadağ"],["Kazakhstan","Kazakistan"],["Kenya","Kenya"],["Colombia","Kolombiya"],["Comoros","Komorlar"],["Congo","Kongo"],["Kosovo","Kosova"],["Costa Rica","Kosta Rika"],["Cuba","Küba"],["Kyrgyzstan","Kırgızistan"],["Laos","Laos"],["Lapland","Lapland"],["Latvia","Letonya"],["Liberia","Liberya"],["Libya","Libya"],["Lithuania","Litvanya"],["Lebanon","Lübnan"],["Hungary","Macaristan"],["Madagascar","Madagaskar"],["Malawi","Malavi"],["Maldives","Maldivler"],["Malaysia","Malezya"],["Malta","Malta"],["Mauritius","Mauritius"],["Mexico","Meksika"],["Moldova","Moldova"],["Mozambique","Mozambik"],["Mongolia","Moğolistan"],["Burma","Myanmar"],["Egypt","Mısır"],["Namibia","Namibya"],["Nepal","Nepal"],["Nicaragua","Nikaragua"],["Norway","Norveç"],["Pakistan","Pakistan"],["Panama","Panama"],["Papua New Guinea","Papua Yeni Gine"],["Paraguay","Paraguay"],["Peru","Peru"],["Poland","Polonya"],["Portugal","Portekiz"],["Romania","Romanya"],["Rwanda","Ruanda"],["St Helena","Saint Helena"],["Saint Lucia","Saint Lucia"],["Senegal","Senegal"],["Seychelles","Seyşeller"],["Sierra Leone","Sierra Leone"],["Singapore","Singapur"],["Slovakia","Slovakya"],["Slovenia","Slovenya"],["Solomon Islands","Solomon Adaları"],["Spitsbergen","Spitsbergen"],["Sri_Lanka","Sri Lanka"],["Suriname","Surinam"],["Syria","Suriye"],["Saudi Arabia","Suudi Arabistan"],["Serbia","Sırbistan"],["Tahiti","Tahiti"],["Tanzania","Tanzanya"],["Thailand","Tayland"],["Tonga","Tonga"],["Trinidad And Tobago","Trinidad ve Tobago"],["Tunisia","Tunus"],["Turkey","Türkiye"],["Uganda","Uganda"],["Oman","Umman"],["Uruguay","Uruguay"],["Venezuela","Venezuela"],["Vietnam","Vietnam"],["Yemen","Yemen"],["New-Zealand","Yeni Zelanda"],["Cape Verde Islands","Yeşil Burun Adaları"],["Greece","Yunanistan"],["Zambia","Zambiya"],["Zimbabwe","Zimbabve"],["Chad","Çad"],["Czech Republic","Çek Cumhuriyeti"],["China","Çin"],["Jordan","Ürdün"],["England","İngiltere"],["Iran","İran"],["Ireland","İrlanda"],["Scotland","İskoçya"],["Spain","İspanya"],["Israel","İsrail"],["Sweden","İsveç"],["Switzerland","İsviçre"],["Italy","İtalya"],["Iceland","İzlanda"],["Chile","Şili"]];

  function normalize(s) { return (s || '').toString().toLowerCase().replace(/[_-]/g, ' ').trim(); }

  function isEnglish() {
    return typeof getActiveLang === 'function' && getActiveLang() === 'en';
  }

  function displayName(pair) {
    return isEnglish() ? pair[0] : pair[1];
  }

  // enKey döndürür; yazılan metin tam isim/anahtarsa eşler, yoksa null
  function resolveCountryKey(text) {
    var q = normalize(text);
    if (!q) return null;
    var exact = COUNTRIES.find(function (p) { return normalize(p[0]) === q || normalize(p[1]) === q; });
    return exact ? exact[0] : null;
  }

  // enKey -> trName (bulunamazsa key'i döndürür)
  function countryTrName(key) {
    var p = COUNTRIES.find(function (x) { return x[0] === key; });
    return p ? displayName(p) : key;
  }

  // input alanına aşağı açılır autocomplete bağlar.
  // onSelect(enKey, trName) seçim yapılınca çağrılır.
  function initLocationAutocomplete(input, onSelect) {
    if (!input) return;

    var list = document.createElement('ul');
    list.className = 'loc-autocomplete-list';
    list.style.cssText = 'display:none;position:absolute;max-height:260px;overflow-y:auto;background:#fff;border:1px solid #ddd;z-index:99999;margin:0;padding:0;list-style:none;box-shadow:0 4px 12px rgba(0,0,0,.2);';
    document.body.appendChild(list);

    function positionList() {
      var rect = input.getBoundingClientRect();
      list.style.top = (rect.bottom + window.scrollY) + 'px';
      list.style.left = (rect.left + window.scrollX) + 'px';
      list.style.width = rect.width + 'px';
    }

    function showList(items) {
      list.innerHTML = '';
      if (!items.length) { list.style.display = 'none'; return; }
      items.forEach(function (pair) {
        var li = document.createElement('li');
        li.textContent = displayName(pair);
        li.style.cssText = 'display:block;padding:10px 16px;cursor:pointer;font-size:14px;border-bottom:1px solid #f0f0f0;white-space:nowrap;';
        li.addEventListener('mouseenter', function () { this.style.background = '#f5f5f5'; });
        li.addEventListener('mouseleave', function () { this.style.background = ''; });
        li.addEventListener('mousedown', function (e) {
          e.preventDefault();
          input.value = displayName(pair);
          input.dataset.countryKey = pair[0];
          list.style.display = 'none';
          if (typeof onSelect === 'function') onSelect(pair[0], displayName(pair));
        });
        list.appendChild(li);
      });
      positionList();
      list.style.display = 'block';
    }

    function filterItems() {
      var q = normalize(input.value);
      if (!q) return COUNTRIES;
      return COUNTRIES.filter(function (p) {
        return normalize(p[0]).indexOf(q) !== -1 || normalize(p[1]).indexOf(q) !== -1;
      });
    }

    input.addEventListener('input', function () {
      input.dataset.countryKey = '';
      showList(filterItems());
    });
    input.addEventListener('focus', function () { showList(filterItems()); });
    input.addEventListener('blur', function () {
      setTimeout(function () { list.style.display = 'none'; }, 150);
    });
    window.addEventListener('scroll', function () {
      if (list.style.display === 'block') positionList();
    }, { passive: true });
  }

  window.SIEMPRE_COUNTRIES = COUNTRIES;
  window.initLocationAutocomplete = initLocationAutocomplete;
  window.resolveCountryKey = resolveCountryKey;
  window.countryTrName = countryTrName;
})();
