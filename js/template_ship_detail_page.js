const BASE = 'https://siempretour.com/images/gemi/fotolar/';
const DECK_BASE_URL = BASE;

const SHIP_DETAIL_DATA = {

  /* ===================== COSTA CRUISES ===================== */

  'costa-magica': {
    name: 'Costa Magica', company: 'Costa Cruises',
    photos: [BASE + 'costa-magica_2019_12_20_05_09_08_1.jpg', BASE + 'costa-magica_2019_12_20_05_09_08_2.jpg', BASE + 'costa-magica_2019_12_20_05_09_08_3.jpg', BASE + 'costa-magica_2019_12_20_05_09_08_4.jpg', BASE + 'costa-magica_2019_12_20_05_09_08_5.jpg', BASE + 'costa-magica_2019_12_20_05_09_08_6.jpg', BASE + 'costa-magica_2019_12_20_05_09_08_7.jpg', BASE + 'costa-magica_2019_12_20_05_09_08_8.jpg'],
    description: [
      'Toplam kabin sayısı 1358 olup 464 adet balkonlu, 58 adet suite kabin bulunmaktadır.',
      'Toplam 4 restoran ve 11 bar vardır.',
      '4 adet yüzme havuzu (2 tanesi kapalı olarakta kullanılabiliyor) ve 5 jakuzi vardır.',
      'Merkez Havuz: Deck Giotto (9) - Uzunluk: 9,3 m, Genişlik: 4,9 m, Yükseklik: 1,17 m',
      'Aft Havuz: Deck Giotto (9) - Uzunluk: 6,1 m, Genişlik: 4,7 m, Yükseklik: 1,17 m',
      'Slide Havuz: Deck Tiziano (10) - Uzunluk: 5 m, Genişlik: 5 m, Yükseklik: 1,37 m',
      'Çocuk Havuzu: Deck Mantegna (12) - Uzunluk: 5 m, Genişlik: 1,37 m, Yükseklik: 0,5 m',
      '3 ayrı kata yayılmış, toplam 1287 yolcu kapasiteli tiyatro salonu bulunmaktadır.',
      'Gemide disko, casino, internet cafe, 4D Sinema, mağazalar ve kütüphane bulunmaktadır.',
      'Çocuklar için çocuk kulübü ve çocuk havuzu vardır.',
      '1300 m2\'lik Wellness Center\'da terapi havuzu, Türk hamamı, sauna, rahatlama ve dinlenme bölümleri, spor salonu, masaj odaları ve solarium bulunmaktadır.',
      'Gemi Adı: Costa Magica',
      'Toplam Personel, Uyruk: 1090, Uluslararası',
      'Gemi Yapım Tarihi: 12/1/2004',
      'Tonaj: 102587',
      'Kapasite: 3470',
      'Stabilizatör: Evet',
      'Ortalama Hız: 20 knots',
      'Maksimum Hız: 22 knots',
      'Uzunluk: 272,19 mt',
      'Genişlik: 35,5 mt',
      'Güverte Sayısı: 17 Deck, Misafirler için 13',
      'Restoran Sayısı: 6',
      'Havuz Sayısı: 3',
      'Elektrik Akımı: 110',
      'Sigara İçilmeyen Gemi: Hayır',
      'Toplam Kabin: 1358',
      'İç Kabin: 507',
      'Dış Kabin: 315',
      'Balkonlu Kabin: 464',
      'MiniSuit: 8',
      'Suit: 42',
      'Grand Suit: 8'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'costa-deliziosa_2019_10_15_23_58_27_costa-deliziosa-ic-kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'costa-magica_2019_11_01_05_58_08_costa-magica-dis-kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'costa-magica_2019_11_01_05_58_08_costa-magica-grand-suite-kabin.jpg' },
      { label: 'Kabin 4', image: BASE + 'costa-magica_2019_11_01_05_58_08_costa-magica-ic-kabin.jpg' },
      { label: 'Kabin 5', image: BASE + 'costa-magica_2019_11_01_06_00_27_costa-magica-balkonlu-dis-kabin.jpg' },
      { label: 'Kabin 6', image: BASE + 'costa-magica_2019_11_01_06_00_27_costa-magica-dis-kabin.jpg' },
      { label: 'Kabin 7', image: BASE + 'costa-magica_2019_11_01_06_00_27_costa-magica-grand-suite-kabin.jpg' },
      { label: 'Kabin 8', image: BASE + 'costa-magica_2019_11_01_06_00_27_costa-magica-ic-kabin.jpg' },
      { label: 'Kabin 9', image: BASE + 'costa-magica_2019_11_01_06_06_06_costa-magica-balkonlu-dis-kabin.jpg' },
      { label: 'Kabin 10', image: BASE + 'costa-magica_2019_11_01_06_06_06_costa-magica-grand-suite-kabin.jpg' }
    ],
    decks: ['costa-magica_2019_12_20_06_13_37_deck-01.png', 'costa-magica_2019_12_20_06_13_37_deck-02.png', 'costa-magica_2019_12_20_06_13_37_deck-03.png', 'costa-magica_2019_12_20_06_13_37_deck-04.png', 'costa-magica_2019_12_20_06_13_37_deck-05.png', 'costa-magica_2019_12_20_06_13_37_deck-06.png', 'costa-magica_2019_12_20_06_13_37_deck-07.png', 'costa-magica_2019_12_20_06_13_37_deck-08.png', 'costa-magica_2019_12_20_06_13_37_deck-09.png', 'costa-magica_2019_12_20_06_13_37_deck-10.png', 'costa-magica_2019_12_20_06_13_37_deck-11.png', 'costa-magica_2019_12_20_06_13_37_deck-12.png', 'costa-magica_2019_12_20_06_13_37_deck-14.png'],
    video: 'https://www.youtube.com/embed/75pxwtZ2CaQ'
  },

  'costa-favolosa': {
    name: 'Costa Favolosa', company: 'Costa Cruises',
    photos: [BASE + 'costa-favolosa_2019_12_20_05_10_01_1.jpg', BASE + 'costa-favolosa_2019_12_20_05_10_01_2.jpg', BASE + 'costa-favolosa_2019_12_20_05_10_01_3.jpg', BASE + 'costa-favolosa_2019_12_20_05_10_01_4.jpg', BASE + 'costa-favolosa_2019_12_20_05_10_01_5.jpg', BASE + 'costa-favolosa_2019_12_20_05_10_01_6.jpg', BASE + 'costa-favolosa_2019_12_20_05_10_01_7.jpg', BASE + 'costa-favolosa_2019_12_20_05_10_01_8.jpg'],
    description: [
      'Costa Cruise şirketinin 15 gemisinden biri olan 2011 yapımı en yeni gemisidir.',
      '114,500 gros tonaja sahip olup, 290 metre uzunluğunda olup 35 metre genişlikte, 62 metre yüksekliktedir. Costa Favolosa gemisinin maksimum hızı 21,5 knots'tur.',
      'Toplam kabin sayısı 1.508 olup, 3.800 toplam yatak kapasitesine sahiptir.',
      'Toplam 9 restoran ve 13 bar vardır.',
      '3 adet yüzme havuzu (2 tanesi kapalı olarakta kullanılabiliyor) ve 5 jakuzi bulunmaktadır.',
      'Merkez Havuz: Deck Villa Borghese (9) - Uzunluk: 9,2 m, Genişlik: 4,5 m, Yükseklik: 1,80 m',
      'Aft Havuz: Deck Villa Borghese (9) - Uzunluk: 5,4 m, Genişlik: 4,4 m, Yükseklik: 1,8 m',
      'Fwd Havuz: Deck Luxembourg (11) - Uzunluk: 5,4 m, Genişlik: 5,4 m, Yükseklik: 1,7 m',
      'Çocuk Havuz: Deck Luxembourg (11) - Uzunluk: 3 m, Genişlik: 3 m, Yükseklik: 0,2 m',
      '3 ayrı kata yayılmış, toplam 1287 yolcu kapasiteli tiyatro salonu vardır.',
      'Gemide disko, casino, internet cafe, 4D sinema, mağazalar ve kütüphane vardır.',
      'Çocuklar için çocuk kulübü ve çocuk havuzu vardır.',
      '6.000 m2 Samsara Spa\'da terapi havuzu, Türk hamamı, sauna, rahatlama ve dinlenme bölümleri, fitness center, masaj odaları ve solarium vardır.',
      'Gemi Adı: Costa Favolosa',
      'Toplam Personel, Uyruk: 1100, Uluslararası',
      'Gemi Yapım Tarihi: 7/4/2011',
      'Yenileme Tarihi: 1/1/2016',
      'Tonaj: 113216',
      'Kapasite: 3800',
      'Stabilizatör: Evet',
      'Ortalama Hız: 20 knots',
      'Maksimum Hız: 21,5 knots',
      'Uzunluk: 290 mt',
      'Genişlik: 35,5 mt',
      'Güverte Sayısı: 17 deck, Misafirler için 13 deck',
      'Restoran Sayısı: 5',
      'Elektrik Akımı: 110',
      'Sigara İçilmeyen Gemi: Hayır',
      'Havuz Sayısı: 3',
      'Toplam Kabin: 1508',
      'İç Kabin: 547',
      'Dış Kabin: 317',
      'Balkonlu Kabin: 466',
      'Mini Suit: 14',
      'Suit: 36',
      'Grand Suit: 8',
      'Varenda Suit:'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'costa-favolosa_2019_11_01_13_46_22_costa favolosa ic kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'costa-favolosa_2019_11_01_13_46_22_costa favolosa dis kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'costa-favolosa_2019_11_01_13_46_22_costa favolosa balkonlu kabin.jpg' },
      { label: 'Kabin 4', image: BASE + 'costa-favolosa_2019_11_01_13_46_22_costa favolosa mini suit.jpg' },
      { label: 'Kabin 5', image: BASE + 'costa-favolosa_2019_11_01_13_46_22_costa-favolosa-samsara-suit.jpg' },
      { label: 'Kabin 6', image: BASE + 'costa-favolosa_2019_11_01_13_46_22_costa favolosa jakuzili grand suit 2.jpg' }
    ],
    decks: ['costa-favolosa_2019_12_20_06_14_26_deck-01.png', 'costa-favolosa_2019_12_20_06_14_26_deck-02.png', 'costa-favolosa_2019_12_20_06_14_26_deck-03.png', 'costa-favolosa_2019_12_20_06_14_26_deck-04.png', 'costa-favolosa_2019_12_20_06_14_26_deck-05.png', 'costa-favolosa_2019_12_20_06_14_26_deck-06.png', 'costa-favolosa_2019_12_20_06_14_26_deck-07.png', 'costa-favolosa_2019_12_20_06_14_26_deck-08.png', 'costa-favolosa_2019_12_20_06_14_26_deck-09.png', 'costa-favolosa_2019_12_20_06_14_26_deck-10.png', 'costa-favolosa_2019_12_20_06_14_26_deck-11.png', 'costa-favolosa_2019_12_20_06_14_26_deck-12.png', 'costa-favolosa_2019_12_20_06_14_26_deck-14.png'],
    video: 'https://www.youtube.com/embed/Zlt9GzeAEJM'
  },

  'costa-fascinosa': {
    name: 'Costa Fascinosa', company: 'Costa Cruises',
    photos: [BASE + 'costa-fascinosa_2019_12_20_05_10_42_1.jpg', BASE + 'costa-fascinosa_2019_12_20_05_10_42_2.jpg', BASE + 'costa-fascinosa_2019_12_20_05_10_42_3.jpg', BASE + 'costa-fascinosa_2019_12_20_05_10_42_4.jpg', BASE + 'costa-fascinosa_2019_12_20_05_10_42_5.jpg', BASE + 'costa-fascinosa_2019_12_20_05_10_42_6.jpg'],
    description: [
      'Costa Cruise şirketinin 15 gemisinden biri olan 2012 yapımı en yeni gemilerinden biridir.',
      '113,216 gros tonaja sahip olup, 290 metre uzunluğundadır.',
      '35 metre genişlikte, 62 metre yükseklikte olup, ortalama hızı 21,5 knots'tır.',
      'Toplam kabin sayısı 1.508, 3.800 toplam yatak kapasitesine sahiptir.',
      'Toplam 8 restoran ve 13 bar vardır.',
      '4 adet yüzme havuzu (2 tanesi kapalı olarakta kullanılabiliyor) ve 5 jakuzi vardır.',
      'Ana Havuz: Deck Carmen (9) - Uzunluk: 9,2 m, Genişlik: 4,5 m, Yükseklik: 1,4 m',
      'Diğer Havuz: Deck Carmen (9) - Uzunluk: 6 m, Genişlik: 4,4 m, Yükseklik: 1,4 m',
      'Fwd Havuz: Deck Tosca (11) - Uzunluk: 5,4 m, Genişlik: 5,4 m, Yükseklik: 1,4 m',
      'Çocuk Havuzu: Deck Tosca (11) - Uzunluk: 6 m, Genişlik: 3,5 m, Yükseklik: 0,2 m',
      '3 ayrı kata yayılmış, toplam 1287 yolcu kapasiteli tiyatro salonu bulunmaktadır.',
      'Gemide disko, casino, internet cafe, 4D Sinema ve kütüphane bulunmaktadır.',
      'Çocuklar için çocuk kulübü ve çocuk havuzu vardır.',
      '6.000 m2 Samsara Spa\'da terapi havuzu, Türk hamamı, sauna, rahatlama ve dinlenme bölümleri, spor salonu, masaj odaları ve solarium bulunmaktadır.',
      'Gemi Adı: Costa Fascinosa',
      'Toplam Personel, Uyruk: 1110, Uluslararası',
      'Gemi Yapım Tarihi: 1/1/2012',
      'Tonaj: 113216',
      'Kapasite: 3800',
      'Stabilizatör: Evet',
      'Ortalama Hız: 21,5 knots',
      'Maksimum Hız: 23 knots',
      'Uzunluk: 290,2 mt',
      'Genişlik: 35,5 mt',
      'Güverte Sayısı: 17 Deck, Misafirler için 13 Deck',
      'Restoran Sayısı: 8',
      'Havuz Sayısı: 4',
      'Elektrik Akım: 110',
      'Sigara İçilmeyen Gemi: Hayır',
      'Toplam Kabin: 1508',
      'Mini Suit: 14',
      'Suit: 36',
      'Grand Suit: 8',
      'Samsara Balkonlu: 58',
      'Samsara Suit: 6',
      'Dış Kabin: 317',
      'İç Kabin: 547',
      'Balkonlu Kabin: 466',
      'Varenda Suit: 6'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'costa-fascinosa_2019_11_01_16_14_51_costa-fascinosa-ic-kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'costa-fascinosa_2019_11_01_16_14_51_costa-fascinosa-dis-kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'costa-fascinosa_2019_11_01_16_14_51_costa-fascinosa-balkonlu-dis-kabin.jpg' },
      { label: 'Kabin 4', image: BASE + 'costa-fascinosa_2019_11_01_16_14_51_costa-fascinosa-suite-kabin.jpg' }
    ],
    decks: ['costa-fascinosa_2019_12_20_06_15_20_deck-01.png', 'costa-fascinosa_2019_12_20_06_15_20_deck-02.png', 'costa-fascinosa_2019_12_20_06_15_20_deck-03.png', 'costa-fascinosa_2019_12_20_06_15_20_deck-04.png', 'costa-fascinosa_2019_12_20_06_15_20_deck-05.png', 'costa-fascinosa_2019_12_20_06_15_20_deck-06.png', 'costa-fascinosa_2019_12_20_06_15_20_deck-07.png', 'costa-fascinosa_2019_12_20_06_15_20_deck-08.png', 'costa-fascinosa_2019_12_20_06_15_20_deck-09.png', 'costa-fascinosa_2019_12_20_06_15_20_deck-10.png', 'costa-fascinosa_2019_12_20_06_15_20_deck-11.png', 'costa-fascinosa_2019_12_20_06_15_20_deck-12.png', 'costa-fascinosa_2019_12_20_06_15_20_deck-14.png'],
    video: 'https://www.youtube.com/embed/eiyy4AxVNlM'
  },

  'costa-fortuna': {
    name: 'Costa Fortuna', company: 'Costa Cruises',
    photos: [BASE + 'costa-fortuna_2019_12_20_05_11_34_1.jpg', BASE + 'costa-fortuna_2019_12_20_05_11_34_2.jpg', BASE + 'costa-fortuna_2019_12_20_05_11_34_3.jpg', BASE + 'costa-fortuna_2019_12_20_05_11_34_4.jpg', BASE + 'costa-fortuna_2019_12_20_05_11_34_5.jpg', BASE + 'costa-fortuna_2019_12_20_05_11_34_6.jpg', BASE + 'costa-fortuna_2019_12_20_05_11_34_7.jpg'],
    description: [
      'Gemide toplam 1.358 kabin, 464 balkonlu, 58 suite bulunmaktadır.',
      'Toplam 4 restoran ve 11 bar vardır.',
      '4 adet yüzme havuzu (1 tanesi kapalı olarakta kullanılabiliyor) ve 5 jakuzi vardır.',
      '3 ayrı kata yayılmış, toplam 1287 yolcu kapasiteli tiyatro salonu bulunmaktadır.',
      'Gemide disko, casino, internet cafe, 4D Sinema, oyun salonu, mağazalar ve kütüphane bulunmaktadır.',
      'Çocuklar için çocuk kulübü ve çocuk havuzu vardır.',
      '1300 m2 Samsara Spa\'da terapi havuzu, Türk hamamı, sauna, rahatlama ve dinlenme bölümleri, spor salonu, masaj odaları ve solarium bulunmaktadır.',
      'Gemi Adı: Costa Fortuna',
      'Toplam Personel, Uyruk: 1027, Uluslararası',
      'Gemi Yapım Tarihi: 2003',
      'Tonaj: 102,587 T',
      'Kapasite: 3470',
      'Stabilizatör: Evet',
      'Ortalama Hız: 20 knots',
      'Maksimum Hız: 22 knots',
      'Uzunluk: 272,19 m',
      'Genişlik: 35,5 m',
      'Güverte Sayısı: 17 deck, Misafirler için 13 deck',
      'Restoran Sayısı: 4 Restoran, 13 Bar',
      'Elektrik Akımı: 110',
      'Sigara İçilmeyen Gemi: Hayır',
      'İç Kabin: 515',
      'Dış Kabin: 321',
      'Suit: 58',
      'Varenda: 464'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'costa-fortuna_2019_11_03_04_56_24_costa-fortuna-ic-kabin-1_sec.jpg' },
      { label: 'Kabin 2', image: BASE + 'costa-fortuna_2019_11_03_04_56_24_costa-fortuna-dis-kabin-1_sec.jpg' },
      { label: 'Kabin 3', image: BASE + 'costa-fortuna_2019_11_03_04_56_24_costa fortuna balkonlu kabin.jpg' },
      { label: 'Kabin 4', image: BASE + 'costa-fortuna_2019_11_03_04_56_24_costa-fortuna-balkonlu-minisuit_sec.jpg' },
      { label: 'Kabin 5', image: BASE + 'costa-fortuna_2019_11_03_04_56_24_costa-fortuna-grand-suit_sec.jpg' },
      { label: 'Kabin 6', image: BASE + 'costa-fortuna_2019_11_03_04_56_24_costa-fortuna-suit_sec.jpg' }
    ],
    decks: ['costa-fortuna_2019_12_20_06_16_07_deck-01.png', 'costa-fortuna_2019_12_20_06_16_07_deck-02.png', 'costa-fortuna_2019_12_20_06_16_07_deck-03.png', 'costa-fortuna_2019_12_20_06_16_07_deck-04.png', 'costa-fortuna_2019_12_20_06_16_07_deck-05.png', 'costa-fortuna_2019_12_20_06_16_07_deck-06.png', 'costa-fortuna_2019_12_20_06_16_07_deck-07.png', 'costa-fortuna_2019_12_20_06_16_07_deck-08.png', 'costa-fortuna_2019_12_20_06_16_07_deck-09.png', 'costa-fortuna_2019_12_20_06_16_07_deck-10.png', 'costa-fortuna_2019_12_20_06_16_07_deck-11.png', 'costa-fortuna_2019_12_20_06_16_07_deck-12.png', 'costa-fortuna_2019_12_20_06_16_07_deck-14.png'],
    video: 'https://www.youtube.com/embed/EblbD3jQZI8'
  },

  'costa-pacifica': {
    name: 'Costa Pacifica', company: 'Costa Cruises',
    photos: [BASE + 'costa-pasifica_2019_12_20_05_12_34_1.jpg', BASE + 'costa-pasifica_2019_12_20_05_12_34_2.jpg', BASE + 'costa-pasifica_2019_12_20_05_12_34_3.jpg', BASE + 'costa-pasifica_2019_12_20_05_12_34_4.jpg', BASE + 'costa-pasifica_2019_12_20_05_12_34_5.jpg'],
    description: [
      'Toplam kabin sayısı 1504 kabin bulunmaktadır.',
      'Toplam 7 restoran ve 13 bar vardır.',
      '3 adet yüzme havuzu (2 tanesi kapalı olarakta kullanılabiliyor) ve 5 jakuzi vardır.',
      'Merkez Havuz: Deck Azzurro (9) - Uzunluk: 8,2 m, Genişlik: 4,5 m, Yükseklik: 1,8 m',
      'Aft Havuz: Deck Azzurro (9) - Uzunluk: 5,4 m, Genişlik: 4,4 m, Yükseklik: 1,8 m',
      'Çocuk Havuz: Deck Feel Good (11) - Uzunluk: 3 m, Genişlik: 3 m, Yükseklik: 0,2 m',
      '3 ayrı kata yayılmış, toplam 1287 yolcu kapasiteli tiyatro salonu bulunmaktadır.',
      'Gemide disko, casino, internet cafe, 4D Sinema, mağazalar ve kütüphane bulunmaktadır.',
      'Çocuklar için çocuk kulübü ve çocuk havuzu vardır.',
      '6000 m2\'lik Samsara Spa\'da terapi havuzu, Türk hamamı, sauna, rahatlama ve dinlenme bölümleri, spor salonu, masaj odaları ve solarium bulunmaktadır.',
      'Gemi Adı: Costa Pacifica',
      'Toplam Personel, Uyruk: 1110, Uluslararası',
      'Gemi Yapım Tarihi: 6/6/2009',
      'Tonaj: 114500',
      'Kapasite: 3780',
      'Stabilizatör: Evet',
      'Ortalama Hız: 21,5 knots',
      'Maksimum Hız: 23 knots',
      'Uzunluk: 290,2 mt',
      'Genişlik: 35,5 mt',
      'Güverte Sayısı: 17 Deck, Misafirler için 14 deck',
      'Restoran Sayısı: 7',
      'Havuz Sayısı: 3',
      'Asansör Sayısı: 14',
      'Elektrik Akımı: 110',
      'Sigara İçilmeyen Gemi: Hayır',
      'Toplam Kabin: 1504',
      'İç Kabin: 549',
      'Dış Kabin: 319',
      'Balkonlu Kabin: 463',
      'Mini Suit: 14',
      'Suit: 34',
      'Grand Suit: 1'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'costa-pasifica_2019_11_03_12_07_29_costa pacifica ic kabin_sec.jpg' },
      { label: 'Kabin 2', image: BASE + 'costa-pasifica_2019_11_03_12_07_29_costa-pacifica-ic-kabin-1_sec.jpg' },
      { label: 'Kabin 3', image: BASE + 'costa-pasifica_2019_11_03_12_07_29_costa pacifica dis kabin samsara_pre_sec.jpg' },
      { label: 'Kabin 4', image: BASE + 'costa-pasifica_2019_11_03_12_07_29_costa pacifica balkonlu dis kabin_sec.jpg' },
      { label: 'Kabin 5', image: BASE + 'costa-pasifica_2019_11_03_12_07_29_costa-pacifica-balkonlu-dis-kabin-1_pre.jpg' },
      { label: 'Kabin 6', image: BASE + 'costa-pasifica_2019_11_03_12_07_29_costa pacifica grand suite_sec.jpg' },
      { label: 'Kabin 7', image: BASE + 'costa-pasifica_2019_11_03_12_07_29_costa-pacifica-mini-suit_sec.jpg' },
      { label: 'Kabin 8', image: BASE + 'costa-pasifica_2019_11_03_12_07_29_costa-pacifica-suit_sec.jpg' }
    ],
    decks: ['costa-pasifica_2019_12_20_06_16_53_deck-01.png', 'costa-pasifica_2019_12_20_06_16_53_deck-02.png', 'costa-pasifica_2019_12_20_06_16_53_deck-03.png', 'costa-pasifica_2019_12_20_06_16_53_deck-04.png', 'costa-pasifica_2019_12_20_06_16_53_deck-05.png', 'costa-pasifica_2019_12_20_06_16_53_deck-06.png', 'costa-pasifica_2019_12_20_06_16_53_deck-07.png', 'costa-pasifica_2019_12_20_06_16_53_deck-08.png', 'costa-pasifica_2019_12_20_06_16_53_deck-09.png', 'costa-pasifica_2019_12_20_06_16_53_deck-10.png', 'costa-pasifica_2019_12_20_06_16_53_deck-11.png', 'costa-pasifica_2019_12_20_06_16_53_deck-12.png', 'costa-pasifica_2019_12_20_06_16_53_deck-14.png'],
    video: 'https://www.youtube.com/embed/Yw4lzYHSbxw'
  },

  'costa-mediterranea': {
    name: 'Costa Mediterranea', company: 'Costa Cruises',
    photos: [BASE + 'costa-mediterranea_2019_12_20_05_13_18_1.jpg', BASE + 'costa-mediterranea_2019_12_20_05_13_18_2.jpg', BASE + 'costa-mediterranea_2019_12_20_05_13_18_3.jpg', BASE + 'costa-mediterranea_2019_12_20_05_13_18_4.jpg', BASE + 'costa-mediterranea_2019_12_20_05_13_18_5.jpg', BASE + 'costa-mediterranea_2019_12_20_05_13_18_6.jpg', BASE + 'costa-mediterranea_2019_12_20_05_13_18_7.jpg', BASE + 'costa-mediterranea_2019_12_20_05_13_18_8.jpg', BASE + 'costa-mediterranea_2019_12_20_05_13_18_9.jpg', BASE + 'costa-mediterranea_2019_12_20_05_13_18_10.jpg'],
    description: [
      'Costa Cruise şirketinin 15 gemisinden biri olan 2003 yapımı gemilerinden biridir.',
      'Toplam kabin sayısı 1.507 olup 660 adet balkonlu, 58 adet suite kabin bulunmaktadır.',
      'Toplam 7 restoran ve 12 bar vardır.',
      '4 adet yüzme havuzu (2 tanesi kapalı olarakta kullanılabiliyor) ve 4 jakuzi vardır.',
      'Merkez Havuz: Deck Armonia (9) - Uzunluk: 8,6 m, Genişlik: 3,5 m, Yükseklik: 1,34 m',
      'Aft Havuz: Deck Armonia (9) - Uzunluk: 8,6 m, Genişlik: 3,5 m, Yükseklik: 1,34 m',
      'Fwd Havuz: Deck Armonia (9) - Uzunluk: 5,4 m, Genişlik: 5,4 m, Yükseklik: 1,34 m',
      'Çocuk Havuz: Deck (11) - Uzunluk: 3,2 m, Genişlik: 3,2 m, Yükseklik: 0,3 m',
      '3 ayrı kata yayılmış, toplam 1287 yolcu kapasiteli tiyatro salonu bulunmaktadır.',
      'Gemide disko, casino, internet cafe, 4D Sinema ve kütüphane bulunmaktadır.',
      'Çocuklar için çocuk kulübü ve çocuk havuzu vardır.',
      '6.000 m2 Ischia Spa\'da terapi havuzu, Türk hamamı, sauna, rahatlama ve dinlenme bölümleri, spor salonu, masaj odaları ve solarium bulunmaktadır.',
      'Gemi Adı: Costa Mediterranea',
      'Toplam Personel, Uyruk: 897, Uluslararası',
      'Gemi Yapım Tarihi: 16/6/2003',
      'Tonaj: 85,619 t',
      'Kapasite: 2680',
      'Stabilizatör: Evet',
      'Ortalama Hız: 22 knots',
      'Maksimum Hız: 24 knots',
      'Uzunluk: 292,56 mt',
      'Genişlik: 32,20 mt',
      'Güverte Sayısı: 16 deck, Misafirler için 12 deck',
      'Havuz Sayısı: 4',
      'Restoran Sayısı: 4 Restoran, 12 Bar',
      'Asansör Sayısı: 15',
      'Elektrik Akımı: 110',
      'Sigara İçilmeyen Gemi: Hayır',
      'Toplam Kabin: 1057',
      'İç Kabin: 212',
      'Dış Kabin: 167',
      'Balkonlu Kabin: 678',
      'Suit: 10',
      'Grand Suit: 14',
      'Panorama Suit: 34'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'costa-mediterranea_2019_11_05_06_50_57_costa mediterranea ic kabin 2.jpg' },
      { label: 'Kabin 2', image: BASE + 'costa-mediterranea_2019_11_05_06_50_57_costa mediterranea ic kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'costa-mediterranea_2019_11_05_06_50_57_costa mediterranea dis kabin.jpg' },
      { label: 'Kabin 4', image: BASE + 'costa-mediterranea_2019_11_05_06_50_57_costa-mediterranea-dis-kabin-1.jpg' },
      { label: 'Kabin 5', image: BASE + 'costa-mediterranea_2019_11_05_06_50_57_costa-mediterranea-balkonlu-dis-kabin.jpg' },
      { label: 'Kabin 6', image: BASE + 'costa-mediterranea_2019_11_05_06_50_57_costa mediterranea panorama suit.jpg' },
      { label: 'Kabin 7', image: BASE + 'costa-mediterranea_2019_11_05_06_50_57_costa-mediterranea-panorama-suit.jpg' }
    ],
    decks: ['costa-mediterranea_2019_12_20_06_18_03_deck-01.png', 'costa-mediterranea_2019_12_20_06_18_03_deck-02.png', 'costa-mediterranea_2019_12_20_06_18_03_deck-03.png', 'costa-mediterranea_2019_12_20_06_18_03_deck-04.png', 'costa-mediterranea_2019_12_20_06_18_03_deck-05.png', 'costa-mediterranea_2019_12_20_06_18_03_deck-06.png', 'costa-mediterranea_2019_12_20_06_18_03_deck-07.png', 'costa-mediterranea_2019_12_20_06_18_03_deck-08.png', 'costa-mediterranea_2019_12_20_06_18_03_deck-09.png', 'costa-mediterranea_2019_12_20_06_18_03_deck-10.png', 'costa-mediterranea_2019_12_20_06_18_03_deck-11.png', 'costa-mediterranea_2019_12_20_06_18_03_deck-12.png'],
    video: 'https://www.youtube.com/embed/m0WS3z_rI84'
  },

  'costa-smeralda': {
    name: 'Costa Smeralda', company: 'Costa Cruises',
    photos: [BASE + 'costa-smeralda_2019_12_20_05_15_25_COSTA_SMERALDA (4).jpg', BASE + 'costa-smeralda_2019_12_20_05_15_25_COSTA_SMERALDA (1).jpg', BASE + 'costa-smeralda_2019_12_20_05_15_25_COSTA_SMERALDA (2).jpg', BASE + 'costa-smeralda_2019_12_20_05_15_25_COSTA_SMERALDA (3).jpg'],
    description: [
      'KASIM 2019 - Costa Smeralda geliyor',
      'Filonun yeni amiral gemisi Smeralda; İtalyan tarzı ve sıcaklığı için mükemmel bir deneyim. Bu mükemmel geminin ilk yolculuğunda seyahat etmeyi planlayanlar; büyük lansman törenini deneyimleme ayrıcalığına sahip olacaklar. Olağanüstü uluslararası bir parti, Savona üzerindeki göklerde havai fişek gösterisi, özel eğlence ve muhteşem yemek deneyimleri.',
      'Rotterdam, Lizbon, Barselona ve Marsilya üzerinden seyahat eden Ambugo Vernissage gemisi arasında seçim yapabilir ve daha sonra 4 Kasım akşamı büyük partiyle anlaşmak için Savona\'ya doğru yola çıkabilirsiniz ya da Akdeniz çevresinde açılış gezisi için yola çıkmadan önce Kasım\'daki lansmandan önce katılmayı tercih edebilirsiniz. En iyisini isteyenler için ise bu iki geziyi unutulmaz bir yolculukta birleştirebilirsiniz.',
      'Gemi Adı: Costa Smeralda',
      'Toplam Personel, Uyruk: Uluslararası',
      'Gemi Yapım Tarihi: 2018',
      'Tonaj: 182.700 gross',
      'Kapasite: 2612',
      'Stabilizatör: Evet',
      'Ortalama Hız: 17 knots',
      'Maksimum Hız: 21,5 knots',
      'Uzunluk: 337 mt',
      'Genişlik: 42 mt',
      'Güverte Sayısı: 22 Deck, Misafirler için 17 deck',
      'Havuz Sayısı: 4',
      'Restoran Sayısı: 11 Restorani 19 Bar',
      'Sigara İçilmeyen Gemi: Hayır',
      'Elektrik Akımı: 110',
      'Toplam Kabin: 2612',
      'İç Kabin: 788',
      'Dış Kabin: 168',
      'Balkonlu Kabin: 1522',
      'Teras Balkonlu: 106',
      'Suit: 20',
      'Grand Suit: 28'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'costa-smeralda_2019_11_05_07_29_25_costa smeralda 4.jpg' },
      { label: 'Kabin 2', image: BASE + 'costa-smeralda_2019_11_05_07_29_25_costa-smeralda-4.jpg' },
      { label: 'Kabin 3', image: BASE + 'costa-smeralda_2019_11_05_07_29_25_costa smeralda 2.jpg' },
      { label: 'Kabin 4', image: BASE + 'costa-smeralda_2019_11_05_07_29_25_costa smeralda 16.jpg' },
      { label: 'Kabin 5', image: BASE + 'costa-smeralda_2019_11_05_07_29_25_costa smeralda 13.jpg' }
    ],
    decks: ['costa-smeralda_2019_12_20_06_18_49_deck-04.png', 'costa-smeralda_2019_12_20_06_18_49_deck-05.png', 'costa-smeralda_2019_12_20_06_18_49_deck-06.png', 'costa-smeralda_2019_12_20_06_18_49_deck-07.png', 'costa-smeralda_2019_12_20_06_18_49_deck-08.png', 'costa-smeralda_2019_12_20_06_18_49_deck-09.png', 'costa-smeralda_2019_12_20_06_18_49_deck-10.png', 'costa-smeralda_2019_12_20_06_18_49_deck-11.png', 'costa-smeralda_2019_12_20_06_18_49_deck-12.png', 'costa-smeralda_2019_12_20_06_18_49_deck-14.png', 'costa-smeralda_2019_12_20_06_18_49_deck-15.png', 'costa-smeralda_2019_12_20_06_18_49_deck-16.png', 'costa-smeralda_2019_12_20_06_18_49_deck-17.png', 'costa-smeralda_2019_12_20_06_18_49_deck-18.png', 'costa-smeralda_2019_12_20_06_18_49_deck-19.png', 'costa-smeralda_2019_12_20_06_18_49_deck-20.png'],
    video: 'https://www.youtube.com/embed/Fnim6NeuzkU'
  },

  'costa-victoria': {
    name: 'Costa Victoria', company: 'Costa Cruises',
    photos: [BASE + 'costa-victoria_2019_12_20_05_31_05_1.jpg', BASE + 'costa-victoria_2019_12_20_05_31_05_2.jpg', BASE + 'costa-victoria_2019_12_20_05_31_05_3.jpg'],
    description: [
      'Costa Cruise şirketinin 15 gemisinden biri olan 2012 yapımı en yeni gemilerinden biridir.',
      'Toplam kabin sayısı 964 olup 242 adet balkonlu, 16 adet suite kabin bulunmaktadır.',
      'Toplam 5 restoran ve 10 bar vardır.',
      '3 adet yüzme havuzu (2 tanesi kapalı olarak da kullanılabiliyor) ve 4 jakuzi vardır.',
      'Fwd Havuz: Deck Rigoletto (11) - Uzunluk: 13,2 m, Genişlik: 5,3 m, Yükseklik: 1,2 m',
      'Aft Havuz: Deck Rigoletto (11) - Uzunluk: 6,23 m, Genişlik: 5,32 m, Yükseklik: 1,8 m',
      'İç Havuz: Deck Traviata (6) - Uzunluk: 11 m, Genişlik: 4,3 m, Yükseklik: 1,6 m',
      '3 ayrı kata yayılmış, toplam 1287 yolcu kapasiteli tiyatro salonu bulunmaktadır.',
      'Gemide disko, casino, internet cafe, 4D Sinema, mağazalar ve kütüphane bulunmaktadır.',
      'Çocuklar için çocuk kulübü ve çocuk havuzu vardır.',
      'Wellness Center\'da terapi havuzu, Türk hamamı, sauna, rahatlama ve dinlenme bölümleri, spor salonu, masaj odaları ve solarium bulunmaktadır.',
      'Gemi Adı: Costa Victoria',
      'Toplam Personel, Uyruk: 766, Uluslararası',
      'Gemi Yapım Tarihi: 20/06/1996',
      'Yenilenme Tarihi: 1/1/2004',
      'Tonaj: 75166 t',
      'Kapasite: 2394',
      'Stabilizatör: Evet',
      'Ortalama Hız: 22 knots',
      'Maksimum Hız: 24 knots',
      'Uzunluk: 252,9 mt',
      'Genişlik: 32,25 mt',
      'Güverte Sayısı: 14 Deck, Misafirler için 12 Deck',
      'Restoran Sayısı: 5 Restoran, 10 Bar',
      'Asansör Sayısı: 14',
      'Havuz Sayısı: 3',
      'Elektrik Akımı: 110',
      'Sigara İçilmeyen Gemi: Hayır',
      'Toplam Kabin: 964',
      'İç Kabin: 391',
      'Dış Kabin: 311',
      'Balkonlu Kabin: 242',
      'Mini Suit: 10',
      'Suit: 6'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'costa-victoria_2019_11_05_13_11_30_costa victoria ic kabin 2.jpg' },
      { label: 'Kabin 2', image: BASE + 'costa-victoria_2019_11_05_13_11_30_costa-victoria-ic-kabin-2.jpg' },
      { label: 'Kabin 3', image: BASE + 'costa-victoria_2019_11_05_13_11_30_costa victoria dis kabin.jpg' },
      { label: 'Kabin 4', image: BASE + 'costa-victoria_2019_11_05_13_11_30_costa-victoria-dis-kabin-1.jpg' },
      { label: 'Kabin 5', image: BASE + 'costa-victoria_2019_11_05_13_11_30_costa victoria balkonlu kabin.jpg' },
      { label: 'Kabin 6', image: BASE + 'costa-victoria_2019_11_05_13_11_30_costa victoria mini suit balkonlu kabin.jpg' },
      { label: 'Kabin 7', image: BASE + 'costa-victoria_2019_11_05_13_11_30_costa-victoria-mini-suit.jpg' },
      { label: 'Kabin 8', image: BASE + 'costa-victoria_2019_11_05_13_11_30_costa-victoria-suit.jpg' }
    ],
    decks: ['costa-victoria_2020_01_03_18_53_19_deck-04.png', 'costa-victoria_2020_01_03_18_53_19_deck-05.png', 'costa-victoria_2020_01_03_18_53_19_deck-06.png', 'costa-victoria_2020_01_03_18_53_19_deck-07.png', 'costa-victoria_2020_01_03_18_53_19_deck-08.png', 'costa-victoria_2020_01_03_18_53_19_deck-09.png', 'costa-victoria_2020_01_03_18_53_19_deck-10.png', 'costa-victoria_2020_01_03_18_53_19_deck-11.png', 'costa-victoria_2020_01_03_18_53_19_deck-12.png', 'costa-victoria_2020_01_03_18_53_19_deck-14.png'],
    video: 'https://www.youtube.com/embed/aPemNWWVkMU'
  },


  /* ===================== MSC CRUISES ===================== */

  'msc-bellissima': {
    name: 'MSC Bellissima', company: 'MSC Cruises',
    photos: [BASE + 'msc-bellisima_2019_12_20_05_54_48_MSC_BELLISSIMA (6).jpg', BASE + 'msc-bellisima_2019_12_20_05_54_48_MSC_BELLISSIMA (1).jpg', BASE + 'msc-bellisima_2019_12_20_05_54_48_MSC_BELLISSIMA (2).jpg', BASE + 'msc-bellisima_2019_12_20_05_54_48_MSC_BELLISSIMA (3).jpg', BASE + 'msc-bellisima_2019_12_20_05_54_48_MSC_BELLISSIMA (5).jpg', BASE + 'msc-bellisima_2019_12_20_05_54_48_MSC_BELLISSIMA (7).jpg', BASE + 'msc-bellisima_2019_12_20_05_54_48_MSC_BELLISSIMA.jpg'],
    description: [
      'SORULARINIZ KABİN KONFORUNDA YANITLANIYOR',
      'ZOE\'nin tüm misafirlere etkili bir şekilde cevap vermesini sağlamak için, ZOE her bir sorunun binlerce farklı türüyle, en sık sorulan soruların 800\'önden fazlasına yanıt verecek şekilde programlandı ve eğitildi.',
      'ZOE'nin doğal konuşma tanıma ve diğer davranışsal, deneysel ve performans ölçümlerinin yanı sıra konuşma tasarımları, konuşmayı metne ve tekrar konuşmaya çevirme yeteneğine ilişkin testler yapıldı. Yapay bir zeka çözümü olan ZOE, gerçek misafir etkileşimlerine dayanarak cevaplarını öğrenmeye ve geliştirmeye devam etmek için tasarlanmıştır.',
      'ZOE, 7/24 sanal kişisel seyir asistanı olarak görev yaparken, mürettebat ve misafir arasındaki insan etkileşiminin yerini almak için değil, konuklara kabinlerinin rahatlığında bilgi alma ve keşfetme esnekliği sağlamak için tasarlandı'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'msc-bellisima_2019_11_06_06_44_01_iç Kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'msc-bellisima_2019_11_06_06_44_01_Dış Kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'msc-bellisima_2019_11_06_06_44_01_Balkonlu Kabin.jpg' }
    ],
    decks: ['msc-bellisima_2019_12_20_06_24_40_deck-05.png', 'msc-bellisima_2019_12_20_06_24_40_deck-06.png', 'msc-bellisima_2019_12_20_06_24_40_deck-07.png', 'msc-bellisima_2019_12_20_06_24_40_deck-08.png', 'msc-bellisima_2019_12_20_06_24_40_deck-09.png', 'msc-bellisima_2019_12_20_06_24_40_deck-10.png', 'msc-bellisima_2019_12_20_06_24_40_deck-11.png', 'msc-bellisima_2019_12_20_06_24_40_deck-12.png', 'msc-bellisima_2019_12_20_06_24_40_deck-13.png', 'msc-bellisima_2019_12_20_06_24_40_deck-14.png', 'msc-bellisima_2019_12_20_06_24_40_deck-15.png', 'msc-bellisima_2019_12_20_06_24_40_deck-16.png', 'msc-bellisima_2019_12_20_06_24_40_deck-18.png', 'msc-bellisima_2019_12_20_06_24_40_deck-19.png'],
    video: 'https://www.youtube.com/embed/d5hl3bNb6Os'
  },

  'msc-divina': {
    name: 'MSC Divina', company: 'MSC Cruises',
    photos: [BASE + 'msc-divina_2019_12_20_05_56_38_1.jpg', BASE + 'msc-divina_2019_12_20_05_56_38_2.jpg', BASE + 'msc-divina_2019_12_20_05_56_38_3.jpg', BASE + 'msc-divina_2019_12_20_05_56_38_4.jpg', BASE + 'msc-divina_2019_12_20_05_56_38_5.jpg', BASE + 'msc-divina_2019_12_20_05_56_38_6.jpg', BASE + 'msc-divina_2019_12_20_05_56_38_7.jpg'],
    description: [
      'Modern Konfor ve Sınırsız Zerafet',
      'İlahi Sophie Loren'den ilham alan Divina, cruise gemilerinin altın çağını doğaya saygı, modern konfor, dünya çapında eğlence, çocuklar ve gençler için eğlence ve aktiviteler ile misafirlerine yaşatarak tam bir mutluluk sağlıyor.Geminin her köşesinde stil ve lüks ile göz ziyafeti çekeceksiniz. Casino Veneziano, Broadway standratlarında Pantheon tiyatrosu, Swarovski taşları ile süslenmiş merdivenleri, sakin Infınıty havuzu ile denizlerin ve ufkun ötesine geçeceksiniz.',
      'Eataly ile otantik slow foodun keyfine varırken, MSC Yatch Club'ın özel uşak servisini keşfedin.',
      '16. Kat'ta Sophia Loren'in fotoğrafları ve unutulmaz kıyafetleri ile süslenmiş ve ona adanmış Sophia Loren suitinin keyfini çıkarabilirsiniz.',
      'özel güvertedeki MSC Aurea Spa'da profesyonel masaj ve bakım hizmetleri, kişiye özel spa servisleri ve meyve ikramları ile kendinizi şımartın.',
      'MSC Divina'da geçireceğiniz her gün sizin için keşfedilecek yeni bir güzellik demektir.'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'msc-divina_2019_11_06_08_03_28_İç Kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'msc-divina_2019_11_06_08_03_28_Dış Kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'msc-divina_2019_11_06_08_03_28_Balkonlu Kabin.jpg' }
    ],
    decks: ['msc-divina_2019_12_20_06_26_30_deck-05.png', 'msc-divina_2019_12_20_06_26_30_deck-06.png', 'msc-divina_2019_12_20_06_26_30_deck-07.png', 'msc-divina_2019_12_20_06_26_30_deck-08.png', 'msc-divina_2019_12_20_06_26_30_deck-09.png', 'msc-divina_2019_12_20_06_26_30_deck-10.png', 'msc-divina_2019_12_20_06_26_30_deck-11.png', 'msc-divina_2019_12_20_06_26_30_deck-12.png', 'msc-divina_2019_12_20_06_26_30_deck-13.png', 'msc-divina_2019_12_20_06_26_30_deck-14.png', 'msc-divina_2019_12_20_06_26_30_deck-15.png', 'msc-divina_2019_12_20_06_26_30_deck-16.png', 'msc-divina_2019_12_20_06_26_30_deck-18.png'],
    video: 'https://www.youtube.com/embed/YU_WLtBIBdA'
  },

  'msc-lirica': {
    name: 'MSC Lirica', company: 'MSC Cruises',
    photos: [BASE + 'msc-lirica_2019_12_20_06_30_31_1.jpg', BASE + 'msc-lirica_2019_12_20_06_30_31_2.jpg', BASE + 'msc-lirica_2019_12_20_06_30_31_3.jpg', BASE + 'msc-lirica_2019_12_20_06_30_31_4.jpg', BASE + 'msc-lirica_2019_12_20_06_30_31_5.jpg', BASE + 'msc-lirica_2019_12_20_06_30_31_6.jpg', BASE + 'msc-lirica_2019_12_20_06_30_31_7.jpg', BASE + 'msc-lirica_2019_12_20_06_30_31_8.jpg', BASE + 'msc-lirica_2019_12_20_06_30_31_9.jpg'],
    description: [
      'Bir gemi için inovasyonun son noktası',
      'MSC Lirica Seçkinliğe,konfora ve misafirperverliğe odaklanmış klasik cruise deneyimini Akdenizli yaşam biçimi ile birleştirerek size getiriyor.Lobide ve lounge'larda rahatlarken tavandan tabana geniş açılı ve deniz manzaralı camlar ile manzaranın keyfini çıkartabilirsiniz. Aynı anda tiyatro öncesi içkilerini alabileceğiniz Beverly Hills Bar veya geleneksel Lord Nelson Pub'da güzel zaman geçirebilirsiniz.Bu çevre dostu gemide modernlik ve geleneksellik bir aradadır.',
      'The Boradway tiyatrosunda geleneksel gemi eğlencelerinin yeni yorumlarına tanık olacaksınız. Diğer gemilerimizden farklı olarak MSC Lirica\'da tiyatro programları için rezervasyon gerektiğini lütfen not ediniz. Rezervasyon yaptırmanın ?? yolu var; ?cretsiz wifi ile bağlanabileceğiniz kapalı devre gemi networku, farklı katlarda bulunan dokunmatik ekranlar ve resepsiyon.',
      'Manzaralı spor salonu ve MSC Aurea Spa'da ise bakım ve masaj keyfi sürüp, Blue Club diskoda ise futuristik bir deneyim yaşarsınız.Yemeklerde ise geleneksel tarifler ile hazırlanmış Akdeniz yemeklerinin yanısıra dünya mutfağının en seçkin gurme tatlarını bulacaksınız.',
      'Dünya çapındaki eğlence imkanlarından bazıları; shuffleboard, Las Vegas Casino, canlı müzikler, sanal oyun salonu, çocuklar,ergenler ve gençler için özel kulüpler bir cruise'da bulmak isteyeceğiniz tüm imkanları sunuyor.Yolculuk edenlerin söylediklerine göre bu gemi sadece kendilerini inanılmaz destinasyonlara götüren çok özel bir gemi değil her dakikasında yeni bir sürpriz yaşadıkları şiirsel bir deneyim.'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'msc-lirica_2019_11_07_05_02_43_iç kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'msc-lirica_2019_11_07_05_02_43_dış kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'msc-lirica_2019_11_07_05_02_43_balkonlu kabin.jpg' },
      { label: 'Kabin 4', image: BASE + 'msc-lirica_2019_11_07_05_02_43_msc-lirica_suite_7370_1139_459-258_image.jpg' }
    ],
    decks: [],
    video: 'https://www.youtube.com/embed/RzAcpdwXtNg'
  },

  'msc-meraviglia': {
    name: 'MSC Meraviglia', company: 'MSC Cruises',
    photos: [BASE + 'msc-meraviglia_2019_12_20_06_34_06_MSC_MERAVIGLIA (1).jpg', BASE + 'msc-meraviglia_2019_12_20_06_34_06_MSC_MERAVIGLIA (2).jpg', BASE + 'msc-meraviglia_2019_12_20_06_34_06_MSC_MERAVIGLIA (3).jpg', BASE + 'msc-meraviglia_2019_12_20_06_34_06_MSC_MERAVIGLIA (4).jpg', BASE + 'msc-meraviglia_2019_12_20_06_34_06_MSC_MERAVIGLIA (5).jpg', BASE + 'msc-meraviglia_2019_12_20_06_34_06_MSC_MERAVIGLIA (6).jpg', BASE + 'msc-meraviglia_2019_12_20_06_34_06_MSC_MERAVIGLIA.jpg'],
    description: [
      'Her sezonda mükemmel bir deniz deneyimi',
      'Kolezyum veya Eyfel kulesi, Dubai'nin gökdelenleri veya Corcovado'da ki İsa heykelinin karşısında olduğu gibi harikalık karşısında yutkunacaksınız. İnsanoğlu'nun yarattığı tüm şahaserleri ve yaratıcılığının son noktasını düşünün, bu duygu ve yaratıcı ilham MSC Meraviglia inşaatının geleneksel açılışından itibaren hayata geçti.',
      'MSC Cruises'ın bayrak gemisi 2017 baharında denize iniyor.',
      'MSC Meraviglia, sanatsal teknolojinin, tasarımın, deniz sevgisinin, konforun ve pratikliğin bir kombinasyonu. Yolcularını ve gittiği limanlarda görenleri hayranlıklar içinde bırakacak.',
      'İç ve dış mekanları ile her mevsimi harika kılacak. Bir MSC farkı olan lüx MSC Yatch Club alanı olacak.',
      'Yürüyüş alanının tavanı 480m2 LED ekran ile kaplanıyor; dijital gökyüzü, cam tavan, gün batımları, gün doğumları ve yıldızları görmeyi mümkün kılacak.',
      'Bir çok etkinlik alanı olacak; eğlence parkı, su parkı, manzaralı alanlar ve 2 adet kapalı yürüyüş alanı.',
      'MSC Meraviglia sıvı atık üretmeyecek, duman ve karbon salımını nötralize edecek. özel motor sistemi enerji tasarrufu sağlayacak.',
      '2017?de ilk sezonunda MSC Meraviglia batı Akdeniz'de evi olan Cenova limanından Barselona ve Marsilya'ya sefer yapacak.Pek yakında ön rezervasyonlar başlayacak.',
      'Milano Expo 2015?de ziyaretçiler sanal tur yaparak bu gemi ile ilgili ilk deneyimleri edindiler.'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'msc-meraviglia_2019_11_08_06_11_03_İç Kabin copy.jpg' },
      { label: 'Kabin 2', image: BASE + 'msc-meraviglia_2019_11_08_06_11_03_İç Kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'msc-meraviglia_2019_11_08_06_11_03_Dış Kabin copy.jpg' },
      { label: 'Kabin 4', image: BASE + 'msc-meraviglia_2019_11_08_06_11_03_Dış Kabin.jpg' },
      { label: 'Kabin 5', image: BASE + 'msc-meraviglia_2019_11_08_06_11_03_Balkonlu Dış Kabin copy.jpg' },
      { label: 'Kabin 6', image: BASE + 'msc-meraviglia_2019_11_08_06_11_03_Balkonlu Dış Kabin.jpg' }
    ],
    decks: ['msc-meraviglia_2019_12_20_06_34_44_deck-05.png', 'msc-meraviglia_2019_12_20_06_34_44_deck-06.png', 'msc-meraviglia_2019_12_20_06_34_44_deck-07.png', 'msc-meraviglia_2019_12_20_06_34_44_deck-08.png', 'msc-meraviglia_2019_12_20_06_34_45_deck-09.png', 'msc-meraviglia_2019_12_20_06_34_45_deck-10.png', 'msc-meraviglia_2019_12_20_06_34_45_deck-11.png', 'msc-meraviglia_2019_12_20_06_34_45_deck-12.png', 'msc-meraviglia_2019_12_20_06_34_45_deck-13.png', 'msc-meraviglia_2019_12_20_06_34_45_deck-14.png', 'msc-meraviglia_2019_12_20_06_34_45_deck-15.png', 'msc-meraviglia_2019_12_20_06_34_45_deck-16.png', 'msc-meraviglia_2019_12_20_06_34_45_deck-18.png', 'msc-meraviglia_2019_12_20_06_34_45_deck-19.png'],
    video: 'https://www.youtube.com/embed/MRfGBXwnHT4'
  },

  'msc-poesia': {
    name: 'MSC Poesia', company: 'MSC Cruises',
    photos: [BASE + 'msc-poesia_2019_12_20_06_39_16_1.jpg', BASE + 'msc-poesia_2019_12_20_06_39_16_2.jpg', BASE + 'msc-poesia_2019_12_20_06_39_16_3.jpg', BASE + 'msc-poesia_2019_12_20_06_39_16_4.jpg', BASE + 'msc-poesia_2019_12_20_06_39_16_5.jpg', BASE + 'msc-poesia_2019_12_20_06_39_16_6.jpg', BASE + 'msc-poesia_2019_12_20_06_39_16_7.jpg', BASE + 'msc-poesia_2019_12_20_06_39_16_8.jpg'],
    description: [
      'Güzelliğin Şiiri',
      'MSC Poesia denizin güzelliğine adadığımız şiirimiz. Klasik gemi mimarisi ile seçkin hatların birleşimi olan inovatif ve ekolojik bir gemi.',
      'Gemiye girer girmez zerafetin dünyasına adım atarsınız, lobide yer alan Zen Garden şelalesi, otantik Japon suşi barı, MSC Aurea Spa'nın buhar odaları, saunası, vücudunuzu ve ruhunuzu şımartacak masaj imkanları.',
      'Gelişiniz ile birlikte bir çok kapalı ve açık spor akitivetesine kavuşacaksınız. Spor salonu, basketbol sahası, tenis sahası, shuffle board, çocuklar ve gençler için kendi kulüpleri, Stone Age ve Dinasour Play Area, video oyunları ve hatta özel disko-d.j. Ek olarak bir tatil köyünde bulabileceğiniz tüm animasyonların yanısıra 3 adet yüzme havuzu, 4 açık jakuzi ve havuz etrafında dev sinema perdesi var.',
      'Gurme mutfağında alışık olduğunuz MSC Akdeniz lezzetleri slow food prensiplerine uygun şekilde en taze ve güzel malzemeler ile hazırlanıyor.',
      'çeşitli lounge barlarda orjinal ve otantik tatlar bulacaksınız. Grappolo d'Oro şarap barı, Mojito kokteyl barı ve puro odası bunlardan bazıları.',
      'Aile tatili veya romantik kaçamaklar, isteğiniz hangisi olursa olsun MSC Poesia size gerçekten ilham verici bir cruise deneyimi sunuyor.'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'msc-poesia_2019_11_08_06_35_49_iç.jpg' },
      { label: 'Kabin 2', image: BASE + 'msc-poesia_2019_11_08_06_35_49_dış.jpg' },
      { label: 'Kabin 3', image: BASE + 'msc-poesia_2019_11_08_06_35_49_balkonlu.jpg' }
    ],
    decks: ['msc-poesia_2019_12_20_06_39_55_deck-05.png', 'msc-poesia_2019_12_20_06_39_55_deck-06.png', 'msc-poesia_2019_12_20_06_39_55_deck-07.png', 'msc-poesia_2019_12_20_06_39_55_deck-08.png', 'msc-poesia_2019_12_20_06_39_55_deck-09.png', 'msc-poesia_2019_12_20_06_39_55_deck-10.png', 'msc-poesia_2019_12_20_06_39_55_deck-11.png', 'msc-poesia_2019_12_20_06_39_55_deck-12.png', 'msc-poesia_2019_12_20_06_39_55_deck-13.png', 'msc-poesia_2019_12_20_06_39_55_deck-14.png', 'msc-poesia_2019_12_20_06_39_55_deck-15.png', 'msc-poesia_2019_12_20_06_39_55_deck-16.png'],
    video: 'https://www.youtube.com/embed/OFo--yTTVIk'
  },

  'msc-seaside': {
    name: 'MSC Seaside', company: 'MSC Cruises',
    photos: [BASE + 'msc-seaside_2019_12_20_06_41_42_MSC_SEASIDE (1).jpg', BASE + 'msc-seaside_2019_12_20_06_41_42_MSC_SEASIDE (4).jpg', BASE + 'msc-seaside_2019_12_20_06_41_42_MSC_SEASIDE (5).jpg', BASE + 'msc-seaside_2019_12_20_06_41_42_MSC_SEASIDE.jpg'],
    description: [
      'MSC Seaside',
      'Deniz kenarında yürüyerek güneşin keyfini çıkartın',
      'MSC Seaside devrimci mimarisi ve nefes kesen teknolojisi ile yeni jenerasyon cruiselar gemilerinin başlangıcı.',
      'Gemi A.B.D.?de denize indirilecek ilk MSC Cruies gemisi olarak 2017?de Miami'de denize inecek ve yıl boyunca Karayipler'de gezecek.MSC Seaside deniz ile iç içe geçen açık ve kapalı alanları ile eşsiz bir cruise deneyimi sunuyor. Geminin çevresinde rıhtım mantığı ile tasarlanmış alan geminin etrafını 323 metre boyunca çeviriyor. Bu alanda açık manzaralı alışveriş alanları, yemek ve güneşlenme alanları asansör ile birbirlerine bağlanacak.',
      'Ek olarak MSC Seaside denizlerdeki en etkileyici Aqua Park'ı sunacak. Denizlerdeki ilk slide boarding teknolojisini, interaktif oyunlar ve nefes kesici su parkı teknolojileri ile bilreştirerek her yaşa uygun eğlencelere sahip olacak.',
      'MSC Seaside, güneşi takip eden gemi!'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'msc-seaside_2019_11_08_07_05_42_iç copy.jpg' },
      { label: 'Kabin 2', image: BASE + 'msc-seaside_2019_11_08_07_05_42_iç.jpg' },
      { label: 'Kabin 3', image: BASE + 'msc-seaside_2019_11_08_07_05_42_dış copy.jpg' },
      { label: 'Kabin 4', image: BASE + 'msc-seaside_2019_11_08_07_05_42_dış.jpg' },
      { label: 'Kabin 5', image: BASE + 'msc-seaside_2019_11_08_07_05_42_balkon copy.jpg' },
      { label: 'Kabin 6', image: BASE + 'msc-seaside_2019_11_08_07_05_42_balkon.jpg' }
    ],
    decks: ['msc-seaside_2019_12_20_06_42_20_deck-05.png', 'msc-seaside_2019_12_20_06_42_20_deck-06.png', 'msc-seaside_2019_12_20_06_42_20_deck-07.png', 'msc-seaside_2019_12_20_06_42_20_deck-08.png', 'msc-seaside_2019_12_20_06_42_20_deck-09.png', 'msc-seaside_2019_12_20_06_42_20_deck-10.png', 'msc-seaside_2019_12_20_06_42_20_deck-11.png', 'msc-seaside_2019_12_20_06_42_20_deck-12.png', 'msc-seaside_2019_12_20_06_42_20_deck-13.png', 'msc-seaside_2019_12_20_06_42_20_deck-14.png', 'msc-seaside_2019_12_20_06_42_20_deck-15.png', 'msc-seaside_2019_12_20_06_42_20_deck-16.png', 'msc-seaside_2019_12_20_06_42_20_deck-18.png', 'msc-seaside_2019_12_20_06_42_20_deck-19.png'],
    video: 'https://www.youtube.com/embed/56If4G4Mhmg'
  },

  'msc-seaview': {
    name: 'MSC Seaview', company: 'MSC Cruises',
    photos: [BASE + 'msc-seaview_2019_12_20_06_43_53_1.jpg', BASE + 'msc-seaview_2019_12_20_06_43_53_2.jpg', BASE + 'msc-seaview_2019_12_20_06_43_53_3.jpg', BASE + 'msc-seaview_2019_12_20_06_43_53_4.jpg', BASE + 'msc-seaview_2019_12_20_06_43_53_5.jpg', BASE + 'msc-seaview_2019_12_20_06_43_53_6.jpg', BASE + 'msc-seaview_2019_12_20_06_43_53_7.jpg', BASE + 'msc-seaview_2019_12_20_06_43_53_8.jpg'],
    description: [
      'Deniz kenarında yürüyerek güneşin keyfini çıkartın',
      'MSC Seaside devrimci mimarisi ve nefes kesen teknolojisi ile yeni jenerasyon cruiselar gemilerinin başlangıcı.',
      'MSC Seaside deniz ile iç içe geçen açık ve kapalı alanları ile eşsiz bir cruise deneyimi sunuyor. Geminin çevresinde rıhtım mantığı ile tasarlanmış alan geminin etrafını 323 metre boyunca çeviriyor. Bu alanda açık manzaralı alışveriş alanları, yemek ve güneşlenme alanları asansör ile birbirlerine bağlanacak.',
      'Ek olarak MSC Seaside denizlerdeki en etkileyici Aqua Park'ı sunacak. Denizlerdeki ilk slide boarding teknolojisini, interaktif oyunlar ve nefes kesici su parkı teknolojileri ile bilreştirerek her yaşa uygun eğlencelere sahip olacak.',
      'MSC Seaside, güneşi takip eden gemi!'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'msc-seaview_2019_11_08_07_41_31_iç copy.jpg' },
      { label: 'Kabin 2', image: BASE + 'msc-seaview_2019_11_08_07_41_31_iç.jpg' },
      { label: 'Kabin 3', image: BASE + 'msc-seaview_2019_11_08_07_41_31_dış copy.jpg' },
      { label: 'Kabin 4', image: BASE + 'msc-seaview_2019_11_08_07_41_31_dış.jpg' },
      { label: 'Kabin 5', image: BASE + 'msc-seaview_2019_11_08_07_41_31_balkon copy.jpg' },
      { label: 'Kabin 6', image: BASE + 'msc-seaview_2019_11_08_07_41_31_balkon.jpg' }
    ],
    decks: ['msc-seaview_2019_12_20_06_44_50_deck-05.png', 'msc-seaview_2019_12_20_06_44_50_deck-06.png', 'msc-seaview_2019_12_20_06_44_50_deck-07.png', 'msc-seaview_2019_12_20_06_44_50_deck-08.png', 'msc-seaview_2019_12_20_06_44_50_deck-09.png', 'msc-seaview_2019_12_20_06_44_50_deck-10.png', 'msc-seaview_2019_12_20_06_44_50_deck-11.png', 'msc-seaview_2019_12_20_06_44_50_deck-12.png', 'msc-seaview_2019_12_20_06_44_50_deck-13.png', 'msc-seaview_2019_12_20_06_44_50_deck-14.png', 'msc-seaview_2019_12_20_06_44_50_deck-15.png', 'msc-seaview_2019_12_20_06_44_50_deck-16.png', 'msc-seaview_2019_12_20_06_44_50_deck-18.png', 'msc-seaview_2019_12_20_06_44_50_deck-19.png'],
    video: 'https://www.youtube.com/embed/uqwidWvNxTc'
  },

  'msc-preziosa': {
    name: 'MSC Preziosa', company: 'MSC Cruises',
    photos: [BASE + 'msc-preziosa_2019_12_20_06_49_00_1.jpg', BASE + 'msc-preziosa_2019_12_20_06_49_00_2.jpg', BASE + 'msc-preziosa_2019_12_20_06_49_00_3.jpg', BASE + 'msc-preziosa_2019_12_20_06_49_00_4.jpg', BASE + 'msc-preziosa_2019_12_20_06_49_00_5.jpg', BASE + 'msc-preziosa_2019_12_20_06_49_00_6.jpg', BASE + 'msc-preziosa_2019_12_20_06_49_00_7.jpg'],
    description: [
      'Modern bir Akdeniz Başyapıtı',
      'Dünya çapında seyahat etmeniz için lüx ve ihtişam ile tasarlanmış ekolojik gemi MSC Preziosa ile Akdeniz yaşam tarzını deneyimleyin.',
      'Klasik çizgiler ve doğal malzemeler ile tasarlanmış lobisindeki gerçek taşlar ile süslenmiş meydanı ve Swarovski kristaller ile bezeli büyülü sonsuzluk havuzuna hayran kalacaksınız.',
      'ödüllü harika MSC Aurea Spa'da bakım ve güzellik imkanı ile rahatlayın, MSC Yatch Club'da özel suitler, özel uşak hizmeti, kişiye özel servisler, özel güverteler ile dünya çapında bir cruise lüxünü yaşarken, casino'da zaman geçirip, Broadway tarzı tiyatroda eğlenebilirsiniz.',
      'MSC Preziosa'nın yeniliklerini keşfedin; mesela Eataly ile slow food gastronomisinin keyfine varın, 18.kat'ta yetişkinlere özel güneşlenme güvertesi, spa ve çocuklar için Tiki barda leziz içecekler. çocuklar için Doremi Castle, çocuk ve gençlik kulüpler, denizlerdeki en büyük su parkı olan 2013 "En iyi inovasyon" ödüllü Vertigonun da bulunduğu havuz imkanları, açık mutfaklı Galaxy restaurant, tüm gün yemek imkanları ve tempoyu gece boyunca düşürmeyen panoromic disco.',
      'MSC Preziosa'da bunlar ve daha fazlası denizleri keşfederken Akdeniz usulü bir yaşam tarzını sizlere sunuyor.'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'msc-preziosa_2019_11_09_03_44_35_iç copy.jpg' },
      { label: 'Kabin 2', image: BASE + 'msc-preziosa_2019_11_09_03_44_35_iç.jpg' },
      { label: 'Kabin 3', image: BASE + 'msc-preziosa_2019_11_09_03_44_35_dış copy.jpg' },
      { label: 'Kabin 4', image: BASE + 'msc-preziosa_2019_11_09_03_44_35_dış.jpg' },
      { label: 'Kabin 5', image: BASE + 'msc-preziosa_2019_11_09_03_44_35_balkonlu copy.jpg' },
      { label: 'Kabin 6', image: BASE + 'msc-preziosa_2019_11_09_03_44_35_balkonlu.jpg' }
    ],
    decks: ['msc-preziosa_2019_12_20_06_49_41_deck-05.png', 'msc-preziosa_2019_12_20_06_49_41_deck-06.png', 'msc-preziosa_2019_12_20_06_49_41_deck-07.png', 'msc-preziosa_2019_12_20_06_49_41_deck-08.png', 'msc-preziosa_2019_12_20_06_49_41_deck-09.png', 'msc-preziosa_2019_12_20_06_49_41_deck-10.png', 'msc-preziosa_2019_12_20_06_49_41_deck-11.png', 'msc-preziosa_2019_12_20_06_49_41_deck-12.png', 'msc-preziosa_2019_12_20_06_49_41_deck-13.png', 'msc-preziosa_2019_12_20_06_49_41_deck-14.png', 'msc-preziosa_2019_12_20_06_49_41_deck-15.png', 'msc-preziosa_2019_12_20_06_49_41_deck-16.png', 'msc-preziosa_2019_12_20_06_49_41_deck-18.png'],
    video: 'https://www.youtube.com/embed/45vtvrJwguM'
  },

  'msc-splendida': {
    name: 'MSC Splendida', company: 'MSC Cruises',
    photos: [BASE + 'msc-splendida_2019_12_20_06_52_25_1.jpg', BASE + 'msc-splendida_2019_12_20_06_52_25_2.jpg', BASE + 'msc-splendida_2019_12_20_06_52_25_3.jpg', BASE + 'msc-splendida_2019_12_20_06_52_25_4.jpg', BASE + 'msc-splendida_2019_12_20_06_52_25_5.jpg', BASE + 'msc-splendida_2019_12_20_06_52_25_6.jpg', BASE + 'msc-splendida_2019_12_20_06_52_25_7.jpg', BASE + 'msc-splendida_2019_12_20_06_52_25_8.jpg'],
    description: [
      'Muhteşem bir stil ile rüyayı yaşayın',
      'Ekolojik gemi Splendida ile iki şahaseri yaşayın, her gün farklı bir harika destinasyona ulaşmak ve her akşam bir başka harika destinasyonu yaşamak.',
      'Tasarım barlarda canlı müzik, sıradışı çeşitlilikte temalı barlar, otantik Akdeniz lezzetlerinin tatları ve baharatlı lezzetleri tadabileceğiniz Meksika restaurantı. Dünya çapında şovların sahne aldığı The Strand Theatre, kazandıran Royal Palm Casino veya geç saatlere kadar Club 33 diskoda eğlence.',
      'Dört yüzme havuzu, koşu parkuru, squash kortu ve ultra modern spor salonunda terinizi atın.',
      'Spordan sonra egzotik MSC Aurea Spa'da şımartan Bali masajı, gelişmiş bakım programları, Türk hamamı, sauna, ufak havuzlar ve solaryum ile rahatlayın.',
      'Kat 18?de yetişkinlere özel güneş banyosu, kişiye özel spa servisleri ve bar içecekleri, meyve ikramları, çocuklar ve gençler için çeşitli aktiviteler ve kendi kulüpleri.MSC Yatch Club'ın 71 farklı suitinin yanısıra özel resepsiyon, 24 saat uşak servisi, özel Top Sail Lounge, havuz katı ve barı sizi bekliyor.',
      'Daha fazlasını MSC Splendida ile keşfederken yeni rotaların heyecanını yaşayın.'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'msc-splendida_2019_11_09_04_24_57_iç copy.jpg' },
      { label: 'Kabin 2', image: BASE + 'msc-splendida_2019_11_09_04_24_57_iç.jpg' },
      { label: 'Kabin 3', image: BASE + 'msc-splendida_2019_11_09_04_24_57_dış copy.jpg' },
      { label: 'Kabin 4', image: BASE + 'msc-splendida_2019_11_09_04_24_57_dış.jpg' },
      { label: 'Kabin 5', image: BASE + 'msc-splendida_2019_11_09_04_24_57_balkon copy.jpg' },
      { label: 'Kabin 6', image: BASE + 'msc-splendida_2019_11_09_04_24_57_balkon.jpg' }
    ],
    decks: [],
    video: 'https://www.youtube.com/embed/lF-_3C588JA'
  },

  'msc-fantasia': {
    name: 'MSC Fantasia', company: 'MSC Cruises',
    photos: [BASE + 'msc-fantasia_2019_12_20_06_55_56_MSC_FANTASIA (9).jpg', BASE + 'msc-fantasia_2019_12_20_06_55_56_MSC_FANTASIA (1).jpg', BASE + 'msc-fantasia_2019_12_20_06_55_56_MSC_FANTASIA (2).jpg', BASE + 'msc-fantasia_2019_12_20_06_55_56_MSC_FANTASIA (3).jpg', BASE + 'msc-fantasia_2019_12_20_06_55_56_MSC_FANTASIA (4).jpg', BASE + 'msc-fantasia_2019_12_20_06_55_56_MSC_FANTASIA (5).jpg', BASE + 'msc-fantasia_2019_12_20_06_55_56_MSC_FANTASIA (6).jpg', BASE + 'msc-fantasia_2019_12_20_06_55_56_MSC_FANTASIA (8).jpg', BASE + 'msc-fantasia_2019_12_20_06_55_56_MSC_FANTASIA.jpg'],
    description: [
      'Stil sahibi ve çevreci MSC Fantasia',
      'MSC Fantasia yeni bir vizyonu hedef aldı, Akdeniz'in doğa dostu yüzen şehri olmak.',
      'Lobisinde sizleri fırından çıkmış taze lezzetleri bulabileceğiniz espresso barı, şık butikleri ve duty free alışveriş dükkanları karşılayacak.',
      'özel tasarım lounge barları, şehrin havasını getiren gurme tatları, piano,jazz ve spor barları, video oyun barı ve canlı etkinliklerin yayınlandığı dev ekranlar geminin her yerinde dinlenme ve sohbet imkanları sunuyor.',
      'Monte Carlo casinosu, manzaralı liquid diskosu, futuristik Broadway tiyatrosu dünya çapında eğlence sunuyor.',
      'Restaurantlar lezzetin başkenti gibi, murano camları ile süslenmiş kırmızı halılar ile gireceğiniz büyük Il Cerchio d'Oro restaurantı ve El Sombrero Meksika lezzetleri.',
      'Tenis, basketbol, mini-golf, koşu alanı,aqua yüzme havuzu kompleksi, spor salonu, Formula 1 simülatörü ve 4D cinema ile dolu, dolu aktivite ve eğlence seçenekleri.',
      'MSC Aurea Spa ve 18.kat güneşlenme alanı yetişkinler için bir kaçamak imkanı sunarken çocuklar ve gençler kendilerine özel kulüplerde zamanın nasıl geçtiğini anlamayacaklar.',
      'MSC Yatch Club'ın özel imkanları ile 24 saat özel uşak, özel lounge ve havuz alanının keyfini çıkarabilirsiniz.',
      'Henüz bitmedi. Yüzen şehir MSC Fantasia'da her zaman keşfedilecek yeni bir unutulmaz deneyim vardır. Gelin ve görün!'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'msc-fantasia_2019_11_09_04_49_58_iç copy.jpg' },
      { label: 'Kabin 2', image: BASE + 'msc-fantasia_2019_11_09_04_49_58_iç.jpg' },
      { label: 'Kabin 3', image: BASE + 'msc-fantasia_2019_11_09_04_49_58_dış copy.jpg' },
      { label: 'Kabin 4', image: BASE + 'msc-fantasia_2019_11_09_04_49_58_dış.jpg' },
      { label: 'Kabin 5', image: BASE + 'msc-fantasia_2019_11_09_04_49_58_balkon copy.jpg' },
      { label: 'Kabin 6', image: BASE + 'msc-fantasia_2019_11_09_04_49_58_balkon.jpg' }
    ],
    decks: ['msc-fantasia_2019_12_20_06_56_26_deck-05.png', 'msc-fantasia_2019_12_20_06_56_26_deck-06.png', 'msc-fantasia_2019_12_20_06_56_26_deck-07.png', 'msc-fantasia_2019_12_20_06_56_26_deck-08.png', 'msc-fantasia_2019_12_20_06_56_26_deck-09.png', 'msc-fantasia_2019_12_20_06_56_26_deck-10.png', 'msc-fantasia_2019_12_20_06_56_27_deck-11.png', 'msc-fantasia_2019_12_20_06_56_27_deck-12.png', 'msc-fantasia_2019_12_20_06_56_27_deck-13.png', 'msc-fantasia_2019_12_20_06_56_27_deck-14.png', 'msc-fantasia_2019_12_20_06_56_27_deck-15.png', 'msc-fantasia_2019_12_20_06_56_27_deck-16.png', 'msc-fantasia_2019_12_20_06_56_27_deck-18.png'],
    video: 'https://www.youtube.com/embed/XZspu--E6jI'
  },

  'msc-armonia': {
    name: 'MSC Armonia', company: 'MSC Cruises',
    photos: [BASE + 'msc-armonia_2020_01_16_08_57_49_1.jpg', BASE + 'msc-armonia_2020_01_16_08_57_49_2.jpg', BASE + 'msc-armonia_2020_01_16_08_57_49_3.jpg', BASE + 'msc-armonia_2020_01_16_08_57_49_4.jpg', BASE + 'msc-armonia_2020_01_16_08_57_49_5.jpg', BASE + 'msc-armonia_2020_01_16_08_57_49_6.jpg', BASE + 'msc-armonia_2020_01_16_08_57_49_7.jpg'],
    description: [
      'MSC Armonia basit tanımların dışında, klasik cruise çizgileri ile lüx bir tatil köyünün tüm özelliklerini mükemmel şekilde harmanlanmasıdır.',
      'En ufak gemilerimizden olmasına rağmen unutulmaz ve en uzak destinasyonlara ulaşabilen MSC Armonia, MSC Cruises'ın tüm gemilerinin sunduklarından azını sunmuyor.',
      'üst güvertede iki adet açık yüzme havuzu ve iki adet açık jakuzi, spor salonu, shuffleboard, minigolf, en modern güzellik ve bakım programlarınının yanısıra Bali masajı yaptırabileceğiniz MSC Aurea Spa, ışıltılı Starlight diskosu, Palm Beach casinosu ve havadar La Fenice tiyatrosu bunlardan bazıları.',
      'özel tasarım temalı bar ve lounge seçeneklerinde her türlü modunuza göre canlı müzik programları arasında seçim yapabilirsiniz. Geleneksel İngiliz pub'ı ve taze pişmiş mamullerin yanısıra gerçek İtalyan espresso'larını tadabileceğiniz otantik İtalyan cafesi bile var.',
      'Gençler Star Galaxy video oyun salonunda eğlenirken çocuklar Seven Dwarves oyun odasını çok sececekler.',
      'Bu büyüleyici gemide dört adet restaurant var, Marco Polo, La Pergola, La Brasserie ve Girasole al fresco restaurant. Herbiri farklı çizgiler, stiller ve lezzetler ile farklılaşan bu restaurantların ortak özelliği "slow food" prensibi doğrultusunda tipik Akdeniz lezzetlerinin en taze malzemeler ile hazırlanmış gelenseksel tariflerine sadık kalmak.Tüm bunlar, size harmoninin dünyasını getirmek adına MSC Armonia'nın neden en iyi seçenek olduğunu açıklıyor.',
      'Uzunluk: 274.9 Metre',
      'Yolcu Kapasitesi: 2679',
      'Personel Sayısı: 721',
      'Yolcu Güvertesi: 9 Adet',
      'Havuz: 2 büyük ve çocuk, 2 jacuzzi',
      'Tonaj: 65.600 GT',
      'Maksimum Hız: 21 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'msc-armonia_2020_01_16_18_18_43_İç Kabin copy.jpg' },
      { label: 'Kabin 2', image: BASE + 'msc-armonia_2020_01_16_18_18_43_İç Kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'msc-armonia_2020_01_16_18_18_43_dış Kabin copy.jpg' },
      { label: 'Kabin 4', image: BASE + 'msc-armonia_2020_01_16_18_18_43_dış Kabin.jpg' },
      { label: 'Kabin 5', image: BASE + 'msc-armonia_2020_01_16_18_18_43_Dış Kabin Balkonlu.jpg' },
      { label: 'Kabin 6', image: BASE + 'msc-armonia_2020_01_16_18_18_43_Suit.jpg' }
    ],
    decks: ['msc-armonia_2020_01_16_08_59_16_Deck-05.gif', 'msc-armonia_2020_01_16_08_59_16_Deck-06.gif', 'msc-armonia_2020_01_16_08_59_16_Deck-07.gif', 'msc-armonia_2020_01_16_08_59_16_Deck-08.gif', 'msc-armonia_2020_01_16_08_59_16_Deck-09.gif', 'msc-armonia_2020_01_16_08_59_16_Deck-10.gif', 'msc-armonia_2020_01_16_08_59_16_Deck-11.gif', 'msc-armonia_2020_01_16_08_59_16_Deck-12.gif', 'msc-armonia_2020_01_16_08_59_16_Deck-13.gif'],
    video: 'https://www.youtube.com/embed/VRTDFyXIfHM'
  },

  'msc-magnifica': {
    name: 'MSC Magnifica', company: 'MSC Cruises',
    photos: [BASE + 'msc-magnifica_2020_01_16_16_29_40_1.jpg', BASE + 'msc-magnifica_2020_01_16_16_29_40_2.jpg', BASE + 'msc-magnifica_2020_01_16_16_29_40_3.jpg', BASE + 'msc-magnifica_2020_01_16_16_29_40_4.jpg', BASE + 'msc-magnifica_2020_01_16_16_29_40_5.jpg', BASE + 'msc-magnifica_2020_01_16_16_29_40_6.jpg', BASE + 'msc-magnifica_2020_01_16_16_29_40_7.jpg'],
    description: [
      'Sınıfının muhteşemliği',
      'Musica sınıfının rafine rahatlığı ile Fantasia Sınıfı bayrak gemisinin çeşitliliğini bir araya getiren MSC Magnifica cruise seyyahlarına her iki sınıfın en iyi imkanlarını sunuyor.',
      'Geleneksel gemicilik ile şahane tasarımı bir araya getiren bu gemi duyularınızı şımartacak.',
      'Dünyanın farklı lezzetlerini sunan 5 farklı restaurant, 12 farklı tasarımlı bar, çocuklar ve gençlerin bayıldığı özel kulüpler var.',
      'Geminin ödüllü MSC Auerea Spa'sı size geleneksel Bali masajı ve ultra modern bakım paketleri, sauna, Türk hamamı, spor salonu, thalassotherapy odası ve rahatlama bölümü ile adeta cenneti sunacak.',
      'Açık yüzme havuzu, 4 adet ufak havuz, solaryum ve üstü cam kubbeli kapalı Magrodome havuzunda her hava şartında yüzebileceksiniz.',
      'Tenis, minigolf, bowling, bilardo, son teknoloji spor salonu ve koşu parkurunda terinizi atabilirsiniz.',
      'Akşamları ise heyecan verici casino, panaromik diskotek, 4D sinema, internet kafe, puro odası, 1200 koltuklu tiyatro,bar ve loungelar'da canlı eğlencelerin yanısıra üstü açık güvertede yıldızların altında romantik bir içki içerken dalgaları izleyebilirsiniz.',
      'Her yönü ile MSC Magnifica unutulmaz bir isminin hakkını veriyor.',
      'Uzunluk: 293,80 Metre',
      'Genişlik: 32,20 Metre',
      'Yolcu Kapasitesi: 3.223',
      'Personel Sayısı: 1.038',
      'Tonaj: 95.128 GT',
      'Maksimum Hız: 22,90 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'msc-magnifica_2020_01_16_18_28_35_iç kabin copy.jpg' },
      { label: 'Kabin 2', image: BASE + 'msc-magnifica_2020_01_16_18_28_35_iç kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'msc-magnifica_2020_01_16_18_28_35_dış kabin copy.jpg' },
      { label: 'Kabin 4', image: BASE + 'msc-magnifica_2020_01_16_18_28_35_dış kabin.jpg' },
      { label: 'Kabin 5', image: BASE + 'msc-magnifica_2020_01_16_18_28_35_dış kabin balkonlu copy.jpg' },
      { label: 'Kabin 6', image: BASE + 'msc-magnifica_2020_01_16_18_28_35_dış kabin balkonlu.jpg' },
      { label: 'Kabin 7', image: BASE + 'msc-magnifica_2020_01_16_18_28_35_suit.jpg' }
    ],
    decks: ['msc-magnifica_2020_01_16_16_58_32_Amalfi.jpg', 'msc-magnifica_2020_01_16_16_58_32_Camogli.jpg', 'msc-magnifica_2020_01_16_16_58_32_Capri.jpg', 'msc-magnifica_2020_01_16_16_58_32_Ischia.jpg', 'msc-magnifica_2020_01_16_16_58_32_Panarea.jpg', 'msc-magnifica_2020_01_16_16_58_32_Porto Cervo.jpg', 'msc-magnifica_2020_01_16_16_58_32_Portofino.jpg', 'msc-magnifica_2020_01_16_16_58_32_Portovenere.jpg', 'msc-magnifica_2020_01_16_16_58_32_Positano.jpg', 'msc-magnifica_2020_01_16_16_58_32_Riccione.jpg', 'msc-magnifica_2020_01_16_16_58_32_Sorrento.jpg', 'msc-magnifica_2020_01_16_16_58_32_Sport.jpg'],
    video: 'https://www.youtube.com/embed/pDCZwjhJAe4'
  },

  'msc-orchestra': {
    name: 'MSC Orchestra', company: 'MSC Cruises',
    photos: [BASE + 'msc-orchestra_2020_01_16_16_31_09_1.jpg', BASE + 'msc-orchestra_2020_01_16_16_31_09_2.jpg', BASE + 'msc-orchestra_2020_01_16_16_31_09_3.jpg', BASE + 'msc-orchestra_2020_01_16_16_31_09_4.jpg', BASE + 'msc-orchestra_2020_01_16_16_31_09_5.jpg', BASE + 'msc-orchestra_2020_01_16_16_31_09_6.jpg'],
    description: [
      'Mükemmellik ile Birleştirilen Unsurlar',
      'Ferah ve seçkin çizgilerin birleşimi ile önlenmiş Musica sınıfımınızdan MSC Orchestra sizleri düşlerinizdeki yolculuğua çıkartacak zira bu gemideki hayat tam olmasını istediğiniz gibi.',
      'Eğer amaç rahatalamaksa, rüzgara kapalı geniş güneşlenme alanı, Body and Mind spa'sı, şımartan Türk hamamı, saunaları ve büyülü masajları, geniş spor salonu, 5 yüzme havuzu, koşu parkuru sizleri temiz deniz havası ile birlikte formda ve huzurlu tutacak.MSC Orchestra aynı zamanda Shanghai Chinese restaurant'ın dim dum lezzetleri, Four Seasons gurme'nin İtalyan tatları ve Napoli dışında bulabileceğiniz en iyi pizzaları ile sizleri bir damak yolculuğuna çıkaracak.',
      'Bu çevre dostu geminin özel tasarım alanları var. Safari tarzında döşenmiş Savannah bar'da canlı müzik, Palm Beach Casino'da şansınızı denemek, Covent Garden Theatre'da canlı şahane şovları izlemek bu şahane gemide yapılabilecek diğer aktiviteler.',
      'Çocuklar Jungle Adventure oyun odasında ve gençler Teen's Club'da kendi dünyalarını yaşayacaklar.',
      'Yaşınız ve düşleriniz ne olursa sizin ve dostlarınız için MSC Orchestra'da hepsinin gerçekleşeceğine emin olabilirsiniz.',
      'Uzunluk: 293,8 Metre',
      'Yolcu Kapasitesi: 3.223',
      'Personel Sayısı: 1.054',
      'Tonaj: 92.409 GT',
      'Maksimum Hız: 22,9 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'msc-orchestra_2020_01_16_18_37_02_iç kabin copy.jpg' },
      { label: 'Kabin 2', image: BASE + 'msc-orchestra_2020_01_16_18_37_02_iç kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'msc-orchestra_2020_01_16_18_37_02_Dış Kabin copy.jpg' },
      { label: 'Kabin 4', image: BASE + 'msc-orchestra_2020_01_16_18_37_02_Dış Kabin.jpg' },
      { label: 'Kabin 5', image: BASE + 'msc-orchestra_2020_01_16_18_37_02_Balkonlu Dış Kabin copy.jpg' },
      { label: 'Kabin 6', image: BASE + 'msc-orchestra_2020_01_16_18_37_02_Balkonlu Dış Kabin.jpg' },
      { label: 'Kabin 7', image: BASE + 'msc-orchestra_2020_01_16_18_37_02_Suit.jpg' }
    ],
    decks: ['msc-orchestra_2020_01_16_17_16_48_Deck-04.gif', 'msc-orchestra_2020_01_16_17_16_48_Deck-05.gif', 'msc-orchestra_2020_01_16_17_16_48_Deck-06.gif', 'msc-orchestra_2020_01_16_17_16_48_Deck-07.gif', 'msc-orchestra_2020_01_16_17_16_48_Deck-08.gif', 'msc-orchestra_2020_01_16_17_16_48_Deck-09.gif', 'msc-orchestra_2020_01_16_17_16_48_Deck-10.gif', 'msc-orchestra_2020_01_16_17_16_48_Deck-11.gif', 'msc-orchestra_2020_01_16_17_16_48_Deck-12.gif', 'msc-orchestra_2020_01_16_17_16_48_Deck-13.gif', 'msc-orchestra_2020_01_16_17_16_50_Deck-14.gif', 'msc-orchestra_2020_01_16_17_16_50_Deck-15.gif', 'msc-orchestra_2020_01_16_17_16_50_Deck-16.gif'],
    video: 'https://www.youtube.com/embed/HQV1P2b71jA'
  },

  'msc-opera': {
    name: 'MSC Opera', company: 'MSC Cruises',
    photos: [BASE + 'msc-opera_2020_01_16_17_36_22_1.jpg', BASE + 'msc-opera_2020_01_16_17_36_22_2.jpg', BASE + 'msc-opera_2020_01_16_17_36_22_3.jpg', BASE + 'msc-opera_2020_01_16_17_36_22_4.jpg', BASE + 'msc-opera_2020_01_16_17_36_22_5.jpg', BASE + 'msc-opera_2020_01_16_17_36_22_6.jpg'],
    description: [
      'İnovasyona Yolculuğun üçüncü Gemisi',
      'MSC Opera yenilenmeden önce gemiye binildiği an yeni keşifler vaad ediyordu şimdi yeni özellikleri ile tüm ihtiyaçları karşılamak adına herşeye sahip.',
      'Misafirlerimizi memnut etmek adına balkonlu ve panoromik manzaralı kabinler ekledikRestaurant sayılarını ve yemek alanlarını arttırarak dünya mutfağı ile çeşitlendirdik.',
      'Tamamen müzik ve dans dolu 319 m2 boyutunda bir alan eklendi. Chicco, LEGO &reg; ve Namco gibi prestijli ortaklarımızın katkısı ile çocuklar için harika oyun alanları ve suyun coşkusunu çocuklara yaşatacak Spray Park su parkını ekledik.',
      'MSC Aurea Spa'yı büyüttük ve sizler için rahatlama imkanlarını arttırdık.',
      '6.Kat'ta "walk through shops" isimli yeni alışveriş merkezi hizmete girdi.',
      'özel tasarım Montecarlo Casino'da heyecan, La Cabala Piyano bar'da rahatlamak, Byblos disco'da ritim, dell'Opera tiyatrosunda sanat etkinlikleri ve gençlere özel executive klüpte sanal oyunlar geminin sunduklarından bazıları.',
      'Bunlar size MSC Opera'nın sunduklarından bazıları. Gemide her gün ve her dakika keşfedecek yeni deneyimler bulacaksınız.',
      'Tonaj: 65.591 GT',
      'Uzunluk: 274,9 Metre',
      'Genişlik: 32 Metre',
      'Kabin Sayısı: 1.071',
      'Yolcu Kapasitesi: 2.150',
      'Personel Sayısı: 728',
      'Maksimum Hız: 21,1 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'msc-opera_2020_01_16_17_37_31_iç kabin  copy.jpg' },
      { label: 'Kabin 2', image: BASE + 'msc-opera_2020_01_16_17_37_31_iç kabin .jpg' },
      { label: 'Kabin 3', image: BASE + 'msc-opera_2020_01_16_17_37_31_dış kabin copy.jpg' },
      { label: 'Kabin 4', image: BASE + 'msc-opera_2020_01_16_17_37_31_dış kabin.jpg' },
      { label: 'Kabin 5', image: BASE + 'msc-opera_2020_01_16_17_37_31_balkonlu dış kabin copy.jpg' },
      { label: 'Kabin 6', image: BASE + 'msc-opera_2020_01_16_17_37_31_balkonlu dış kabin.jpg' },
      { label: 'Kabin 7', image: BASE + 'msc-opera_2020_01_16_17_37_31_suit.jpg' }
    ],
    decks: ['msc-opera_2020_01_16_17_38_08_Deck-05.gif', 'msc-opera_2020_01_16_17_38_08_Deck-06.gif', 'msc-opera_2020_01_16_17_38_08_Deck-07.gif', 'msc-opera_2020_01_16_17_38_08_Deck-08.gif', 'msc-opera_2020_01_16_17_38_08_Deck-09.gif', 'msc-opera_2020_01_16_17_38_08_Deck-10.gif', 'msc-opera_2020_01_16_17_38_08_Deck-11.gif', 'msc-opera_2020_01_16_17_38_08_Deck-12.gif', 'msc-opera_2020_01_16_17_38_08_Deck-13.gif'],
    video: 'https://www.youtube.com/embed/ZVIYUxGkfg0'
  },

  'msc-musica': {
    name: 'MSC Musica', company: 'MSC Cruises',
    photos: [BASE + 'msc-musica_2020_01_16_18_02_20_1.jpg', BASE + 'msc-musica_2020_01_16_18_02_20_2.jpg', BASE + 'msc-musica_2020_01_16_18_02_20_3.jpg', BASE + 'msc-musica_2020_01_16_18_02_20_4.jpg', BASE + 'msc-musica_2020_01_16_18_02_20_5.jpg', BASE + 'msc-musica_2020_01_16_18_02_20_6.jpg'],
    description: [
      'MSC Musica\'nın müziğine hazır mısınız?',
      'MSC Musica sadece yeni bir ekolojik cruise değil, MSC Cruises'ın özelliklerini barındıran yaratıcılık, kaliteli ve doğal materyaller, detaylarda özenle zenginleştirilmiş zarif seçimleri bir arada bulunduran seçkin bir müzik dinletisi.',
      'Güvertede hayat duyular için bir festivaldir, gemiye girişten itibaren lobideki 3 katlı şelaleden akan suyun kristal zemine vuran sesi ile piyano sesi birbirine karışacak.',
      'İlham verici özel tasarım alanlarına sahip gemide CrystalLounge'da dans etmek, Havana Club puro odasında dinlenmek, şarap tadımları, Sanremo Casino'da eğlence ve La Scala tiyatrosunda süper şovları izlemek yapabileceklerinizden bazıları.',
      'Damak tadınızı da şenlendireceğiniz gemide İtalyan lezzetlerini tadabileceğiniz IL Gardino restaurant'ı, Kaito Sushi Bar'ı ve İtalyan pizzalarının tatlarını keşfedin.',
      'Çocuklar ve gençlerde MSC'nin Akdeniz usulü yaşamını kapalı ve açık oyun alanlarında, kendilerine özel havuzlarda, çocuk ve gençlik kulüplerinde keşfedebilirler.',
      'MSC Musica'ya gelerek seyahatinizi unutulmaz bir hatıraya dönüştürecek müzik ve sıcaklığın büyüsünü yaşayın.',
      'Tonaj: 92.409 GT',
      'Uzunluk: 293,80 Metre',
      'Genişlik: 32,20 Metre',
      'Kabin Sayısı: 1.275',
      'Yolcu Kapasitesi: 3.223',
      'Personel Sayısı: 1.014',
      'Maksimum Hız: 22 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'msc-musica_2020_01_16_18_46_17_iç kabin copy.jpg' },
      { label: 'Kabin 2', image: BASE + 'msc-musica_2020_01_16_18_46_17_iç kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'msc-musica_2020_01_16_18_46_17_Dış Kabin copy.jpg' },
      { label: 'Kabin 4', image: BASE + 'msc-musica_2020_01_16_18_46_17_Dış Kabin.jpg' },
      { label: 'Kabin 5', image: BASE + 'msc-musica_2020_01_16_18_46_17_Balkonlu Dış Kabin copy.jpg' },
      { label: 'Kabin 6', image: BASE + 'msc-musica_2020_01_16_18_46_17_Balkonlu Dış Kabin.jpg' },
      { label: 'Kabin 7', image: BASE + 'msc-musica_2020_01_16_18_46_17_Suit.jpg' }
    ],
    decks: ['msc-musica_2020_01_16_18_02_54_Deck-04.gif', 'msc-musica_2020_01_16_18_02_54_Deck-05.gif', 'msc-musica_2020_01_16_18_02_54_Deck-06.gif', 'msc-musica_2020_01_16_18_02_54_Deck-07.gif', 'msc-musica_2020_01_16_18_02_54_Deck-08.gif', 'msc-musica_2020_01_16_18_02_54_Deck-09.gif', 'msc-musica_2020_01_16_18_02_54_Deck-10.gif', 'msc-musica_2020_01_16_18_02_54_Deck-11.gif', 'msc-musica_2020_01_16_18_02_54_Deck-12.gif', 'msc-musica_2020_01_16_18_02_54_Deck-13.gif', 'msc-musica_2020_01_16_18_02_54_Deck-14.gif', 'msc-musica_2020_01_16_18_02_54_Deck-15.gif', 'msc-musica_2020_01_16_18_02_54_Deck-16.gif'],
    video: 'https://www.youtube.com/embed/jt0wdRTEEDc'
  },

  'msc-sinfonia': {
    name: 'MSC Sinfonia', company: 'MSC Cruises',
    photos: [BASE + 'msc-sinfonia_2020_01_16_19_33_51_1.jpg', BASE + 'msc-sinfonia_2020_01_16_19_33_51_2.jpg', BASE + 'msc-sinfonia_2020_01_16_19_33_51_3.jpg', BASE + 'msc-sinfonia_2020_01_16_19_33_51_4.jpg', BASE + 'msc-sinfonia_2020_01_16_19_33_51_5.jpg', BASE + 'msc-sinfonia_2020_01_16_19_33_51_6.jpg'],
    description: [
      'UNUTULMAZ BİR DENEYİM',
      'MSC Sinfonia\'ya adım atmak adeta bir keşif yolculuğna başlamaktır. Yeni fasiliteler ile bezenmiş gemi her ihtiyacı karşılamak üzere yenilendi. Muhteşem panoramik mazaraları ile yeni balkonlu kabinler eklendi. Dünya mutfaklarından daha fazla örnekler sunabilmek adına restoran ve büfe alanları genişletildi. 319 metrekare genişliğinde yeni bir alan ise müzik ve dans tutkunları için dizayn edildi. Chicco, Lego, Namco gibi prestijli iş ortaklarımız ile, her yaştan çocuklar için, yeni oyun alanları yapıldı. Sprey park bunlardan sadece bir tanesi...',
      'Rahatlama ve masaj için ise MSC Aurea SPA alanı genişletildi.',
      'SAN CARLO TİYATROSU ise geleneksel çizgilerin modern yorumu ile yenilendi. Unutmayın, tiyatroda gerçekleşen akşam şovları için gemide rezervasyon yaptırmalısınız (sadece MSC Sinfonia\'da). Rezervasyonunuzu 3 farklı şekilde yapabilirsiniz:',
      'Bunlar MSC Sinfonia\'da yaşayabileceğiz keyiflerden sadece birkaç ipucu. Gemide geçireceğiniz her gün ve her anda keşfedeceğiniz daha çok şey var.',
      'Tonaj: 65.542 GT',
      'Uzunluk: 274,9 Metre',
      'Genişlik: 32 Metre',
      'Kabin Sayısı: 980',
      'Yolcu Kapasitesi: 2.679',
      'Personel Sayısı: 721',
      'Maksimum Hız: 20,1 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'msc-sinfonia_2020_01_16_19_34_30_İç Kabin copy.jpg' },
      { label: 'Kabin 2', image: BASE + 'msc-sinfonia_2020_01_16_19_34_30_İç Kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'msc-sinfonia_2020_01_16_19_34_30_DIş Kabin copy.jpg' },
      { label: 'Kabin 4', image: BASE + 'msc-sinfonia_2020_01_16_19_34_30_DIş Kabin.jpg' },
      { label: 'Kabin 5', image: BASE + 'msc-sinfonia_2020_01_16_19_34_30_Balkonlu Dış Kabin copy.jpg' },
      { label: 'Kabin 6', image: BASE + 'msc-sinfonia_2020_01_16_19_34_30_Balkonlu Dış Kabin.jpg' },
      { label: 'Kabin 7', image: BASE + 'msc-sinfonia_2020_01_16_19_34_30_Suit.jpg' }
    ],
    decks: ['msc-sinfonia_2020_01_16_19_34_55_Deck-05 Beethoven.jpg', 'msc-sinfonia_2020_01_16_19_34_55_Deck-06 Mozart.jpg', 'msc-sinfonia_2020_01_16_19_34_55_Deck-07 Brahms.jpg', 'msc-sinfonia_2020_01_16_19_34_55_Deck-08 Bach.jpg', 'msc-sinfonia_2020_01_16_19_34_55_Deck-09 Tchaikovski.jpg', 'msc-sinfonia_2020_01_16_19_34_55_Deck-10 Sibelius.jpg', 'msc-sinfonia_2020_01_16_19_34_55_Deck-11 Debussy.jpg', 'msc-sinfonia_2020_01_16_19_34_55_Deck-12 Bizet.jpg', 'msc-sinfonia_2020_01_16_19_34_55_Deck-13 Schubert.jpg'],
    video: 'https://www.youtube.com/embed/mltY2mM2bZ4'
  },


  /* ===================== ROYAL CARIBBEAN ===================== */

  'allure-of-the-seas': {
    name: 'Allure Of The Seas', company: 'Royal Caribbean',
    photos: [BASE + 'allure-of-the-seas_2019_12_20_07_01_14_3.jpg', BASE + 'allure-of-the-seas_2019_12_20_07_01_14_1.jpg', BASE + 'allure-of-the-seas_2019_12_20_07_01_14_2.jpg', BASE + 'allure-of-the-seas_2019_12_20_07_01_14_4.jpg', BASE + 'allure-of-the-seas_2019_12_20_07_01_14_5.png'],
    description: [
      'Allure Of The Seas, bugüne kadarki yapılmış dünyanın en büyük yolcu gemisidir. Royal Caribbean Cruises şirketi tarafından yapımına 2 Aralık 2008?de başlandı. Yapımı iki yıl süren gemi 1 Aralık 2010?da ilk yolcusunu almaya başladı.',
      'Allure Of The Seas, 18 katlı, 220,000 tonaj ağırlığında, 362 mt. uzunluğunda, 47 mt genişliğinde, 9,15 mt derinliğinde, 23.7 knots hızında olup yolcu kapasitesi 5.402, personel sayısı 2.115, Amerika ağırlıklı personel uyruğu dışında Türk personel de bulunmaktadır.',
      'Allure Of The Seas içindeki özellikleri düşününce 5 yıldızlı otellerden kat kat daha üstün olduğu ortaya çıkmakta. İçindekiler; 16 güverte, cadde görünümlü alışveriş merkezleri, 4 havuz ve su parkı, 10 dev jakuzi, cilt bakımı, yoga, spor salonları, solaryum, kütüphane, kumarhane, iki sörf simülatörü, 43 metre yüksekliğinde iki ayrı kaya tırmanma duvarı, buz pateni pisti, mini golf sahası, tam boy basketbol sahası, boks ringi, dünyaca ünlü mutfaklardan yemek seçenekleri, 22 bar ve gece klübü, konser salonu, 1380 kişilik tiyatro salonu, sinema salonu, gümrüksüz alışveriş yapabileceğiniz yüzlerce mağaza bulunmaktadır.'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'allure-of-the-seas_2019_12_10_04_35_33_allure of the seas ic kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'allure-of-the-seas_2019_12_10_04_35_33_allure of the seas dis kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'allure-of-the-seas_2019_12_10_04_35_33_allure of the seas balkonlu kabin.jpg' },
      { label: 'Kabin 4', image: BASE + 'allure-of-the-seas_2019_12_10_04_35_33_allure of the seas suite kabin.jpg' }
    ],
    decks: ['allure-of-the-seas_2019_12_20_07_02_25_deck-03.png', 'allure-of-the-seas_2019_12_20_07_02_25_deck-04.png', 'allure-of-the-seas_2019_12_20_07_02_25_deck-05.png', 'allure-of-the-seas_2019_12_20_07_02_25_deck-06.png', 'allure-of-the-seas_2019_12_20_07_02_25_deck-07.png', 'allure-of-the-seas_2019_12_20_07_02_25_deck-08.png', 'allure-of-the-seas_2019_12_20_07_02_25_deck-09.png', 'allure-of-the-seas_2019_12_20_07_02_25_deck-10.png', 'allure-of-the-seas_2019_12_20_07_02_25_deck-11.png', 'allure-of-the-seas_2019_12_20_07_02_25_deck-12.png', 'allure-of-the-seas_2019_12_20_07_02_25_deck-14.png', 'allure-of-the-seas_2019_12_20_07_02_25_deck-15.png', 'allure-of-the-seas_2019_12_20_07_02_25_deck-16.png', 'allure-of-the-seas_2019_12_20_07_02_25_deck-17.png', 'allure-of-the-seas_2019_12_20_07_02_25_deck-18.png'],
    video: 'https://www.youtube.com/embed/5yCe7DJlDns'
  },

  'jewel-of-the-seas': {
    name: 'Jewel Of The Seas', company: 'Royal Caribbean',
    photos: [BASE + 'jewel-of-the-seas_2019_12_20_07_13_28_1.jpg', BASE + 'jewel-of-the-seas_2019_12_20_07_13_28_2.png', BASE + 'jewel-of-the-seas_2019_12_20_07_13_28_3.png', BASE + 'jewel-of-the-seas_2019_12_20_07_13_28_4.png', BASE + 'jewel-of-the-seas_2019_12_20_07_13_28_5.jpg', BASE + 'jewel-of-the-seas_2019_12_20_07_13_28_6.jpg'],
    description: [
      'Jewel of the Seas; rahatlığı, büyütülmüş alanları, panoramik okyanus manzaraları ve her isteğinize özen ile cevap verecek eğitimli personeli ile size tam bir cruise deneyimi sunuyor. Ayırt edici özellikleri arasında on katlı cam merkezi, deniz manzaralı cam asansörler ve Royal Caribbean filosundaki en yüksek oranda dış kabin sayısı bulunmaktadır. Süper yat dizaynı ile karakterize olmuş Radiance Sınıfı gemiler, camlı alanları, sanat eserleri ve heykeller ile tamamlanmış modern mobilyaları ile dikkat çekmektedir. Açık alanları, balkonları ve daha çok cam görünümüyle Radiance Sınıfı gemilerde bir gemide olduğunuzu unutacaksınız.',
      'Denize İniş Tarihi: 2004',
      'Yolcu Kapasitesi: 2502',
      'Mürettebat: 859',
      'Tonaj: 90.000',
      'Uzunluk: 293 Metre',
      'Hız: 25 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'jewel-of-the-seas_2019_12_10_05_12_50_iç kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'jewel-of-the-seas_2019_12_10_05_12_50_dış kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'jewel-of-the-seas_2019_12_10_05_12_50_balkonlu dış kabin.jpg' },
      { label: 'Kabin 4', image: BASE + 'jewel-of-the-seas_2019_12_10_05_12_50_Standart suite oda.jpg' }
    ],
    decks: ['jewel-of-the-seas_2019_12_20_07_15_44_deck-02.png', 'jewel-of-the-seas_2019_12_20_07_15_44_deck-03.png', 'jewel-of-the-seas_2019_12_20_07_15_44_deck-04.png', 'jewel-of-the-seas_2019_12_20_07_15_44_deck-05.png', 'jewel-of-the-seas_2019_12_20_07_15_44_deck-06.png', 'jewel-of-the-seas_2019_12_20_07_15_44_deck-07.png', 'jewel-of-the-seas_2019_12_20_07_15_44_deck-08.png', 'jewel-of-the-seas_2019_12_20_07_15_44_deck-09.png', 'jewel-of-the-seas_2019_12_20_07_15_44_deck-10.png', 'jewel-of-the-seas_2019_12_20_07_15_44_deck-11.png', 'jewel-of-the-seas_2019_12_20_07_15_44_deck-12.png', 'jewel-of-the-seas_2019_12_20_07_15_44_deck-14.png'],
    video: 'https://www.youtube.com/embed/7jSmz-l85xg'
  },

  'oasis-of-the-seas': {
    name: 'Oasis Of The Seas', company: 'Royal Caribbean',
    photos: [BASE + 'oasis-of-the-seas_2019_12_20_07_19_44_1.jpg', BASE + 'oasis-of-the-seas_2019_12_20_07_19_44_2.jpg', BASE + 'oasis-of-the-seas_2019_12_20_07_19_44_3.png'],
    description: [
      'Oasis Of The Seas, Royal Caribbean yeni katılan gemilerinden bir tanesi. 16 katlı gemide 2.160 görevlisi ve yolcu kapasitesi 5.400 kişi olup Amerika ağırlıklı personel uyruğu dışında Türk personel de bulunmaktadır.',
      'Oasis Of The Seas içindeki özellikleri, cadde görünümlü alışveriş merkezleri, 4 havuz ve su parkı, 10 dev jakuzi, cilt bakımı, yoga, spor salonları, solaryum, kütüphane, kumarhane, iki sörf simülatörü, 43 metre yüksekliğinde iki ayrı kaya tırmanma duvarı, buz pateni pisti, mini golf sahası, tam boy basketbol sahası, dünyaca ünlü mutfaklardan yemek seçenekleri, bar, jazz club, karaoke bar, komedi klübü ve gece klübü, konser salonu, tiyatro salonu, 4D sinema salonu, gümrüksüz alışveriş yapabileceğiniz yüzlerce mağaza bulunmaktadır.',
      'Uzunluk: 362 Metre',
      'Yolcu Kapasitesi: 5400',
      'Mürettebat: 2160',
      'Hız: 22 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'oasis-of-the-seas_2019_12_10_05_51_38_İç Kabin.png' },
      { label: 'Kabin 2', image: BASE + 'oasis-of-the-seas_2019_12_10_05_51_38_Dış Kabin.png' },
      { label: 'Kabin 3', image: BASE + 'oasis-of-the-seas_2019_12_10_05_51_38_Balkonlu Dış Kabin.png' },
      { label: 'Kabin 4', image: BASE + 'oasis-of-the-seas_2019_12_10_05_51_38_Suit1.jpg' }
    ],
    decks: ['oasis-of-the-seas_2019_12_20_07_20_50_deck-03.png', 'oasis-of-the-seas_2019_12_20_07_20_50_deck-04.png', 'oasis-of-the-seas_2019_12_20_07_20_51_deck-05.png', 'oasis-of-the-seas_2019_12_20_07_20_51_deck-06.png', 'oasis-of-the-seas_2019_12_20_07_20_51_deck-07.png', 'oasis-of-the-seas_2019_12_20_07_20_51_deck-08.png', 'oasis-of-the-seas_2019_12_20_07_20_51_deck-09.png', 'oasis-of-the-seas_2019_12_20_07_20_51_deck-10.png', 'oasis-of-the-seas_2019_12_20_07_20_51_deck-11.png', 'oasis-of-the-seas_2019_12_20_07_20_51_deck-12.png', 'oasis-of-the-seas_2019_12_20_07_20_51_deck-14.png', 'oasis-of-the-seas_2019_12_20_07_20_51_deck-15.png', 'oasis-of-the-seas_2019_12_20_07_20_51_deck-16.png', 'oasis-of-the-seas_2019_12_20_07_20_51_deck-17.png', 'oasis-of-the-seas_2019_12_20_07_20_51_deck-18.png'],
    video: 'https://www.youtube.com/embed/PCdCvXBh8Cg'
  },

  'ovation-of-the-seas': {
    name: 'Ovation Of The Seas', company: 'Royal Caribbean',
    photos: [BASE + 'ovation-of-the-seas_2019_12_20_07_25_52_1.jpeg', BASE + 'ovation-of-the-seas_2019_12_20_07_25_52_2.jpg', BASE + 'ovation-of-the-seas_2019_12_20_07_25_52_3.jpg', BASE + 'ovation-of-the-seas_2019_12_20_07_25_52_4.jpg'],
    description: [
      'Teknolojinin denizlerde ulaştığı son nokta Ovation of the Seas'dir. 2016 İlkbaharında denizler ile buluşan Ovation of theSeas'de diğer hiçbir gemide olmayan yenilikler var. Geleceğin teknolojisinin, çocukluğumuzun nostaljisi ile karşılaştığı bir gemi. Cruise seyahatiniz süresince sizleri şaşırtacak yenilikleriyle sürpriz dolu bir gemi. Quantum sınıfının en çok beklenen özelliklerinden biri olan Kuzey Yıldızı sizleri gemiden 90 metre yükseğe taşıyarak okyanusun, heyecan verici destinasyonların ve geminizin 360 derece nefes kesici manzarasını ayaklarınızın altına serecek.',
      'Denize İniş Tarihi: 2016',
      'Maliyeti: 1.400.000.000 USD',
      'Yolcu: 4.905',
      'Mürettebat: 1.500',
      'Uzunluk: 348 Metre',
      'Tonaj: 167.800',
      'Hız: 22 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'ovation-of-the-seas_2019_12_10_06_44_07_iç kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'ovation-of-the-seas_2019_12_10_06_44_07_dış kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'ovation-of-the-seas_2019_12_10_06_44_07_Balkonlu Dış Kabin.jpg' },
      { label: 'Kabin 4', image: BASE + 'ovation-of-the-seas_2019_12_10_06_44_07_Suit.jpg' }
    ],
    decks: ['ovation-of-the-seas_2019_12_20_07_27_00_deck-03.jpg', 'ovation-of-the-seas_2019_12_20_07_27_00_deck-04.jpg', 'ovation-of-the-seas_2019_12_20_07_27_00_deck-05.jpg', 'ovation-of-the-seas_2019_12_20_07_27_00_deck-06.jpg', 'ovation-of-the-seas_2019_12_20_07_27_00_deck-07.jpg', 'ovation-of-the-seas_2019_12_20_07_27_00_deck-08.jpg', 'ovation-of-the-seas_2019_12_20_07_27_00_deck-09.jpg', 'ovation-of-the-seas_2019_12_20_07_27_00_deck-10.jpg', 'ovation-of-the-seas_2019_12_20_07_27_00_deck-11.jpg', 'ovation-of-the-seas_2019_12_20_07_27_00_deck-12.jpg', 'ovation-of-the-seas_2019_12_20_07_27_00_deck-13.jpg', 'ovation-of-the-seas_2019_12_20_07_27_00_deck-14.jpg', 'ovation-of-the-seas_2019_12_20_07_27_00_deck-15.jpg', 'ovation-of-the-seas_2019_12_20_07_27_00_deck-16.jpg'],
    video: 'https://www.youtube.com/embed/ByVRaNnlB_M'
  },

  'harmony-of-the-seas': {
    name: 'Harmony Of The Seas', company: 'Royal Caribbean',
    photos: [BASE + 'harmony-of-the-seas_2019_12_20_07_28_40_1.jpg', BASE + 'harmony-of-the-seas_2019_12_20_07_28_40_2.jpg', BASE + 'harmony-of-the-seas_2019_12_20_07_28_40_3.jpg', BASE + 'harmony-of-the-seas_2019_12_20_07_28_40_4.jpg'],
    description: [
      'Harmony Of The Seas, Royal Caribbean yeni katılan gemilerinden bir tanesi. 16 katlı gemide 227.000 tonaj ağırlığında, 2.100 görevlisi ve yolcu kapasitesi 5.400 kişi olup Amerika ağırlıklı personel uyruğu dışında Türk personel de bulunmaktadır.',
      'Harmony Of The Seas içindeki özellikleri, cadde görünümlü alışveriş merkezleri, 4 havuz ve su parkı, 10 dev jakuzi, cilt bakımı, yoga, spor salonları, solaryum, kütüphane, kumarhane, iki sörf simülatörü, 43 metre yüksekliğinde iki ayrı kaya tırmanma duvarı, buz pateni pisti, mini golf sahası, tam boy basketbol sahası, dünyaca ünlü mutfaklardan yemek seçenekleri, bar, jazz club, karaoke bar, komedi klübü ve gece klübü, konser salonu, tiyatro salonu, 4D sinema salonu, gümrüksüz alışveriş yapabileceğiniz yüzlerce mağaza bulunmaktadır.',
      'Denize İniş Tarihi: 2015',
      'Kapasite: 5.400',
      'Mürettebat: 2.100',
      'Uzunluk: 348 Metre',
      'Tonaj: 227.000',
      'Hız: 23 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'harmony-of-the-seas_2019_12_10_08_05_09_iç kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'harmony-of-the-seas_2019_12_10_08_05_09_dış kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'harmony-of-the-seas_2019_12_10_08_05_09_Balkonlu dış.jpg' },
      { label: 'Kabin 4', image: BASE + 'harmony-of-the-seas_2019_12_10_08_05_09_suit.jpg' }
    ],
    decks: ['harmony-of-the-seas_2019_12_20_07_29_29_deck-03.jpg', 'harmony-of-the-seas_2019_12_20_07_29_29_deck-04.jpg', 'harmony-of-the-seas_2019_12_20_07_29_29_deck-05.jpg', 'harmony-of-the-seas_2019_12_20_07_29_29_deck-06.jpg', 'harmony-of-the-seas_2019_12_20_07_29_29_deck-07.jpg', 'harmony-of-the-seas_2019_12_20_07_29_29_deck-08.jpg', 'harmony-of-the-seas_2019_12_20_07_29_29_deck-09.jpg', 'harmony-of-the-seas_2019_12_20_07_29_29_deck-10.jpg', 'harmony-of-the-seas_2019_12_20_07_29_29_deck-11.jpg', 'harmony-of-the-seas_2019_12_20_07_29_29_deck-12.jpg', 'harmony-of-the-seas_2019_12_20_07_29_29_deck-14.jpg', 'harmony-of-the-seas_2019_12_20_07_29_29_deck-15.jpg', 'harmony-of-the-seas_2019_12_20_07_29_29_deck-16.jpg', 'harmony-of-the-seas_2019_12_20_07_29_29_deck-17.jpg', 'harmony-of-the-seas_2019_12_20_07_29_29_deck-18.jpg'],
    video: 'https://www.youtube.com/embed/VBeL3hw4USo'
  },

  'quantum-of-the-seas': {
    name: 'Quantum Of The Seas', company: 'Royal Caribbean',
    photos: [BASE + 'quantum-of-the-seas_2019_12_20_07_31_04_1.jpg', BASE + 'quantum-of-the-seas_2019_12_20_07_31_04_2.jpg', BASE + 'quantum-of-the-seas_2019_12_20_07_31_04_3.jpg', BASE + 'quantum-of-the-seas_2019_12_20_07_31_04_4.jpg'],
    description: [
      'Denizlerin Kuantum\'u, Royal Caribbean International\'ın sahip olduğu Kuantum sınıfı bir yolcu gemisi ve sınıfının baş gemisi. Kuantum sınıfı, MSC Cruises\'in Meraviglia sınıfı ile Royal Caribbean International\'ın Oasis sınıfının arkasındaki üçüncü büyük yolcu gemisi sınıfıdır.',
      'Uzunluk: 347 Metre',
      'Tonaj: 168,666',
      'Kapasite: 4.180',
      'Mürettebat: 1500',
      'Hız: 22 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'quantum-of-the-seas_2019_12_10_08_27_20_iç kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'quantum-of-the-seas_2019_12_10_08_27_20_dış abin.jpg' },
      { label: 'Kabin 3', image: BASE + 'quantum-of-the-seas_2019_12_10_08_27_20_balkonlu dış.jpg' }
    ],
    decks: ['quantum-of-the-seas_2019_12_20_07_31_30_deck-03.jpg', 'quantum-of-the-seas_2019_12_20_07_31_30_deck-04.jpg', 'quantum-of-the-seas_2019_12_20_07_31_30_deck-05.jpg', 'quantum-of-the-seas_2019_12_20_07_31_30_deck-06.jpg', 'quantum-of-the-seas_2019_12_20_07_31_30_deck-07.jpg', 'quantum-of-the-seas_2019_12_20_07_31_30_deck-08.jpg', 'quantum-of-the-seas_2019_12_20_07_31_30_deck-09.jpg', 'quantum-of-the-seas_2019_12_20_07_31_30_deck-10.jpg', 'quantum-of-the-seas_2019_12_20_07_31_30_deck-11.jpg', 'quantum-of-the-seas_2019_12_20_07_31_30_deck-12.jpg', 'quantum-of-the-seas_2019_12_20_07_31_30_deck-13.jpg', 'quantum-of-the-seas_2019_12_20_07_31_30_deck-14.jpg', 'quantum-of-the-seas_2019_12_20_07_31_30_deck-15.jpg', 'quantum-of-the-seas_2019_12_20_07_31_30_deck-16.jpg'],
    video: 'https://www.youtube.com/embed/ZgxcavU5YKg'
  },

  'symphony-of-the-seas': {
    name: 'Symphony Of The Seas', company: 'Royal Caribbean',
    photos: [BASE + 'symphony-of-the-seas_2019_12_20_07_37_49_1.jpg', BASE + 'symphony-of-the-seas_2019_12_20_07_37_49_2.jpg'],
    description: [
      'Symphony Of The Seas, Royal Caribbean yeni katılan gemilerinden bir tanesi. 15 katlı gemide yolcu kapasitesi 5.497 kişi olup Amerika ağırlıklı personel uyruğu dışında Türk personel de bulunmaktadır.',
      'Symphony Of The Seas içindeki özellikleri, cadde görünümlü alışveriş merkezleri, 5 havuz ve su parkı, dev jakuzi, cilt bakımı, yoga, spor salonları, solaryum, kütüphane, kumarhane, iki sörf simülatörü, iki ayrı kaya tırmanma duvarı, buz pateni pisti, mini golf sahası, tam boy basketbol sahası, dünyaca ünlü mutfaklardan yemek seçenekleri, bar, jazz club, karaoke bar, komedi klübü ve gece klübü, konser salonu, tiyatro salonu, 4D sinema salonu, gümrüksüz alışveriş yapabileceğiniz yüzlerce mağaza bulunmaktadır.',
      'Uzunluk: 362 Metre',
      'Tonaj: 228.000',
      'Kapasite: 6.680',
      'Mürettebat: 2.300'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'symphony-of-the-seas_2019_12_13_04_55_58_iç kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'symphony-of-the-seas_2019_12_13_04_55_58_dış kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'symphony-of-the-seas_2019_12_13_04_55_58_balkonlu dış.jpg' },
      { label: 'Kabin 4', image: BASE + 'symphony-of-the-seas_2019_12_13_04_55_58_suit.jpg' }
    ],
    decks: ['symphony-of-the-seas_2019_12_20_07_38_29_deck-03.jpg', 'symphony-of-the-seas_2019_12_20_07_38_29_deck-04.jpg', 'symphony-of-the-seas_2019_12_20_07_38_29_deck-05.jpg', 'symphony-of-the-seas_2019_12_20_07_38_29_deck-06.jpg', 'symphony-of-the-seas_2019_12_20_07_38_29_deck-07.jpg', 'symphony-of-the-seas_2019_12_20_07_38_29_deck-08.jpg', 'symphony-of-the-seas_2019_12_20_07_38_29_deck-09.jpg', 'symphony-of-the-seas_2019_12_20_07_38_29_deck-10.jpg', 'symphony-of-the-seas_2019_12_20_07_38_29_deck-11.jpg', 'symphony-of-the-seas_2019_12_20_07_38_29_deck-12.jpg', 'symphony-of-the-seas_2019_12_20_07_38_29_deck-14.jpg', 'symphony-of-the-seas_2019_12_20_07_38_29_deck-15.jpg', 'symphony-of-the-seas_2019_12_20_07_38_29_deck-16.jpg', 'symphony-of-the-seas_2019_12_20_07_38_29_deck-17.jpg', 'symphony-of-the-seas_2019_12_20_07_38_29_deck-18.jpg'],
    video: 'https://www.youtube.com/embed/qssvMeGbEPU'
  },

  'voyager-of-the-seas': {
    name: 'Voyager Of The Seas', company: 'Royal Caribbean',
    photos: [BASE + 'voyager-of-the-seas_2019_12_20_07_39_42_1.jpg', BASE + 'voyager-of-the-seas_2019_12_20_07_39_42_2.jpg', BASE + 'voyager-of-the-seas_2019_12_20_07_39_42_3.jpg', BASE + 'voyager-of-the-seas_2019_12_20_07_39_42_4.jpg'],
    description: [
      'Voyager Of The Seas, Royal Caribbean Cruises filosuna ait 14 katlı bir gemidir. 1.181 görevlisi ve yolcu kapasitesi 3.114 kişi olup Amerika ağırlıklı personel uyruğu dışında Türk personel de bulunmaktadır.',
      'Voyager Of The Seas içindeki özellikleri, cadde görünümlü alışveriş merkezleri, 3 havuz ve su parkı, 6 dev jakuzi, cilt bakımı, yoga, spor salonları, solaryum, kütüphane, kumarhane, iki sörf simülatörü, 43 metre yüksekliğinde iki ayrı kaya tırmanma duvarı, buz pateni pisti, mini golf sahası, tam boy basketbol sahası, dünyaca ünlü mutfaklardan yemek seçenekleri, bar, jazz club, karaoke bar, komedi klübü ve gece klübü, konser salonu, tiyatro salonu, 4D sinema salonu, gümrüksüz alışveriş yapabileceğiniz yüzlerce mağaza bulunmaktadır.',
      'Uzunluk: 311 Metre',
      'Tonaj: 138.194',
      'Kapasite: 3.138',
      'Mürettebat: 1.176',
      'Hız: 24 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'voyager-of-the-seas_2019_12_13_06_57_45_iç kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'voyager-of-the-seas_2019_12_13_06_57_45_Dış Kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'voyager-of-the-seas_2019_12_13_06_57_45_Balkonlu Dış Kabin.jpg' },
      { label: 'Kabin 4', image: BASE + 'voyager-of-the-seas_2019_12_13_06_57_45_Suit.jpg' }
    ],
    decks: ['voyager-of-the-seas_2019_12_20_07_40_06_deck-02.jpg', 'voyager-of-the-seas_2019_12_20_07_40_06_deck-03.jpg', 'voyager-of-the-seas_2019_12_20_07_40_06_deck-04.jpg', 'voyager-of-the-seas_2019_12_20_07_40_06_deck-05.jpg', 'voyager-of-the-seas_2019_12_20_07_40_06_deck-06.jpg', 'voyager-of-the-seas_2019_12_20_07_40_06_deck-07.jpg', 'voyager-of-the-seas_2019_12_20_07_40_06_deck-08.jpg', 'voyager-of-the-seas_2019_12_20_07_40_06_deck-09.jpg', 'voyager-of-the-seas_2019_12_20_07_40_06_deck-10.jpg', 'voyager-of-the-seas_2019_12_20_07_40_06_deck-11.jpg', 'voyager-of-the-seas_2019_12_20_07_40_06_deck-12.jpg'],
    video: 'https://www.youtube.com/embed/_tlbSaVTZnI'
  },

  'brilliance-of-the-seas': {
    name: 'Brilliance Of The Seas', company: 'Royal Caribbean',
    photos: [BASE + 'brilliance-of-the-seas_2019_12_20_07_46_30_1.jpg', BASE + 'brilliance-of-the-seas_2019_12_20_07_46_30_2.jpg', BASE + 'brilliance-of-the-seas_2019_12_20_07_46_30_3.jpg', BASE + 'brilliance-of-the-seas_2019_12_20_07_46_30_4.jpg', BASE + 'brilliance-of-the-seas_2019_12_20_07_46_30_5.jpg', BASE + 'brilliance-of-the-seas_2019_12_20_07_46_30_6.jpg'],
    description: [
      'Denizlerin Parlaklığı, Royal Caribbean\'s Radiance sınıfına ait bir yolcu gemisidir.',
      'Uzunluk: 292 Metre',
      'Tonaj: 90.090 GT',
      'Kapasite: 2.501',
      'Hız: 25 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'brilliance-of-the-seas_2019_12_14_12_55_23_Brilliance Of The Seas İç kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'brilliance-of-the-seas_2019_12_14_12_55_23_Brilliance Of The Seas Dış Kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'brilliance-of-the-seas_2019_12_14_12_55_23_Brilliance Of The Seas Balkonlu Kabin.jpg' },
      { label: 'Kabin 4', image: BASE + 'brilliance-of-the-seas_2019_12_14_12_55_23_Brilliance Of The Seas Suite Kabin.jpg' }
    ],
    decks: ['brilliance-of-the-seas_2019_12_20_07_47_04_deck-02.png', 'brilliance-of-the-seas_2019_12_20_07_47_04_deck-03.png', 'brilliance-of-the-seas_2019_12_20_07_47_04_deck-04.png', 'brilliance-of-the-seas_2019_12_20_07_47_04_deck-05.png', 'brilliance-of-the-seas_2019_12_20_07_47_04_deck-06.png', 'brilliance-of-the-seas_2019_12_20_07_47_04_deck-07.png', 'brilliance-of-the-seas_2019_12_20_07_47_04_deck-08.png', 'brilliance-of-the-seas_2019_12_20_07_47_04_deck-09.png', 'brilliance-of-the-seas_2019_12_20_07_47_04_deck-10.png', 'brilliance-of-the-seas_2019_12_20_07_47_04_deck-11.png', 'brilliance-of-the-seas_2019_12_20_07_47_04_deck-12.png', 'brilliance-of-the-seas_2019_12_20_07_47_04_deck-13.png'],
    video: 'https://www.youtube.com/embed/MtXHVhmU2ng'
  },

  'explorer-of-the-seas': {
    name: 'Explorer Of The Seas', company: 'Royal Caribbean',
    photos: [BASE + 'explorer-of-the-seas_2019_12_20_07_44_24_1.jpg', BASE + 'explorer-of-the-seas_2019_12_20_07_44_24_2.jpg', BASE + 'explorer-of-the-seas_2019_12_20_07_44_24_3.jpg', BASE + 'explorer-of-the-seas_2019_12_20_07_44_24_4.jpg', BASE + 'explorer-of-the-seas_2019_12_20_07_44_24_5.jpg', BASE + 'explorer-of-the-seas_2019_12_20_07_44_24_6.jpg'],
    description: [
      'Explorer Of The Seas, Royal Caribbean Cruises filosuna ait 14 katlı bir gemidir. 1.181 görevlisi ve yolcu kapasitesi 3.114 kişi olup Amerika ağırlıklı personel uyruğu dışında Türk personel de bulunmaktadır.',
      'Explorer Of The Seas içindeki özellikleri, cadde görünümlü alışveriş merkezleri, 3 havuz ve su parkı, 6 dev jakuzi, cilt bakımı, yoga, spor salonları, solaryum, kütüphane, kumarhane, iki ayrı kaya tırmanma duvarı, buz pateni pisti, mini golf sahası, tam boy basketbol sahası, dünyaca ünlü mutfaklardan yemek seçenekleri, bar, jazz club, karaoke bar, komedi klübü ve gece klübü, konser salonu, tiyatro salonu, 4D sinema salonu, gümrüksüz alışveriş yapabileceğiniz yüzlerce mağaza bulunmaktadır.',
      'Uzunluk: 311 Metre',
      'Tonaj: 138,194 GT',
      'Kapasite: 3,114',
      'Mürettebat: 1,180',
      'Hız: 24 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'explorer-of-the-seas_2019_12_14_14_05_24_iç kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'explorer-of-the-seas_2019_12_14_14_05_24_Dış Kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'explorer-of-the-seas_2019_12_14_14_05_24_Explorer Of The Seas Balkonlu Kabin.jpg' },
      { label: 'Kabin 4', image: BASE + 'explorer-of-the-seas_2019_12_14_14_05_24_explorer-of-the-seas-suit.jpg' }
    ],
    decks: ['explorer-of-the-seas_2019_12_20_07_45_06_deck-02.jpg', 'explorer-of-the-seas_2019_12_20_07_45_06_deck-03.jpg', 'explorer-of-the-seas_2019_12_20_07_45_06_deck-04.jpg', 'explorer-of-the-seas_2019_12_20_07_45_06_deck-05.jpg', 'explorer-of-the-seas_2019_12_20_07_45_06_deck-06.jpg', 'explorer-of-the-seas_2019_12_20_07_45_06_deck-07.jpg', 'explorer-of-the-seas_2019_12_20_07_45_06_deck-08.jpg', 'explorer-of-the-seas_2019_12_20_07_45_06_deck-09.jpg', 'explorer-of-the-seas_2019_12_20_07_45_06_deck-10.jpg', 'explorer-of-the-seas_2019_12_20_07_45_06_deck-11.jpg', 'explorer-of-the-seas_2019_12_20_07_45_06_deck-12.jpg', 'explorer-of-the-seas_2019_12_20_07_45_06_deck-13.jpg', 'explorer-of-the-seas_2019_12_20_07_45_06_deck-14.jpg', 'explorer-of-the-seas_2019_12_20_07_45_06_deck-15.jpg'],
    video: 'https://www.youtube.com/embed/iw2LXKMpazk'
  },

  'rhapsody-of-the-seas': {
    name: 'Rhapsody Of The Seas', company: 'Royal Caribbean',
    photos: [BASE + 'rhapsody-of-the-seas_2019_12_20_07_49_33_1.jpg', BASE + 'rhapsody-of-the-seas_2019_12_20_07_49_33_2.jpg', BASE + 'rhapsody-of-the-seas_2019_12_20_07_49_33_3.jpg', BASE + 'rhapsody-of-the-seas_2019_12_20_07_49_33_4.jpg', BASE + 'rhapsody-of-the-seas_2019_12_20_07_49_33_5.jpg', BASE + 'rhapsody-of-the-seas_2019_12_20_07_49_33_6.jpg', BASE + 'rhapsody-of-the-seas_2019_12_20_07_49_33_7.jpg', BASE + 'rhapsody-of-the-seas_2019_12_20_07_49_33_8.jpg'],
    description: [
      'Seas of Rhapsody, Royal Caribbean International tarafından işletilen Vision sınıfı bir yolcu gemisidir.',
      'Uzunluk: 297 Metre',
      'Tonaj: 78,878 GT',
      'Kapasite: 1,998',
      'Mürettebat: 765',
      'Hız: 22 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'rhapsody-of-the-seas_2019_12_14_14_13_27_Rhapsody Of The Seas İç Kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'rhapsody-of-the-seas_2019_12_14_14_13_27_Rhapsody Of The Seas Dış Kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'rhapsody-of-the-seas_2019_12_14_14_13_27_Rhapsody Of The Seas Balkonlu Kabin.jpg' },
      { label: 'Kabin 4', image: BASE + 'rhapsody-of-the-seas_2019_12_14_14_13_27_Rhapsody Of The Seas Suite Kabin.jpg' }
    ],
    decks: ['rhapsody-of-the-seas_2019_12_20_07_50_05_deck-02.jpg', 'rhapsody-of-the-seas_2019_12_20_07_50_05_deck-03.jpg', 'rhapsody-of-the-seas_2019_12_20_07_50_05_deck-04.jpg', 'rhapsody-of-the-seas_2019_12_20_07_50_05_deck-05.jpg', 'rhapsody-of-the-seas_2019_12_20_07_50_05_deck-06.jpg', 'rhapsody-of-the-seas_2019_12_20_07_50_05_deck-07.jpg', 'rhapsody-of-the-seas_2019_12_20_07_50_05_deck-08.jpg', 'rhapsody-of-the-seas_2019_12_20_07_50_05_deck-09.jpg', 'rhapsody-of-the-seas_2019_12_20_07_50_05_deck-10.jpg', 'rhapsody-of-the-seas_2019_12_20_07_50_05_deck-11.jpg', 'rhapsody-of-the-seas_2019_12_20_07_50_05_deck-12.jpg'],
    video: 'https://www.youtube.com/embed/4-u6c5iNIcY'
  },

  'radiance-of-the-seas': {
    name: 'Radiance Of The Seas', company: 'Royal Caribbean',
    photos: [BASE + 'radiance-of-the-seas_2019_12_20_07_50_40_1.jpeg', BASE + 'radiance-of-the-seas_2019_12_20_07_50_40_2.jpg', BASE + 'radiance-of-the-seas_2019_12_20_07_50_40_3.jpeg', BASE + 'radiance-of-the-seas_2019_12_20_07_50_40_4.jpg'],
    description: [
      'Radiance of the Seas, filomuzdaki en iyi panoramik manzaraya sahip gemilerden biridir. 3 havuz, bir Kaya Tırmanışı Duvarı, mini golf sahası, koşu parkuru ve daha fazlası ile eğlenceli vakit geçireceksiniz. Basamaklı şelaleler, yetişkinlere özel solaryum, Broadway tarzı şovlar, Casino Royal ve heyecan verici mekanlar sizi cezbedecek.',
      'Uzunluk: 293 Metre',
      'Tonaj: 90.090 GT',
      'Kapasite: 2.501',
      'Mürettebat: 848',
      'Hız: 25 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'radiance-of-the-seas_2019_12_18_07_57_54_Radiance Of The Seas İç Kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'radiance-of-the-seas_2019_12_18_07_57_54_Radiance Of The Seas Dış Kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'radiance-of-the-seas_2019_12_18_07_57_54_Radiance Of The Seas Balkonlu Kabin.jpg' },
      { label: 'Kabin 4', image: BASE + 'radiance-of-the-seas_2019_12_18_07_57_54_suit.jpg' }
    ],
    decks: ['radiance-of-the-seas_2019_12_20_07_52_06_deck-02.jpg', 'radiance-of-the-seas_2019_12_20_07_52_06_deck-03.jpg', 'radiance-of-the-seas_2019_12_20_07_52_06_deck-04.jpg', 'radiance-of-the-seas_2019_12_20_07_52_06_deck-05.jpg', 'radiance-of-the-seas_2019_12_20_07_52_06_deck-06.jpg', 'radiance-of-the-seas_2019_12_20_07_52_06_deck-07.jpg', 'radiance-of-the-seas_2019_12_20_07_52_06_deck-08.jpg', 'radiance-of-the-seas_2019_12_20_07_52_06_deck-09.jpg', 'radiance-of-the-seas_2019_12_20_07_52_06_deck-10.jpg', 'radiance-of-the-seas_2019_12_20_07_52_06_deck-11.jpg', 'radiance-of-the-seas_2019_12_20_07_52_06_deck-12.jpg', 'radiance-of-the-seas_2019_12_20_07_52_06_deck-13.jpg'],
    video: 'https://www.youtube.com/embed/OLOjdahvgds'
  },


  /* ===================== CELEBRITY CRUISES ===================== */

  'celebrity-reflection': {
    name: 'Celebrity Reflection', company: 'Celebrity Cruises',
    photos: [BASE + 'celebirty-reflection_2019_12_20_09_10_13_1.jpg', BASE + 'celebirty-reflection_2019_12_20_09_10_13_2.jpg', BASE + 'celebirty-reflection_2019_12_20_09_10_13_3.jpg', BASE + 'celebirty-reflection_2019_12_20_09_10_13_4.jpg', BASE + 'celebirty-reflection_2019_12_20_09_10_13_5.jpg', BASE + 'celebirty-reflection_2019_12_20_09_10_13_6.jpg', BASE + 'celebirty-reflection_2019_12_20_09_10_13_7.jpg', BASE + 'celebirty-reflection_2019_12_20_09_10_13_8.jpg', BASE + 'celebirty-reflection_2019_12_20_09_10_13_9.jpg'],
    description: [
      'Celebrity Reflection, Celebrity Cruise şirketinin 14 gemisinden biri olan 2012 yapımı gemisidir. Celebrity Reflection gemisinin maksimum hızı 24 knots'tur. 126000 gros tonaja sahip olup, 1047 feet uzunluğunda olup 121 feet genişliktedir. Toplam 2158 kişi kapasitesine sahiptir. Toplam 10 restoran vardır. 3 adet yüzme havuzu bulunmaktadır. çocuklar için çocuk kulübü ve çocuk havuzu vardır.',
      'Uzunluk: 319 Metre',
      'Tonaj: 125.366',
      'Kapasite: 3.046',
      'Mürettebat: 1.271'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'celebirty-reflection_2019_12_13_11_32_54_İç Kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'celebirty-reflection_2019_12_13_11_33_12_Dış kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'celebirty-reflection_2019_12_13_11_33_12_Balkonlu Dış Kabin.jpg' },
      { label: 'Kabin 4', image: BASE + 'celebirty-reflection_2019_12_13_11_33_12_Suit.jpg' }
    ],
    decks: ['celebirty-reflection_2019_12_20_09_10_48_deck-03.jpg', 'celebirty-reflection_2019_12_20_09_10_48_deck-04.jpg', 'celebirty-reflection_2019_12_20_09_10_48_deck-05.jpg', 'celebirty-reflection_2019_12_20_09_10_48_deck-06.jpg', 'celebirty-reflection_2019_12_20_09_10_48_deck-07.jpg', 'celebirty-reflection_2019_12_20_09_10_48_deck-08.jpg', 'celebirty-reflection_2019_12_20_09_10_48_deck-09.jpg', 'celebirty-reflection_2019_12_20_09_10_48_deck-10.jpg', 'celebirty-reflection_2019_12_20_09_10_48_deck-11.jpg', 'celebirty-reflection_2019_12_20_09_10_48_deck-12.jpg', 'celebirty-reflection_2019_12_20_09_10_48_deck-15.jpg', 'celebirty-reflection_2019_12_20_09_10_48_deck-16.jpg'],
    video: 'https://www.youtube.com/embed/3Ob9v-jfToI'
  },

  'celebrity-apex': {
    name: 'Celebrity Apex', company: 'Celebrity Cruises',
    photos: [BASE + 'celebrity-apex_2019_12_20_09_11_51_1.jpg', BASE + 'celebrity-apex_2019_12_20_09_11_51_3.jpg', BASE + 'celebrity-apex_2019_12_20_09_11_51_4.jpg'],
    description: [
      'Celebrity Apex, Celebrity Cruise şirketinin 15 gemisinden biri olan 2020 yapımı gemisidir. Celebrity Apex gemisinin maksimum hızı 21,8 knots'tur. 12500 gros tonaja sahip olup, 1004 feet uzunluğunda olup 128 feet genişliktedir. Toplam 2910 kişi kapasitesine sahiptir. Toplam 16 restoran vardır.',
      'Uzunluk: 306 m',
      'Yolcu Sayısı: 2910',
      'Tonaj: 129.500',
      'Hız: 21.8 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'celebrity-apex_2019_12_13_13_06_33_celebrity-apex-ic-kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'celebrity-apex_2019_12_13_13_06_33_celebrity-apex-pencereli-kabin-2.jpg' },
      { label: 'Kabin 3', image: BASE + 'celebrity-apex_2019_12_13_13_06_33_celebrity-apex-balkonlu-kabin.jpg' },
      { label: 'Kabin 4', image: BASE + 'celebrity-apex_2019_12_13_13_06_33_celebrity-apex-suit.jpg' }
    ],
    decks: ['celebrity-apex_2019_12_20_09_35_31_deck-02.jpg', 'celebrity-apex_2019_12_20_09_36_56_deck-03.png', 'celebrity-apex_2019_12_20_09_36_57_deck-04.png', 'celebrity-apex_2019_12_20_09_37_34_deck-05.png', 'celebrity-apex_2019_12_20_09_37_34_deck-06.png', 'celebrity-apex_2019_12_20_09_37_34_deck-07.png', 'celebrity-apex_2019_12_20_09_37_35_deck-08.png', 'celebrity-apex_2019_12_20_09_39_08_deck-09.png', 'celebrity-apex_2019_12_20_09_39_09_deck-10.png', 'celebrity-apex_2019_12_20_09_39_31_deck-11.png', 'celebrity-apex_2019_12_20_09_39_31_deck-12.png', 'celebrity-apex_2019_12_20_09_39_52_deck-14.png', 'celebrity-apex_2019_12_20_09_39_53_deck-15.png', 'celebrity-apex_2019_12_20_09_40_06_deck-16.png'],
    video: 'https://www.youtube.com/embed/V1Z5n8MDbS0'
  },

  'celebrity-infinity': {
    name: 'Celebrity Infinity', company: 'Celebrity Cruises',
    photos: [BASE + 'celebrity-infinity_2019_12_20_09_30_59_1.jpg', BASE + 'celebrity-infinity_2019_12_20_09_30_59_2.jpg', BASE + 'celebrity-infinity_2019_12_20_09_30_59_3.jpg', BASE + 'celebrity-infinity_2019_12_20_09_30_59_4.jpg', BASE + 'celebrity-infinity_2019_12_20_09_30_59_5.jpg'],
    description: [
      'Celebrity Infinity, Celebrity Cruise şirketinin 14 gemisinden biri olan 2001 yapımı gemisidir. Celebrity Infinity gemisinin maksimum hızı 24 knots'tur. 90940 gros tonaja sahip olup, 965 feet uzunluğunda olup 105.6 feet genişliktedir. Toplam 2170 kişi kapasitesine sahiptir. Toplam 7 restoran vardır. 3 adet yüzme havuzu bulunmaktadır. çocuklar için çocuk kulübü ve çocuk havuzu vardır.',
      'Uzunluk: 294 Metre',
      'Kapasite: 2,170',
      'Mürettebat: 999',
      'Tonaj: 90,940 GT',
      'Hız: 24 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'celebrity-infinity_2019_12_14_13_04_56_Celebrity Infinity İç Kabin (1).jpg' },
      { label: 'Kabin 2', image: BASE + 'celebrity-infinity_2019_12_14_13_04_56_Celebrity Infinity Dış Kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'celebrity-infinity_2019_12_14_13_04_56_Celebrity Infinity balkonlu.jpg' },
      { label: 'Kabin 4', image: BASE + 'celebrity-infinity_2019_12_14_13_04_56_Celebrity Infinity Suite.jpg' }
    ],
    decks: ['celebrity-infinity_2019_12_20_09_32_15_deck-02.jpg', 'celebrity-infinity_2019_12_20_09_32_15_deck-03.jpg', 'celebrity-infinity_2019_12_20_09_32_15_deck-04.jpg', 'celebrity-infinity_2019_12_20_09_32_15_deck-05.jpg', 'celebrity-infinity_2019_12_20_09_32_15_deck-06.jpg', 'celebrity-infinity_2019_12_20_09_32_15_deck-07.jpg', 'celebrity-infinity_2019_12_20_09_32_15_deck-08.jpg', 'celebrity-infinity_2019_12_20_09_32_15_deck-09.jpg', 'celebrity-infinity_2019_12_20_09_32_15_deck-10.jpg', 'celebrity-infinity_2019_12_20_09_32_15_deck-11.jpg'],
    video: 'https://www.youtube.com/embed/cclK5ZqQZfc'
  },

  'celebrity-millenium': {
    name: 'Celebrity Millenium', company: 'Celebrity Cruises',
    photos: [BASE + 'celebrity-millenium_2019_12_14_13_15_30__i4918446.jpg', BASE + 'celebrity-millenium_2019_12_14_13_15_30__i4918451.jpg', BASE + 'celebrity-millenium_2019_12_14_13_15_30_622-1b9cdc55e4d5c4aab6147a39e0aa24fb.jpg', BASE + 'celebrity-millenium_2019_12_14_13_15_30_622-72f3f33929db9cc324c7c392b65d9590.jpg', BASE + 'celebrity-millenium_2019_12_14_13_15_30_622-6613ecf38058.jpg', BASE + 'celebrity-millenium_2019_12_14_13_15_30_622-large-3871bd64012152bfb53fdf04b401193f.jpg'],
    description: [
      'Celebrity Millennium, Celebrity Cruise şirketinin 14 gemisinden biri olan 2000 yapımı gemisidir. Celebrity Millennium gemisinin maksimum hızı 24 knots'tur. 90940 gros tonaja sahip olup, 965 feet uzunluğunda olup 105.6 feet genişliktedir. Toplam 2158 kişi kapasitesine sahiptir. Toplam 7 restoran vardır. 3 adet yüzme havuzu bulunmaktadır. çocuklar için çocuk kulübü ve çocuk havuzu vardır.',
      'Uzunluk: 294 Metre',
      'Kapasite: 2,138',
      'Mürettebat: 920-999',
      'Tonaj: 90,963 GT'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'celebrity-millenium_2019_12_14_13_16_38_Celebrity Millennium İç Kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'celebrity-millenium_2019_12_14_13_16_38_Celebrity Millennium Dış Kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'celebrity-millenium_2019_12_14_13_16_38_Celebrity Millennium Balkonlu.jpg' },
      { label: 'Kabin 4', image: BASE + 'celebrity-millenium_2019_12_14_13_16_38_Celebrity Millennium Suite.jpg' }
    ],
    decks: ['celebrity-millenium_2019_12_14_13_16_08_deck-02.gif', 'celebrity-millenium_2019_12_14_13_16_08_deck-03.gif', 'celebrity-millenium_2019_12_14_13_16_08_deck-04.gif', 'celebrity-millenium_2019_12_14_13_16_08_deck-05.gif', 'celebrity-millenium_2019_12_14_13_16_08_deck-06.gif', 'celebrity-millenium_2019_12_14_13_16_08_deck-07.gif', 'celebrity-millenium_2019_12_14_13_16_08_deck-08.gif', 'celebrity-millenium_2019_12_14_13_16_08_deck-09.gif', 'celebrity-millenium_2019_12_14_13_16_08_deck-10.gif', 'celebrity-millenium_2019_12_14_13_16_08_deck-11.gif', 'celebrity-millenium_2019_12_14_13_16_08_deck-12.gif'],
    video: 'https://www.youtube.com/embed/AYQ1cntUajQ'
  },

  'celebrity-solstice': {
    name: 'Celebrity Solstice', company: 'Celebrity Cruises',
    photos: [BASE + 'celebrity-solstice_2019_12_20_09_34_10_1.jpg', BASE + 'celebrity-solstice_2019_12_20_09_34_10_2.jpg', BASE + 'celebrity-solstice_2019_12_20_09_34_10_3.jpg', BASE + 'celebrity-solstice_2019_12_20_09_34_10_4.jpg', BASE + 'celebrity-solstice_2019_12_20_09_34_10_5.jpg', BASE + 'celebrity-solstice_2019_12_20_09_34_10_6.jpg'],
    description: [
      'Celebrity Solstice, Celebrity Cruise şirketinin 14 gemisinden biri olan 2008 yapımı gemisidir. Celebrity Solstice gemisinin maksimum hızı 24 knots'tur. 126000 gros tonaja sahip olup, 1047 feet uzunluğunda olup 121 feet genişliktedir. Toplam 2850 kişi kapasitesine sahiptir. Toplam 10 restoran vardır. 3 adet yüzme havuzu bulunmaktadır. çocuklar için çocuk kulübü ve çocuk havuzu vardır.',
      'Uzunluk: 317 Metre',
      'Tonaj: 121,878 GT',
      'Kapasite: 2,852',
      'Mürettebat: 1,250',
      'Hız: 24 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'celebrity-solstice_2019_12_14_13_50_36_Celebrity Solstice İç Kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'celebrity-solstice_2019_12_14_13_50_36_Celebrity Solstice Dış Kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'celebrity-solstice_2019_12_14_13_50_36_Celebrity Solstice Balkonlu.jpg' },
      { label: 'Kabin 4', image: BASE + 'celebrity-solstice_2019_12_14_13_50_36_SUit.jpg' }
    ],
    decks: ['celebrity-solstice_2019_12_14_13_50_06_deck-03.jpg', 'celebrity-solstice_2019_12_14_13_50_06_deck-04.jpg', 'celebrity-solstice_2019_12_14_13_50_06_deck-05.jpg', 'celebrity-solstice_2019_12_14_13_50_06_deck-06.jpg', 'celebrity-solstice_2019_12_14_13_50_06_deck-07.jpg', 'celebrity-solstice_2019_12_14_13_50_06_deck-08.jpg', 'celebrity-solstice_2019_12_14_13_50_06_deck-09.jpg', 'celebrity-solstice_2019_12_14_13_50_06_deck-10.jpg', 'celebrity-solstice_2019_12_14_13_50_06_deck-12.jpg', 'celebrity-solstice_2019_12_14_13_50_06_deck-14.jpg', 'celebrity-solstice_2019_12_14_13_50_06_deck-15.jpg', 'celebrity-solstice_2019_12_14_13_50_06_deck-16.jpg'],
    video: 'https://www.youtube.com/embed/_ALmgiDoGMY'
  },


  /* ===================== HURTIGRUTEN ===================== */

  'ms-nordlys': {
    name: 'MS Nordlys', company: 'Hurtigruten Norway Cruises',
    photos: [BASE + 'ms-nordlys_2019_12_20_09_42_11_1.jpg', BASE + 'ms-nordlys_2019_12_20_09_42_11_2.jpg', BASE + 'ms-nordlys_2019_12_20_09_42_11_3.jpg', BASE + 'ms-nordlys_2019_12_20_09_42_11_4.jpg', BASE + 'ms-nordlys_2019_12_20_09_42_11_5.jpg'],
    description: [
      'MS Nordlys, Hurtigruten tarafından işletilen Norveç'e kayıtlı bir yolcu gemisidir. 1994 yılında Almanya\'nın Stralsund kentinde Volkswerft GmbH tarafından yaptırılmıştır. Hurtigruten\'e yelken açmış iki kız kardeşi Kong Harald ve Richard With vardır. Gemi, Eylül 2011\'de Norveç\'in Ålesund kentinde yelken açtı.',
      'Uzunluk: 122 Metre',
      'Tonaj: 11.204 GT',
      'Kapasite: 622',
      'Mürettebat: 70',
      'Hız: 15 Knot'
    ],
    cabins: [
      { label: 'Kabin 1', image: BASE + 'ms-nordlys_2019_12_14_14_50_51_dış kabin.jpg' },
      { label: 'Kabin 2', image: BASE + 'ms-nordlys_2019_12_14_14_50_51_kabin.jpg' },
      { label: 'Kabin 3', image: BASE + 'ms-nordlys_2019_12_14_14_50_51_kabin2.jpg' },
      { label: 'Kabin 4', image: BASE + 'ms-nordlys_2019_12_14_14_50_51_suit kabin.jpg' }
    ],
    decks: ['ms-nordlys_2019_12_20_09_42_43_deck-02.jpg', 'ms-nordlys_2019_12_20_09_42_43_deck-03.jpg', 'ms-nordlys_2019_12_20_09_42_43_deck-04.jpg', 'ms-nordlys_2019_12_20_09_42_43_deck-05.jpg', 'ms-nordlys_2019_12_20_09_42_43_deck-06.jpg', 'ms-nordlys_2019_12_20_09_42_43_deck-07.jpg'],
    video: 'https://www.youtube.com/embed/Sfn6H7lDbtQ'
  }

};

