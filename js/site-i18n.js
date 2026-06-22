(function () {
  var ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'alt', 'value'];

  var EN = {
    'Anasayfa': 'Home',
    'Ana Sayfa': 'Home',
    'Siempre Tour | En Uygun Yurtiçi ve Yurtdışı Turları Rezerve Et': 'Siempre Tour | Book Domestic and International Tours',
    'Hakkımızda': 'About Us',
    'Turlar': 'Tours',
    'TURLAR': 'TOURS',
    'Genel Bakış': 'Overview',
    'Gidilecek En iyi Zaman': 'Best Time to Go',
    'Gemilerimiz': 'Our Ships',
    'Yorumlar': 'Reviews',
    'İletişim': 'Contact',
    'Giriş': 'Login',
    'Kayıt': 'Register',
    'Giriş / Kayıt': 'Login / Register',
    'Giriş Yap': 'Login',
    'Kayıt ol': 'Register',
    'Çıkış Yap': 'Logout',
    'Kapat': 'Close',
    'Kapat x': 'Close x',
    'Dil seçimi': 'Language selection',
    'Dünya Kadar Turumuz Var': 'Tours Across the World',
    'Dünya Kadar': 'Tours Across',
    'Turumuz Var': 'the World',
    'Gerçek yolculuk, gittiğin yerlerde değil; kendini yeniden keşfettiğin adımlarda başlar. İlk adımını at, hikâyen başlasın.': 'A real journey does not begin with the places you visit, but with the steps where you rediscover yourself. Take the first step and let your story begin.',
    'Nereye gitmek istersin?': 'Where would you like to go?',
    'Kategori': 'Category',
    'Tüm Kategoriler': 'All Categories',
    'Tüm Özel Günler': 'All Special Dates',
    'Özel Gün': 'Special Date',
    'Popüler Lokasyonlar': 'Popular Destinations',
    'Ara': 'Search',
    'Temizle': 'Clear',
    'Lüks': 'Luxury',
    'Gemi / Kruz': 'Ship / Cruise',
    'Gemi/Kruz': 'Ship/Cruise',
    'Macera': 'Adventure',
    'Aile': 'Family',
    'Binicilik & Doğa': 'Horse Riding & Nature',
    'Binicilik ve Doğa': 'Horse Riding & Nature',
    'Dalış': 'Diving',
    'Balayı': 'Honeymoon',
    'Kültür': 'Culture',
    'Tarihi': 'Historical',
    'Tümü': 'All',
    'Ne zaman?': 'When?',
    'Tarih': 'Date',
    'Başlangıç': 'Start',
    'Bitiş': 'End',
    '23 Nisan Gezisi': 'April 23 Trip',
    'Tıp Bayramı': 'Medicine Day',
    '1 Mayıs Bayramı': 'May 1 Holiday',
    '19 Mayıs Gezisi': 'May 19 Trip',
    '15 Temmuz': 'July 15',
    '30 Ağustos': 'August 30',
    '29 Ekim': 'October 29',
    'Yılbaşı Gezisi': 'New Year Trip',
    'Ramazan Bayramı Gezisi': 'Ramadan Feast Trip',
    'Kurban Bayramı Gezisi': 'Eid al-Adha Trip',
    'Sömestre Gezisi': 'Semester Break Trip',
    'Paskalya': 'Easter',
    'En Beğenilen Lokasyonlar': 'Top Rated Destinations',
    'Dünyanın en çok ziyaret edilen destinasyonlarını keşfedin. Her biri kendine özgü kültürü, doğası ve deneyimiyle sizi bekliyor.': 'Discover the world’s most visited destinations, each waiting with its own culture, nature and experiences.',
    'Turları Keşfet': 'Explore Tours',
    'Keşfet': 'Explore',
    'Yeni Maceralar ve Keşifler Peşinde': 'In Search of New Adventures',
    'Dünyayı keşfetmenin en keyifli hâlini sunmak için yola çıktık. Deneyimli rehberlerimiz, uygun fiyat politikamız ve güvenilir tur paketlerimizle, seyahati sadece bir rota değil, unutulmaz bir deneyim hâline getiriyoruz. Her yolculuk bir hikâyedir.': 'We set out to offer the most enjoyable way to discover the world. With experienced guides, fair pricing and trusted tour packages, we turn travel into an unforgettable experience. Every journey is a story.',
    'Maceralar Karusel': 'Adventure carousel',
    'Saraylar ve Renkler Diyarı': 'Land of Palaces and Colors',
    "Ege'nin Masmavi Kıyıları": 'The Deep Blue Coasts of the Aegean',
    "Gaudí'nin Renkli Şehri": "Gaudi's Colorful City",
    'Tarihin ve Sanatın Başkenti': 'Capital of History and Art',
    'Güvenilir Tur Paketleri': 'Reliable Tour Packages',
    'Şub': 'Feb',
    'NİS': 'APR',
    'Ağu': 'Aug',
    'EKİ': 'OCT',
    'Keşif Rotalarımızı İnceleyin': 'Browse Our Discovery Routes',
    'Kişisel zevkinize uygun seyahat deneyimleri için ilham alın': 'Get inspired by travel experiences that match your taste.',
    'Kategoriler': 'Categories',
    'Hayatı Zenginleştiren Seyahatler': 'Journeys That Enrich Life',
    'Sadece Sizin İçin Tasarlandı': 'Designed Just for You',
    'Dünyanın en iyi seyahat uzmanları tarafından hazırlanmış özel turlar': 'Tailor-made tours prepared by leading travel specialists.',
    'Seyahatiniz boyunca concierge (kişisel asistan) düzeyinde hizmet ve destek': 'Concierge-level service and support throughout your trip.',
    'Benzersiz, ayrıcalıklı deneyimler ve özel erişim fırsatları': 'Unique experiences and privileged access opportunities.',
    'Tur Hakkında Genel Bilgi': 'General Tour Information',
    'Ne Beklemelisiniz': 'What to Expect',
    'Harita': 'Map',
    'Hayalinizdeki Seyahati Tasarlayalım': 'Let’s Design Your Dream Trip',
    'Size özel, unutulmaz bir deneyim': 'A personalized, unforgettable experience',
    'Uzman seyahat danışmanları tarafından kişiye özel planlama': 'Personalized planning by expert travel consultants',
    'Seyahat öncesi, sırası ve sonrası 7/24 destek': '24/7 support before, during and after your trip',
    'Benzersiz deneyimler ve ayrıcalıklı erişim fırsatları': 'Unique experiences and privileged access opportunities',
    'Esnek iptal ve değişiklik politikası': 'Flexible cancellation and change policy',
    'Yerini Ayır': 'Reserve Your Spot',
    'Yerini Ayırt': 'Reserve Your Spot',
    'İş Ortaklarımız': 'Our Partners',
    'Gurur Duyduğumuz İş Ortaklarımız': 'Partners We Are Proud Of',
    'Seyahat deneyimlerinizi mükemmelleştirmek için sektörün en güvenilir markalarıyla iş birliği yapıyoruz.': 'We work with trusted brands in the industry to perfect your travel experiences.',
    'Gemi Turları': 'Cruise Tours',
    'Tüm Gemi Turları': 'All Cruise Tours',
    'Dünyanın Lider Gemi Seyahati Rezervasyon Platformudur': 'is a leading cruise travel booking platform',
    'Safari & Doğa Turları': 'Safari & Nature Tours',
    'Orta Doğu & Kuzey Afrika': 'Middle East & North Africa',
    'Güney Pasifik': 'South Pacific',
    'Gemi adı ile ara...': 'Search by ship name...',
    'Şirket / Cruise firması ile ara...': 'Search by company / cruise line...',
    'Yükleniyor...': 'Loading...',
    'Gemi turları yükleniyor...': 'Loading cruise tours...',
    'Gemi turları şu anda yüklenemiyor.': 'Cruise tours are not available right now.',
    'Aradığınız kriterlere uygun gemi turu bulunamadı.': 'No cruise tours match your criteria.',
    'Gemi bilgisi bulunamadı.': 'No ship information found.',
    'Neden Biz': 'Why Us',
    'Bizimle Konforlu Yolculuğunuz. 1500\'den Fazla Müşteri Bize Güveniyor': 'A Comfortable Journey With Us. More Than 1,500 Customers Trust Us',
    'Aktif Kullanıcı': 'Active Users',
    'Mutlu Yolcu': 'Happy Travelers',
    'Planlanmış Geziler': 'Planned Trips',
    'Geziler': 'Trips',
    'Seyahat Edecek Kişi Bilgileri': 'Traveler Information',
    'Lütfen tüm alanları doldurunuz': 'Please fill in all fields',
    'Adınız': 'First Name',
    'Soyadınız': 'Last Name',
    'Telefon Numaranız': 'Phone Number',
    'Kişi Sayısı': 'Number of People',
    'Rezervasyon': 'Reservation',
    'Rezervasyon Detaylarınız': 'Your Reservation Details',
    'Tur Süresi': 'Tour Duration',
    'Rezervasyon Özeti': 'Reservation Summary',
    'Rezervasyon ?zeti': 'Reservation Summary',
    'Siempre Tour | Rezervasyon': 'Siempre Tour | Reservation',
    'Tur danışmanımız sizinle iletişime geçerek detayları paylaşacaktır.': 'Our tour consultant will contact you to share the details.',
    'Email adresi': 'Email address',
    'Email adres': 'Email address',
    'Şifre': 'Password',
    'Şifre (en az 8 karakter)': 'Password (at least 8 characters)',
    'Tekrar şifre': 'Repeat password',
    'Ad': 'First name',
    'Soyad': 'Last name',
    'Telefon (10-11 haneli)': 'Phone (10-11 digits)',
    'Beni hatırla': 'Remember me',
    'Şifreni mi unuttun': 'Forgot your password?',
    'Hesabınız yok mu': 'Don’t have an account?',
    'Zaten bir hesabınız var mı': 'Already have an account?',
    'Facebook ile giriş yap': 'Login with Facebook',
    'Google ile giriş yap': 'Login with Google',
    'Şartlar ve Gizlilik Politikasını okudum ve kabul ediyorum.': 'I have read and accept the Terms and Privacy Policy.',
    'Hızlı Bağlantılar': 'Quick Links',
    'Teslimat Bilgileri': 'Delivery Information',
    'Gizlilik Politikası': 'Privacy Policy',
    'Şartlar & Koşullar': 'Terms & Conditions',
    'Müşteri Hizmetleri': 'Customer Service',
    'İade Politikası': 'Return Policy',
    'Yaşam Tarzı': 'Lifestyle',
    'Eğlence': 'Entertainment',
    'İş Dünyası': 'Business',
    'Bülten': 'Newsletter',
    'Üye Ol': 'Subscribe',
    'Yolculuğunuz böyle başlar': 'This Is How Your Journey Begins',
    'Paketini Seç': 'Choose Your Package',
    'Hayallerinizin Ötesinde': 'Beyond Your Dreams',
    'YİYECEK & İÇECEK': 'FOOD & DRINK',
    'TARİH & KÜLTÜR': 'HISTORY & CULTURE',
    'SAHİLLER & Adalar': 'BEACHES & ISLANDS',
    'Yaşam & DOĞA': 'LIFE & NATURE',
    'Yiyecek & İçecek': 'Food & Drink',
    'Tarih & Kültür': 'History & Culture',
    'Doğal Yaşam & Doğa': 'Wildlife & Nature',
    'Özel Yiyecek & İçecek Deneyimleri': 'Private Food & Drink Experiences',
    'Sürükleyici, Otantik Turlar': 'Immersive, Authentic Tours',
    'Işıltılı Tropik Kaçamaklar': 'Radiant Tropical Escapes',
    'Doğa & Yaban Hayatı Safarileri': 'Nature & Wildlife Safaris',
    'Ömür Boyu unutamayacağınız Anılar Biriktiriyoruz': 'We Create Memories You Will Never Forget',
    'Müşterilerimizden deneyimleri hakkında paylaştıkları': 'What our guests share about their experiences',
    'Uzmanlar Tarafından Hazırlanan Turlar': 'Tours Prepared by Experts',
    'Özel Deneyimler': 'Private Experiences',
    'Adres': 'Address',
    'Asres': 'Address',
    'Telefon': 'Phone',
    'Tüm hakları saklıdır.': 'All rights reserved.',
    'Dünyanın dört bir yanındaki eşsiz lokasyonları keşfetmen için tasarlanmış kişisel tur deneyimleri sunuyoruz.': 'We offer personalized tour experiences designed to help you discover unique destinations around the world.',
    'Küba': 'Cuba',
    'Japonya': 'Japan',
    'Endonezya': 'Indonesia',
    'Antarktika': 'Antarctica',
    'İzlanda': 'Iceland',
    'Hindistan': 'India',
    'Yunanistan': 'Greece',
    'İspanya': 'Spain',
    'İsviçre': 'Switzerland',
    'İtalya': 'Italy',
    'Avusturya': 'Austria',
    'Güney Afrika': 'South Africa',
    'Batı Sahra': 'Western Sahara',
    'İsveç': 'Sweden',
    'Türkiye': 'Turkey'
  };

  function mojibakeScore(value) {
    var match = String(value || '').match(/[ÃÄÅÂâ�]/g);
    return match ? match.length : 0;
  }

  function cp1252Byte(character) {
    var code = character.charCodeAt(0);
    if (code <= 255) return code;
    var map = {
      0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84,
      0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88,
      0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c,
      0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93,
      0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
      0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b,
      0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f
    };
    return map[code];
  }

  function decodeMojibake(value) {
    if (typeof TextDecoder === 'undefined') return String(value || '');
    var text = String(value || '');
    var bytes = [];

    for (var i = 0; i < text.length; i += 1) {
      var byte = cp1252Byte(text[i]);
      if (byte === undefined) return text;
      bytes.push(byte);
    }

    try {
      return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
    } catch (error) {
      return text;
    }
  }

  function repairMojibake(value) {
    var text = String(value || '');
    var decoded = decodeMojibake(text);
    if (mojibakeScore(decoded) < mojibakeScore(text)) text = decoded;
    if (!/[ÃÄÅÂâ]/.test(text)) return text;
    try {
      text = decodeURIComponent(escape(text));
    } catch (error) {
      // Keep the original and apply the direct replacements below.
    }

    var replacements = [
      ['Ä°', '\u0130'], ['Ä±', '\u0131'], ['ÄŸ', '\u011f'], ['Äž', '\u011e'],
      ['ÅŸ', '\u015f'], ['Å', '\u015e'], ['Åž', '\u015e'],
      ['Ã§', '\u00e7'], ['Ã‡', '\u00c7'], ['Ã¼', '\u00fc'], ['Ãœ', '\u00dc'],
      ['Ã¶', '\u00f6'], ['Ã–', '\u00d6'], ['Ã¢', '\u00e2'], ['Ã®', '\u00ee'],
      ['â€™', '\u2019'], ['â€“', '-'], ['â€”', '-'], ['Â\xa0', ' '], ['Â', '']
    ];
    replacements.forEach(function (pair) {
      text = text.split(pair[0]).join(pair[1]);
    });
    return text;
  }

  function repairLostCharacters(value) {
    var text = String(value || '');
    var replacements = [
      [/\?zeti/g, '\u00d6zeti'],
      [/G\?verte/g, 'G\u00fcverte'],
      [/g\?verte/g, 'g\u00fcverte'],
      [/i\?in/g, 'i\u00e7in'],
      [/l\?tfen/g, 'l\u00fctfen'],
      [/m\?kemmel/g, 'm\u00fckemmel'],
      [/b\?y\?k/g, 'b\u00fcy\u00fck'],
      [/y\?ksek/g, 'y\u00fcksek'],
      [/d\?nya/g, 'd\u00fcnya'],
      [/D\?nya/g, 'D\u00fcnya'],
      [/g\?n/g, 'g\u00fcn'],
      [/G\?n/g, 'G\u00fcn'],
      [/g\?ne/g, 'g\u00fcne'],
      [/s\?per/g, 's\u00fcper'],
      [/g\?zel/g, 'g\u00fczel'],
      [/s\?rpriz/g, 's\u00fcrpriz'],
      [/\?ocuk/g, '\u00e7ocuk'],
      [/\?zel/g, '\u00f6zel'],
      [/\?cretsiz/g, '\u00fccretsiz'],
      [/\?evre/g, '\u00e7evre'],
      [/\?izg/g, '\u00e7izg'],
      [/\?ok/g, '\u00e7ok'],
      [/\?nce/g, '\u00f6nce'],
      [/\?rnek/g, '\u00f6rnek'],
      [/\?zellik/g, '\u00f6zellik'],
      [/a\?ık/g, 'a\u00e7\u0131k'],
      [/se\?/g, 'se\u00e7']
    ];

    replacements.forEach(function (pair) {
      text = text.replace(pair[0], pair[1]);
    });
    return text;
  }

  function repairText(value) {
    return repairLostCharacters(repairMojibake(value));
  }

  function normalize(value) {
    return repairText(value)
      .replace(/\s+/g, ' ')
      .replace(/\s+([?.!,;:])/g, '$1')
      .trim();
  }

  Object.keys(EN).forEach(function (key) {
    var normalizedKey = normalize(key);
    if (normalizedKey && !EN[normalizedKey]) EN[normalizedKey] = EN[key];
  });

  function prettifyCountryName(value) {
    var clean = String(value || '').trim();
    if (clean.toLowerCase() === 'uk') return 'United Kingdom';
    return clean.replace(/[_-]+/g, ' ');
  }

  function learnCountryNames(root) {
    root = root || document;

    root.querySelectorAll('[data-country]').forEach(function (node) {
      var english = prettifyCountryName(node.getAttribute('data-country'));
      var label = normalize(node.textContent);
      if (english && label && !EN[label]) EN[label] = english;
    });

    if (window.COUNTRY_NAME_TR) {
      Object.keys(window.COUNTRY_NAME_TR).forEach(function (english) {
        var label = normalize(window.COUNTRY_NAME_TR[english]);
        if (label && !EN[label]) EN[label] = prettifyCountryName(english);
      });
    }
  }

  function withOriginalWhitespace(original, translated) {
    var leading = String(original).match(/^\s*/)[0];
    var trailing = String(original).match(/\s*$/)[0];
    return leading + translated + trailing;
  }

  function translatePattern(key) {
    var match;
    match = key.match(/^(.+) Turları$/);
    if (match) return translateText(match[1]) + ' Tours';

    match = key.match(/^(.+) Genel Bakış$/);
    if (match) return translateText(match[1]) + ' Overview';

    match = key.match(/^(\d+)\s+günlük tur$/i);
    if (match) return match[1] + '-day tour';

    match = key.match(/^(\d+)\s+Gün$/i);
    if (match) return match[1] + ' Days';

    match = key.match(/^(\d+)\s+doğrulanmış misafir yorumu$/i);
    if (match) return match[1] + ' verified guest reviews';

    match = key.match(/^(\d+)\s+doğrulanmış misafir yorumu gösteriliyor$/i);
    if (match) return 'Showing ' + match[1] + ' verified guest reviews';

    match = key.match(/^\((\d+)\s+doğrulanmış yorum\)$/i);
    if (match) return '(' + match[1] + ' verified reviews)';

    match = key.match(/^(\d+)\s+gemi turu bulundu$/i);
    if (match) return match[1] + ' cruise tours found';

    match = key.match(/^(.+) için şu anda tur bulunamadı\.$/i);
    if (match) return 'No tours are currently available for ' + translateText(match[1]) + '.';

    return null;
  }

  function translatePattern(key) {
    var match;
    match = key.match(/^(.+) Turlar\u0131$/);
    if (match) return translateText(match[1]) + ' Tours';

    match = key.match(/^(.+) Genel Bak\u0131\u015f$/);
    if (match) return translateText(match[1]) + ' Overview';

    match = key.match(/^(\d+)\s+g\u00fcnl\u00fck tur$/i);
    if (match) return match[1] + '-day tour';

    match = key.match(/^(\d+)\s+G\u00fcn$/i);
    if (match) return match[1] + ' Days';

    match = key.match(/^(\d+)\s+do\u011frulanm\u0131\u015f misafir yorumu$/i);
    if (match) return match[1] + ' verified guest reviews';

    match = key.match(/^(\d+)\s+do\u011frulanm\u0131\u015f misafir yorumu g\u00f6steriliyor$/i);
    if (match) return 'Showing ' + match[1] + ' verified guest reviews';

    match = key.match(/^\((\d+)\s+do\u011frulanm\u0131\u015f yorum\)$/i);
    if (match) return '(' + match[1] + ' verified reviews)';

    match = key.match(/^(\d+)\s+gemi turu bulundu$/i);
    if (match) return match[1] + ' cruise tours found';

    match = key.match(/^(.+) i\u00e7in \u015fu anda tur bulunamad\u0131\.$/i);
    if (match) return 'No tours are currently available for ' + translateText(match[1]) + '.';

    return null;
  }

  function translateText(value) {
    var key = normalize(value);
    if (!key) return value;
    if (EN[key]) return EN[key];
    return translatePattern(key) || key;
  }

  function getSiteLang() {
    return typeof getActiveLang === 'function' ? getActiveLang() : 'tr';
  }

  function isEnglish() {
    return getSiteLang() === 'en';
  }

  function renderText(value) {
    return isEnglish() ? translateText(value) : repairText(value);
  }

  function shouldSkipNode(node) {
    var parent = node.parentElement;
    if (!parent) return true;
    if (parent.closest('[data-i18n-skip], script, style, noscript, svg, canvas, code, pre')) return true;
    if (/^(TEXTAREA|INPUT|SELECT)$/.test(parent.tagName)) return true;
    return false;
  }

  function translateTextNodes(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT;
        return normalize(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(function (node) {
      var original = node.nodeValue;
      if (isEnglish()) {
        var translated = translateText(original);
        if (translated !== normalize(original) || repairText(original) !== original) {
          node.nodeValue = withOriginalWhitespace(original, translated);
        }
      } else {
        var repaired = repairText(original);
        if (repaired !== original) node.nodeValue = repaired;
      }
    });
  }

  function translateAttributes(root) {
    root.querySelectorAll('*').forEach(function (node) {
      ATTRIBUTES.forEach(function (attr) {
        if (!node.hasAttribute(attr)) return;
        if (attr === 'value' && node.tagName !== 'INPUT' && node.tagName !== 'BUTTON') return;
        var value = node.getAttribute(attr);
        var rendered = renderText(value);
        if (isEnglish()) {
          if (rendered !== normalize(value) || repairText(value) !== value) node.setAttribute(attr, rendered);
        } else if (rendered !== value) {
          node.setAttribute(attr, rendered);
        }
      });
    });
  }

  function applyI18n(root) {
    root = root || document.body;
    learnCountryNames(document);
    if (document.title) document.title = renderText(document.title);
    translateTextNodes(root);
    translateAttributes(root);
  }

  function observeDynamicContent() {
    if (!window.MutationObserver || !document.body) return;
    var timer = 0;
    var observer = new MutationObserver(function (mutations) {
      var hasNewContent = mutations.some(function (mutation) {
        return mutation.addedNodes && mutation.addedNodes.length;
      });
      if (!hasNewContent) return;
      clearTimeout(timer);
      timer = setTimeout(function () { applyI18n(document.body); }, 40);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.SiteI18n = {
    t: translateText,
    apply: applyI18n,
    normalize: normalize
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyI18n(document.body);
      observeDynamicContent();
    });
  } else {
    applyI18n(document.body);
    observeDynamicContent();
  }
})();
