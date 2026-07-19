/* ============================================================
   data.js — portfolio JSON, theses index, formatters
   Portfolio schema (composition only, no amounts):
     { holdings: [ { ticker, name, currency, exchange } ] }
   ============================================================ */
(function () {
  'use strict';

  var CMG = window.CMG = window.CMG || {};

  function fetchJSON(url, timeoutMs) {
    var ctrl = new AbortController();
    var to = setTimeout(function () { ctrl.abort(); }, timeoutMs || 15000);
    return fetch(url, { signal: ctrl.signal }).then(function (res) {
      clearTimeout(to);
      if (!res.ok) { throw new Error('HTTP ' + res.status); }
      var lm = res.headers.get('last-modified');
      return res.json().then(function (j) { return { json: j, lastModified: lm }; });
    }, function (e) { clearTimeout(to); throw e; });
  }

  /* sessionStorage cache so navigating between pages doesn't refetch */
  function cached(key, ttlMinutes, loader) {
    try {
      var raw = sessionStorage.getItem(key);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && (Date.now() - o.t) < ttlMinutes * 60000) { return Promise.resolve(o.v); }
      }
    } catch (e) {}
    return loader().then(function (v) {
      try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v: v })); } catch (e) {}
      return v;
    });
  }

  CMG.getPortfolio = function () {
    var url = document.body.getAttribute('data-portfolio-url');
    if (!url) { return Promise.reject(new Error('portfolio_data_url not configured')); }
    return cached('cmg-portfolio', 10, function () {
      return fetchJSON(url).then(function (r) {
        if (!r.json || !Array.isArray(r.json.holdings)) { throw new Error('unexpected schema'); }
        return { data: r.json, lastModified: r.lastModified };
      });
    });
  };

  CMG.getThesesIndex = function () {
    var url = document.body.getAttribute('data-theses-index');
    if (!url) { return Promise.resolve({ theses: [] }); }
    return cached('cmg-theses-index', 10, function () {
      return fetchJSON(url, 10000).then(function (r) { return r.json || { theses: [] }; });
    }).catch(function () { return { theses: [] }; });
  };

  /* ── ticker → thesis mapping ────────────────────────────── */
  CMG.normalizeTicker = function (s) {
    return String(s == null ? '' : s).toUpperCase().trim().replace(/\*+$/, '').trim();
  };
  CMG.baseTicker = function (s) {
    return CMG.normalizeTicker(s).split('.')[0];
  };

  /* Index theses by exact ticker (+ aliases) and by base symbol */
  CMG.buildThesisMap = function (index) {
    var map = { exact: {}, base: {} };
    ((index && index.theses) || []).forEach(function (t) {
      if (!t || !t.ticker) { return; }
      var keys = [t.ticker].concat(Array.isArray(t.aliases) ? t.aliases : []);
      keys.forEach(function (k) {
        k = CMG.normalizeTicker(k);
        if (!k) { return; }
        (map.exact[k] = map.exact[k] || []).push(t);
      });
      var b = CMG.baseTicker(t.ticker);
      if (b) { (map.base[b] = map.base[b] || []).push(t); }
    });
    return map;
  };

  /* Resolution tiers: exact / alias match, then base symbol ("MPE" ≈ "MPE.L") */
  CMG.findThesis = function (map, ticker) {
    if (!map) { return null; }
    var n = CMG.normalizeTicker(ticker);
    if (!n) { return null; }
    var group = map.exact[n] || map.base[CMG.baseTicker(n)];
    if (!group || !group.length) { return null; }
    var lang = CMG.lang();
    for (var i = 0; i < group.length; i++) {
      if (group[i].lang === lang) { return group[i]; }
    }
    return group[0];
  };

  /* ── formatters ─────────────────────────────────────────── */
  CMG.locale = function () { return CMG.lang() === 'es' ? 'es-ES' : 'en-GB'; };

  CMG.fmtDate = function (iso) {
    if (!iso) { return '—'; }
    var d = new Date(String(iso).length === 10 ? iso + 'T12:00:00' : iso);
    if (isNaN(d)) { return '—'; }
    return new Intl.DateTimeFormat(CMG.locale(), { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
  };

  CMG.escapeHTML = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
})();