SHIP_DETAIL_DATA['costa-pasifica'] = SHIP_DETAIL_DATA['costa-pacifica'];
SHIP_DETAIL_DATA['msc-bellisima'] = SHIP_DETAIL_DATA['msc-bellissima'];
SHIP_DETAIL_DATA['celebirty-reflection'] = SHIP_DETAIL_DATA['celebrity-reflection'];

/* ===================== RENDER FUNCTIONS ===================== */

function getShipSlug() {
  return new URLSearchParams(window.location.search).get('ship');
}

function renderHero(ship) {
  const el = document.getElementById('ship-hero');
  if (!el) return;
  const heroImg = ship.photos && ship.photos.length ? ship.photos[0] : '';
  if (heroImg) el.style.backgroundImage = "url('" + heroImg + "')";
  document.getElementById('ship-hero-name').textContent = ship.name;
  document.getElementById('ship-hero-company').textContent = ship.company;
  document.title = ship.name + ' - Siempre Tour';
}

function renderPhotos(ship) {
  const photos = ship.photos || [];
  if (!photos.length) {
    document.getElementById('photos').style.display = 'none';
    return;
  }

  const items = photos.map((src, i) => `
    <div class="carousel-item ${i === 0 ? 'active' : ''}">
      <img src="${src}" class="d-block w-100" alt="${ship.name} - Fotoğraf ${i + 1}">
    </div>
  `).join('');

  const thumbs = photos.map((src, i) => `
    <button type="button" data-bs-target="#shipPhotosCarousel" data-bs-slide-to="${i}"
      class="${i === 0 ? 'active' : ''}" aria-label="Slayt ${i + 1}">
      <img src="${src}" alt="">
    </button>
  `).join('');

  document.getElementById('ship-carousel-items').innerHTML = items;
  document.getElementById('ship-carousel-thumbs').innerHTML = thumbs;
}

