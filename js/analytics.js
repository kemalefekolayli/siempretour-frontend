// Google Analytics (GA4) - loads gtag.js and starts page view tracking.
// Included in every public page's <head>. Admin and dashboard pages do not load this file.
(function () {
  var GA_MEASUREMENT_ID = 'G-9093DGPCQ6';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
  document.head.appendChild(script);

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
})();
