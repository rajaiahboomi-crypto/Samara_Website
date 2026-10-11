/*!
 * Samara Assisted Living — Google Ads conversion tracking (Public Website v2.6.5)
 * Google Ads account: Samara Assisted Living (AW-18498277330)
 *
 * Counts these website actions as Google Ads conversions (and Google Analytics events):
 *   1. Phone call click     – any tap on a tel: link (except the AppGeo developer number)
 *   2. WhatsApp click       – any wa.me / api.whatsapp.com link or window.open to WhatsApp
 *   3. Admission enquiry    – #enquiry-form saved successfully (enquiry.html)
 *   4. Visit request        – #visit-form saved successfully (contact.html)
 *                             and the Samara AI chat "book a visit" form saved successfully
 * A form only counts AFTER it has been saved (the green "sent successfully" message),
 * never on a failed attempt.
 */
(function () {
  'use strict';

  var ADS_ID = 'AW-18498277330';
  var GA_ID = 'G-GGV9DS3ZZH';
  var SEND_TO = {
    call:   ADS_ID + '/v3blCOrPhJkdENKf1fRE', // Website - Phone call click
    wa:     ADS_ID + '/1iVlCO3PhJkdENKf1fRE', // Website - WhatsApp click
    enq:    ADS_ID + '/A482CPDPhJkdENKf1fRE', // Website - Admission enquiry form
    visit:  ADS_ID + '/Cs9PCN6LjJkdENKf1fRE'  // Website - Visit request form
  };
  var GA_EVENT = {
    call: 'samara_call_click',
    wa: 'samara_whatsapp_click',
    enq: 'samara_admission_enquiry',
    visit: 'samara_visit_request'
  };
  var DEVELOPER_NUMBER = '9176735577'; // AppGeo footer credit – not a Samara lead

  // ---- Google tag (loads it on pages that do not have it yet, e.g. the home page) ----
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function () { window.dataLayer.push(arguments); };
  }
  var hasTagScript = !!document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
  if (!hasTagScript) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    (document.head || document.documentElement).appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }
  window.gtag('config', ADS_ID);

  // ---- Fire a conversion ----
  var lastFired = {};
  function track(kind, detail) {
    var now = Date.now();
    if (lastFired[kind] && now - lastFired[kind] < 1500) return; // ignore double taps
    lastFired[kind] = now;
    try {
      window.gtag('event', 'conversion', {
        send_to: SEND_TO[kind],
        value: 1.0,
        currency: 'INR',
        transport_type: 'beacon'
      });
      var params = { page_path: location.pathname, transport_type: 'beacon' };
      if (detail) params.link_type = detail;
      window.gtag('event', GA_EVENT[kind], params);
    } catch (e) { /* tracking must never break the website */ }
  }

  function isWhatsAppUrl(url) {
    return /(^|\/\/)(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\b|^whatsapp:/i.test(String(url || ''));
  }

  // ---- 1 & 2: call and WhatsApp link taps (works for links added later by Samara AI too) ----
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/^tel:/i.test(href)) {
      if (href.replace(/\D/g, '').indexOf(DEVELOPER_NUMBER) !== -1) return;
      track('call', a.className || 'tel-link');
    } else if (isWhatsAppUrl(href)) {
      track('wa', a.className || 'whatsapp-link');
    }
  }, true);

  // WhatsApp opened from script (e.g. "Send on WhatsApp" buttons using window.open)
  var nativeOpen = window.open;
  if (typeof nativeOpen === 'function') {
    window.open = function (url) {
      try { if (isWhatsAppUrl(url)) track('wa', 'window-open'); } catch (e) {}
      return nativeOpen.apply(window, arguments);
    };
  }

  // ---- 3 & 4: forms – count only when the success message appears ----
  function isSuccess(el) {
    if (!el || !el.classList) return null;
    if (el.classList.contains('form-status') && el.classList.contains('success')) {
      var form = el.closest('form');
      if (form && form.id === 'enquiry-form') return 'enq';
      if (form && form.id === 'visit-form') return 'visit';
      return null;
    }
    if (el.classList.contains('sai-visit-msg') && el.classList.contains('ok')) return 'visit';
    return null;
  }

  function startObserver() {
    if (!('MutationObserver' in window) || !document.body) return;
    var seen = typeof WeakSet === 'function' ? new WeakSet() : null;
    new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        var target = m.type === 'attributes' ? m.target : null;
        var kind = isSuccess(target);
        if (kind) {
          if (seen && seen.has(target) && target.__samaraTracked === target.textContent) continue;
          if (seen) seen.add(target);
          target.__samaraTracked = target.textContent;
          track(kind, 'form-success');
        } else if (target && target.classList &&
                   (target.classList.contains('form-status') || target.classList.contains('sai-visit-msg'))) {
          target.__samaraTracked = null; // reset so the next successful submission counts again
        }
      }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
})();