function renderInfo(ship) {
  const desc = (ship.description || []).map(p => '<p>' + p + '</p>').join('');
  document.getElementById('ship-description').innerHTML = desc || '<p>Bilgi yakında eklenecektir.</p>';
}

function renderCabins(ship) {
  const cabins = ship.cabins || [];
  if (!cabins.length) {
    document.getElementById('cabins').style.display = 'none';
    return;
  }
  const html = cabins.map(c => `
    <div class="col-lg-3 col-md-6 mb-4" data-cabin-card>
      <div class="ship-company-card">
        <div class="ratio ratio-4x3 overflow-hidden">
          <img loading="lazy" class="hover-zoom" src="${c.image}" alt="${c.label}"
            onerror="this.closest('[data-cabin-card]').remove(); if (!document.querySelector('#ship-cabins-grid [data-cabin-card]')) document.getElementById('cabins').style.display = 'none';">
        </div>
        <div class="ship-company-info">
          <h6 class="mb-0">${c.label}</h6>
        </div>
      </div>
    </div>
  `).join('');
  document.getElementById('ship-cabins-grid').innerHTML = html;
}

function renderDecks(ship) {
  const decks = ship.decks || [];
  if (!decks.length) {
    document.getElementById('decks').style.display = 'none';
    return;
  }

  const opts = decks.map((filename, i) => {
    const label = filename.replace(/.*[Dd]eck[-_ ]?(\d+).*/, 'Güverte $1');
    return `<option value="${filename}" ${i === 0 ? 'selected' : ''}>${label}</option>`;
  }).join('');

  document.getElementById('ship-deck-select').innerHTML = opts;
  document.getElementById('ship-deck-img').src = DECK_BASE_URL + decks[0];

  document.getElementById('ship-deck-select').addEventListener('change', function () {
    document.getElementById('ship-deck-img').src = DECK_BASE_URL + this.value;
  });
}

