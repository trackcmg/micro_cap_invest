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
      'nav.theses': 'Theses',
      'nav.portfolio': 'Portfolio',
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
      'home.stat_open': 'Open positions',
      'home.stat_closed': 'Closed positions',
      'home.stat_growth': 'On deployed capital',
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
      'th.ccy': 'Currency',
      'th.weight': 'Weight',
      'th.entry': 'Avg entry',
      'th.thesis': 'Thesis',
      'th.return': 'Return',
      'th.entrydate': 'Entry',
      'th.exitdate': 'Exit',
      'th.pl': 'P&L (EUR)',
      'th.date': 'Date',
      'th.deployed': 'Deployed',
      'th.value': 'Value',
      'port.updated': 'Data updated',
      'port.error': 'Couldn’t load live portfolio data.',
      'port.retry': 'Retry',
      'port.stat_positions': 'Positions',
      'port.stat_top3': 'Top 3 concentration',
      'port.stat_markets': 'Markets',
      'port.alloc_market': 'By market',
      'port.alloc_ccy': 'By currency',
      'port.weights_note': 'Weights computed at average cost, excluding cash. Positions link to their thesis when one exists.',
      'tr.stat_closed': 'Closed positions',
      'tr.stat_win': 'Win rate',
      'tr.stat_avg': 'Avg return',
      'tr.stat_pl': 'Realized P&L',
      'tr.curve_title': 'Portfolio value vs capital deployed',
      'tr.curve_sub': 'Daily snapshots, EUR',
      'tr.series_value': 'Portfolio value',
      'tr.series_deployed': 'Capital deployed',
      'tr.table_view': 'View data as table',
      'tr.note': 'Returns are computed in each position’s local currency and include dividends; they exclude trading costs, taxes and FX effects. Positions marked * were partially closed. Figures are unaudited.',
      'tr.error': 'Couldn’t load track record data.',
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
      'nav.theses': 'Tesis',
      'nav.portfolio': 'Cartera',
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
      'home.stat_open': 'Posiciones abiertas',
      'home.stat_closed': 'Posiciones cerradas',
      'home.stat_growth': 'Sobre capital desplegado',
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
      'th.ccy': 'Divisa',
      'th.weight': 'Peso',
      'th.entry': 'Entrada media',
      'th.thesis': 'Tesis',
      'th.return': 'Retorno',
      'th.entrydate': 'Entrada',
      'th.exitdate': 'Salida',
      'th.pl': 'P&L (EUR)',
      'th.date': 'Fecha',
      'th.deployed': 'Desplegado',
      'th.value': 'Valor',
      'port.updated': 'Datos actualizados',
      'port.error': 'No se han podido cargar los datos de la cartera.',
      'port.retry': 'Reintentar',
      'port.stat_positions': 'Posiciones',
      'port.stat_top3': 'Concentración top 3',
      'port.stat_markets': 'Mercados',
      'port.alloc_market': 'Por mercado',
      'port.alloc_ccy': 'Por divisa',
      'port.weights_note': 'Pesos calculados a coste medio, sin incluir liquidez. Cada posición enlaza a su tesis cuando existe.',
      'tr.stat_closed': 'Posiciones cerradas',
      'tr.stat_win': '% aciertos',
      'tr.stat_avg': 'Retorno medio',
      'tr.stat_pl': 'P&L realizado',
      'tr.curve_title': 'Valor de la cartera vs capital desplegado',
      'tr.curve_sub': 'Snapshots diarios, EUR',
      'tr.series_value': 'Valor cartera',
      'tr.series_deployed': 'Capital desplegado',
      'tr.table_view': 'Ver datos en tabla',
      'tr.note': 'Los retornos se calculan en la divisa local de cada posición e incluyen dividendos; excluyen comisiones, impuestos y efecto divisa. Las posiciones marcadas con * se cerraron parcialmente. Cifras no auditadas.',
      'tr.error': 'No se ha podido cargar el track record.',
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
      if (!iso) return;
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
        if (!key) return;
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

  CMG.setLang = function (l) {
    if (l !== 'en' && l !== 'es') { return; }
    try { localStorage.setItem('cmg-lang', l); } catch (e) {}
    var d = document.documentElement;
    d.setAttribute('data-lang', l);
    if (!d.hasAttribute('data-fixed-lang')) { d.setAttribute('lang', l); }
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

  /* ── boot ───────────────────────────────────────────────── */
  function init() {
    document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () { CMG.setLang(btn.getAttribute('data-set-lang')); });
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
