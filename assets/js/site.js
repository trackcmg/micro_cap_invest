/* ============================================================
   site.js — theme, i18n, nav, shared UI helpers
   ============================================================ */
(function () {
  'use strict';

  var CMG = window.CMG = window.CMG || {};

  /* ── i18n dictionary ────────────────────────────────────── */
  var I18N = {
    en: {
      'a11y.skip': 'Skip to content',
      'nav.language': 'Language',
      'nav.theses': 'Theses',
      'nav.track': 'Track record',
      'nav.method': 'Methodology',
      'nav.about': 'About',
      'footer.explore': 'Explore',
      'footer.legal': 'Legal',
      'footer.notadvice': 'Not investment advice.',
      'home.eyebrow': 'Independent value investor',
      'home.cta': 'Read the theses',
      'home.latest': 'Latest theses',
      'home.viewall': 'All theses →',
      'arch.none': 'No theses published yet. The first write-ups are on their way.',
      'arch.nomatch': 'No theses match the selected filters.',
      'filters.market_all': 'All markets',
      'filters.sector_all': 'All sectors',
      'filters.status_all': 'Open & closed',
      'filters.open': 'Open',
      'filters.closed': 'Closed',
      'filters.reset': 'Reset',
      'status.open': 'Open',
      'status.closed': 'Closed',
      'th.company': 'Company',
      'th.ticker': 'Ticker',
      'th.market': 'Market',
      'th.sector': 'Sector',
      'th.opened': 'Opened',
      'th.entryprice': 'Entry price',
      'th.sellprice': 'Sell price',
      'th.currentprice': 'Current price',
      'th.thesis': 'Thesis',
      'tr.note': 'Entry prices in local currency at the time of opening. Positions stay on this list regardless of outcome; each links to its thesis once published. Current prices are live from Yahoo Finance and may be delayed.',
      'tr.quotes': 'Quotes updated at',
      'thesis.back': '← All theses',
      'thesis.published': 'Published',
      'thesis.ticker': 'Ticker',
      'thesis.mcap': 'Mkt cap at publication',
      'thesis.status': 'Status',
      'thesis.readfull': 'Read the full write-up on Substack',
      'e404.msg': 'This page doesn’t exist — maybe the thesis moved or the URL changed.',
      'e404.home': 'Back to home',
      'common.thesis_arrow': 'Thesis →'
    },
    es: {
      'a11y.skip': 'Saltar al contenido',
      'nav.language': 'Idioma',
      'nav.theses': 'Tesis',
      'nav.track': 'Track record',
      'nav.method': 'Metodología',
      'nav.about': 'Sobre mí',
      'footer.explore': 'Explorar',
      'footer.legal': 'Aviso legal',
      'footer.notadvice': 'No es una recomendación de inversión.',
      'home.eyebrow': 'Inversor value independiente',
      'home.cta': 'Leer las tesis',
      'home.latest': 'Últimas tesis',
      'home.viewall': 'Todas las tesis →',
      'arch.none': 'Aún no hay tesis publicadas. Los primeros análisis están en camino.',
      'arch.nomatch': 'Ninguna tesis coincide con los filtros seleccionados.',
      'filters.market_all': 'Todos los mercados',
      'filters.sector_all': 'Todos los sectores',
      'filters.status_all': 'Abiertas y cerradas',
      'filters.open': 'Abiertas',
      'filters.closed': 'Cerradas',
      'filters.reset': 'Limpiar',
      'status.open': 'Abierta',
      'status.closed': 'Cerrada',
      'th.company': 'Compañía',
      'th.ticker': 'Ticker',
      'th.market': 'Mercado',
      'th.sector': 'Sector',
      'th.opened': 'Apertura',
      'th.entryprice': 'Precio de entrada',
      'th.sellprice': 'Precio de venta',
      'th.currentprice': 'Precio actual',
      'th.thesis': 'Tesis',
      'tr.note': 'Precios de entrada en divisa local en el momento de la apertura. Las posiciones permanecen en la lista sea cual sea el resultado; cada una enlaza a su tesis cuando se publica. Los precios actuales se descargan en vivo de Yahoo Finance y pueden ir con retraso.',
      'tr.quotes': 'Cotizaciones actualizadas a las',
      'thesis.back': '← Todas las tesis',
      'thesis.published': 'Publicada',
      'thesis.ticker': 'Ticker',
      'thesis.mcap': 'Cap. bursátil al publicar',
      'thesis.status': 'Estado',
      'thesis.readfull': 'Leer el análisis completo en Substack',
      'e404.msg': 'Esta página no existe: puede que la tesis se haya movido o que la URL haya cambiado.',
      'e404.home': 'Volver al inicio',
      'common.thesis_arrow': 'Tesis →'
    }
  };

  CMG.lang = function () {
    return document.documentElement.getAttribute('data-lang') === 'es' ? 'es' : 'en';
  };

  CMG.t = function (key) {
    var l = CMG.lang();
    return (I18N[l] && I18N[l][key]) || I18N.en[key] || key;
  };

  CMG.applyI18n = function (root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = CMG.t(el.getAttribute('data-i18n'));
    });
    root.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
      el.setAttribute('aria-label', CMG.t(el.getAttribute('data-i18n-aria-label')));
    });
  };

  /* Dates: elements carrying data-date="YYYY-MM-DD" get a localized text */
  CMG.localizeDates = function (root) {
    root = root || document;
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat(CMG.lang() === 'es' ? 'es-ES' : 'en-GB',
        { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return; }
    root.querySelectorAll('[data-date]').forEach(function (el) {
      var iso = el.getAttribute('data-date');
      if (!iso) { return; }
      var d = new Date(iso + 'T12:00:00');
      if (!isNaN(d)) { el.textContent = fmt.format(d); }
    });
  };

  /* When a thesis exists in EN and ES, show only the current-language card */
  CMG.dedupeThesisCards = function () {
    document.querySelectorAll('[data-thesis-list]').forEach(function (list) {
      var groups = {};
      list.querySelectorAll('[data-ticker]').forEach(function (card) {
        var key = (card.getAttribute('data-ticker') || '').toUpperCase();
        if (!key) { return; }
        (groups[key] = groups[key] || []).push(card);
      });
      var lang = CMG.lang();
      Object.keys(groups).forEach(function (key) {
        var group = groups[key];
        if (group.length < 2) {
          group.forEach(function (c) { c.removeAttribute('data-lang-hidden'); });
          return;
        }
        var preferred = null;
        group.forEach(function (c) {
          if (!preferred && c.getAttribute('data-lang') === lang) { preferred = c; }
        });
        preferred = preferred || group[0];
        group.forEach(function (c) {
          if (c === preferred) { c.removeAttribute('data-lang-hidden'); }
          else { c.setAttribute('data-lang-hidden', ''); }
        });
      });
    });
  };

  /* URL of this page in another language, if a dedicated version exists
     (declared as <link rel="alternate" hreflang="…"> — theses only). */
  function alternateUrl(l) {
    var alt = document.querySelector('link[rel="alternate"][hreflang="' + l + '"]');
    if (!alt) { return null; }
    var href = alt.getAttribute('href');
    if (!href) { return null; }
    var target;
    try { target = new URL(href, location.href); } catch (e) { return null; }
    var a = target.pathname.replace(/\/+$/, '');
    var b = location.pathname.replace(/\/+$/, '');
    return a === b ? null : target.href;      // null when it is this very page
  }

  CMG.setLang = function (l) {
    if (l !== 'en' && l !== 'es') { return; }
    try { localStorage.setItem('cmg-lang', l); } catch (e) {}

    /* Single-language pages (theses) switch by navigating to their
       counterpart, so the change is total: chrome *and* content. */
    var url = alternateUrl(l);
    if (url) { location.href = url; return; }

    var d = document.documentElement;
    d.setAttribute('data-lang', l);
    d.setAttribute('lang', l);
    CMG.applyI18n();
    CMG.localizeDates();
    CMG.dedupeThesisCards();
    document.dispatchEvent(new CustomEvent('cmg:lang'));
  };

  CMG.setTheme = function (t) {
    var d = document.documentElement;
    if (t === 'dark') { d.setAttribute('data-theme', 'dark'); }
    else { d.removeAttribute('data-theme'); }
    try { localStorage.setItem('cmg-theme', t); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) { meta.setAttribute('content', t === 'dark' ? '#0e1418' : '#f6f4ef'); }
    document.dispatchEvent(new CustomEvent('cmg:theme'));
  };

  /* ── language dropdown ──────────────────────────────────── */
  function initLangMenu() {
    var menu = document.querySelector('[data-lang-menu]');
    if (!menu) { return null; }
    var trigger = menu.querySelector('[data-lang-toggle]');
    var dropdown = menu.querySelector('.lang-dropdown');
    if (!trigger || !dropdown) { return null; }

    function onDocClick(e) { if (!menu.contains(e.target)) { close(); } }
    function onKey(e) {
      if (e.key === 'Escape') { close(); trigger.focus(); }
    }
    function open() {
      dropdown.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onKey);
      var first = dropdown.querySelector('.lang-option');
      if (first) { first.focus(); }
    }
    function close() {
      dropdown.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (dropdown.hidden) { open(); } else { close(); }
    });

    return close;
  }

  /* ── boot ───────────────────────────────────────────────── */
  function init() {
    var closeLangMenu = initLangMenu();

    document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (closeLangMenu) { closeLangMenu(); }
        CMG.setLang(btn.getAttribute('data-set-lang'));
      });
    });

    var themeBtn = document.querySelector('[data-theme-toggle]');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        CMG.setTheme(isDark ? 'light' : 'dark');
      });
    }

    var navBtn = document.querySelector('[data-nav-toggle]');
    var nav = document.getElementById('site-nav');
    if (navBtn && nav) {
      navBtn.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        navBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });

    CMG.applyI18n();
    CMG.localizeDates();
    CMG.dedupeThesisCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