function renderVideo(ship) {
  if (!ship.video) {
    document.getElementById('video').style.display = 'none';
    return;
  }
  document.getElementById('ship-video-iframe').src = ship.video;
}

function initSectionNav() {
  const navLinks = document.querySelectorAll('.ship-section-nav a');
  const sections = Array.from(document.querySelectorAll('section[id]')).filter(s => s.style.display !== 'none');

  function onScroll() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 140) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target && target.style.display === 'none') {
        e.preventDefault();
      }
    });
  });
}

/* ===================== SHIP BROWSE (company grid / ship grid) ===================== */
/* Bu bölüm yalnızca yeni "Gemilerimiz" listeleme görünümlerini ekler.
   SHIP_DETAIL_DATA içeriği (gemi bilgileri) hiçbir şekilde değiştirilmez. */

// Şirket adı -> images/cruise/ altındaki klasör adı
var SHIP_COMPANY_FOLDER = {
  'Costa Cruises': 'costa',
  'MSC Cruises': 'msc',
  'Royal Caribbean': 'royal-caribbean',
  'Celebrity Cruises': 'celebrity',
  'Hurtigruten Norway Cruises': 'hurtigruten'
};

// Şirket grid'inde tercih edilen sıralama (listede olmayanlar sona eklenir).
var SHIP_COMPANY_ORDER = ['Costa Cruises', 'MSC Cruises', 'Royal Caribbean', 'Celebrity Cruises', 'Hurtigruten Norway Cruises'];

