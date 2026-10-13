/*!
 * Samara Assisted Living — mobile Call / WhatsApp bar (Public Website v2.6.6)
 *
 * On phones (up to 768px wide) a bar stays at the bottom of every page with two big buttons:
 *   📞 Call    → tel:+919976735577   (Samara contact number)
 *   WhatsApp   → wa.me/917395961616  (Samara WhatsApp)
 * Most Google Ads visitors arrive on a phone; until now the home page had no Samara call button
 * (the only tel: link was the AppGeo developer credit).
 * Taps are counted as Google Ads conversions by js/samara-ads-tracking.js (it watches all tel: and wa.me links).
 * While the bar is showing, the round WhatsApp button is hidden (the bar replaces it) and the
 * Find Us / Samara AI buttons are lifted above the bar.
 * Follows the site's English / Tamil switch (html lang).
 */
(function () {
  'use strict';

  var PHONE = '+919976735577';
  var WHATSAPP = '917395961616';
  var TEXT = {
    en: { call: 'Call Now', wa: 'WhatsApp', msg: 'Hello Samara, I would like to know about care at Samara Assisted Living, Mogappair.' },
    ta: { call: 'அழைக்க', wa: 'WhatsApp', msg: 'வணக்கம் சமரா, சமரா அசிஸ்டட் லிவிங், முகப்பேர் பராமரிப்பு பற்றி அறிய விரும்புகிறேன்.' }
  };

  function lang() { return /^ta/i.test(document.documentElement.lang || '') ? 'ta' : 'en'; }

  function css() {
    if (document.getElementById('samara-cbar-css')) return;
    var s = document.createElement('style');
    s.id = 'samara-cbar-css';
    s.textContent =
      '.samara-cbar{display:none}' +
      '@media(max-width:768px){' +
        '.samara-cbar{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:60;gap:8px;padding:8px 10px calc(8px + env(safe-area-inset-bottom));' +
          'background:#fff;border-top:1px solid #f0c4de;box-shadow:0 -6px 20px rgba(70,12,45,.14)}' +
        '.samara-cbar a{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;min-height:48px;border-radius:14px;' +
          'font:800 1.05rem/1 "Nunito Sans",system-ui,sans-serif;color:#fff;text-decoration:none}' +
        '.samara-cbar .cbar-call{background:linear-gradient(135deg,#9c0040,#c3025a)}' +
        '.samara-cbar .cbar-wa{background:#25D366}' +
        '.samara-cbar svg{width:22px;height:22px;flex:none}' +
        'html.samara-cbar-on body{padding-bottom:76px}' +
        'html.samara-cbar-on .floating.whatsapp-float,html.samara-cbar-on .floating-whatsapp,' +
        'html.samara-cbar-on a.floating[href*="wa.me"]{display:none!important}' +
        'html.samara-cbar-on .location-findus-float,html.samara-cbar-on .location-qr-float,html.samara-cbar-on .sai-mini,html.samara-cbar-on .sai-teaser,' +
        'html.samara-cbar-on #sai-launch{margin-bottom:68px}' +
      '}';
    (document.head || document.documentElement).appendChild(s);
  }

  var PHONE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>';
  var WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.25-.12-1.47-.73-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06a6.7 6.7 0 0 1-3.3-2.9c-.25-.43.25-.4.71-1.33a.45.45 0 0 0-.02-.43c-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42h-.48a.92.92 0 0 0-.66.31 2.8 2.8 0 0 0-.87 2.07 4.86 4.86 0 0 0 1.02 2.58 11.1 11.1 0 0 0 4.25 3.76c1.58.68 2.2.74 2.99.62.48-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.23-.17-.48-.29z"/></svg>';

  function render(bar) {
    var t = TEXT[lang()];
    bar.innerHTML =
      '<a class="cbar-call" href="tel:' + PHONE + '" aria-label="' + t.call + ' 99767 35577">' + PHONE_ICON + '<span>' + t.call + '</span></a>' +
      '<a class="cbar-wa" href="https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(t.msg) + '" target="_blank" rel="noopener" aria-label="WhatsApp Samara">' + WA_ICON + '<span>' + t.wa + '</span></a>';
  }

  function start() {
    if (document.querySelector('.samara-cbar')) return;
    css();
    var bar = document.createElement('nav');
    bar.className = 'samara-cbar';
    bar.setAttribute('aria-label', 'Contact Samara');
    render(bar);
    document.body.appendChild(bar);
    document.documentElement.classList.add('samara-cbar-on');
    try {
      new MutationObserver(function () { render(bar); })
        .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