var SHIP_FALLBACK_IMAGE = 'images/cruise/cruise-banner.jpg';

function shipCompanyImage(company) {
  var folder = SHIP_COMPANY_FOLDER[company];
  return folder ? 'images/cruise/companies/' + folder + '.jpg' : SHIP_FALLBACK_IMAGE;
}

function shipCardImage(slug, company) {
  var folder = SHIP_COMPANY_FOLDER[company];
  return folder ? 'images/cruise/ships/' + folder + '/' + slug + '.jpg' : SHIP_FALLBACK_IMAGE;
}

function shipEscape(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Benzersiz gemiler (aynı nesneye işaret eden alias anahtarlarını eler; kanonik slug'ı korur).
function shipEntries() {
  var seen = [];
  var out = [];
  Object.keys(SHIP_DETAIL_DATA).forEach(function (slug) {
    var ship = SHIP_DETAIL_DATA[slug];
    if (!ship || seen.indexOf(ship) !== -1) return;
    seen.push(ship);
    out.push({ slug: slug, ship: ship });
  });
  return out;
}

function shipBrowseCard(href, image, title, fallback) {
  return '<div class="col-lg-4 col-md-6 mb-4">' +
    '<a href="' + href + '" class="ship-company-card d-block text-decoration-none">' +
    '<div class="ratio ratio-16x9 overflow-hidden">' +
    '<img class="hover-zoom" src="' + image + '" alt="' + shipEscape(title) + '" loading="lazy"' +
    ' onerror="this.onerror=null;this.src=\'' + fallback + '\'">' +
    '</div>' +
    '<div class="ship-company-info"><h6 class="mb-0">' + shipEscape(title) + '</h6></div>' +
    '</a></div>';
}

function renderCompanyGrid() {
  var entries = shipEntries();
  var counts = {};
  var order = [];
  entries.forEach(function (e) {
    var c = e.ship.company || 'Diğer';
    if (counts[c] === undefined) { counts[c] = 0; order.push(c); }
    counts[c]++;
  });
  var companies = SHIP_COMPANY_ORDER.filter(function (c) { return counts[c] !== undefined; })
    .concat(order.filter(function (c) { return SHIP_COMPANY_ORDER.indexOf(c) === -1; }));

  var grid = document.getElementById('ship-browse-grid');
  grid.innerHTML = companies.map(function (c) {
    var href = 'template_ship_detail_page.html?company=' + encodeURIComponent(c);
    return shipBrowseCard(href, shipCompanyImage(c), c, SHIP_FALLBACK_IMAGE);
  }).join('');

  document.getElementById('ship-browse-title').textContent = 'Gemilerimiz';
  document.getElementById('ship-browse-subtitle').textContent = 'Anlaşmalı kruvaziyer firmalarımızı inceleyin';
  document.title = 'Gemilerimiz - Siempre Tour';
}

function renderShipGrid(company) {
  var entries = shipEntries().filter(function (e) { return e.ship.company === company; });
  var grid = document.getElementById('ship-browse-grid');
  grid.innerHTML = entries.map(function (e) {
    var href = 'template_ship_detail_page.html?ship=' + encodeURIComponent(e.slug);
    // Yerel kart görseli yoksa geminin kendi fotoğrafına düş (veride mevcut), o da yoksa şirket görseli.
    var fallback = (e.ship.photos && e.ship.photos[0]) ? e.ship.photos[0] : shipCompanyImage(company);
    return shipBrowseCard(href, shipCardImage(e.slug, company), e.ship.name, fallback);
  }).join('');

  document.getElementById('ship-browse-title').textContent = company;
  document.getElementById('ship-browse-subtitle').textContent = entries.length + ' gemi';
  document.title = company + ' - Siempre Tour';
}

// Üstteki sabit/absolute header'ın başlığı örtmemesi için browse bölümüne
// header yüksekliğine oranlı üst boşluk bırak.
function offsetBrowseForHeader() {
  var header = document.querySelector('header.main_header_area') ||
    document.querySelector('header') ||
    document.querySelector('nav.navbar');
  var h = header ? header.offsetHeight : 0;
  var pad = Math.max(h, 90) + 45;          // header'ı net biçimde geç (en az ~135px)
  var b = document.getElementById('ship-browse');
  // .pt-6 'padding-top: 3rem !important' kullandığı için inline'ı da !important ile ez.
  if (b) b.style.setProperty('padding-top', pad + 'px', 'important');
}

function showShipBrowse() {
  ['ship-hero', 'ship-section-nav', 'ship-detail-content'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  var b = document.getElementById('ship-browse');
  if (b) b.style.display = '';
  offsetBrowseForHeader();
  window.addEventListener('resize', offsetBrowseForHeader);
}

function showShipDetail() {
  var b = document.getElementById('ship-browse');
  if (b) b.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('ship');
  const company = params.get('company');
  const ship = slug ? SHIP_DETAIL_DATA[slug] : null;

  // Liste (browse) modu: geçerli bir ?ship= yoksa şirket grid'i ya da şirketin gemi grid'i.
  if (!ship) {
    if (slug) {
      const content = document.getElementById('ship-detail-content');
      if (content) content.innerHTML = '<div class="container py-5 text-center"><p>Gemi bulunamadı.</p></div>';
      return;
    }
    showShipBrowse();
    if (company && shipEntries().some(function (e) { return e.ship.company === company; })) {
      renderShipGrid(company);
    } else {
      renderCompanyGrid();
    }
    return;
  }

  // Detay modu (mevcut davranış — değiştirilmedi).
  showShipDetail();
  renderHero(ship);
  renderPhotos(ship);
  renderInfo(ship);
  renderCabins(ship);
  renderDecks(ship);
  renderVideo(ship);
  initSectionNav();

  const siteNavbar = document.querySelector('nav.navbar');
  const sectionNav = document.getElementById('ship-section-nav');
  const hero = document.getElementById('ship-hero');
  const content = document.getElementById('ship-detail-content');

  function positionNav() {
    const navbarH = siteNavbar ? siteNavbar.offsetHeight : 0;
    const sectionNavH = sectionNav ? sectionNav.offsetHeight : 0;
    if (sectionNav) sectionNav.style.top = navbarH + 'px';
    if (hero) hero.style.paddingBottom = sectionNavH + 'px';
    const offset = navbarH + sectionNavH;
    document.querySelectorAll('section[id]').forEach(s => {
      s.style.scrollMarginTop = offset + 'px';
    });
    if (content) content.style.paddingTop = sectionNavH + 'px';
  }

  positionNav();
  window.addEventListener('resize', positionNav);
});
