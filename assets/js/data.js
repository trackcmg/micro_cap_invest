/* ============================================================
   data.js — portfolio JSON, theses index, FX, formatters
   Consumes the portfolio data schema:
     { holdings[], closedTrades[], history[], cash, totalInvested }
   ============================================================ */
(function () {
  'use strict';

  var CMG = window.CMG = window.CMG || {};

  /* Static FX fallback (X → EUR), used if the live FX API is down */
  var STATIC_FX = { EUR: 1, USD: 0.8696, CAD: 0.6369, GBP: 1.1574 };

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

  /* Live FX (EUR base) with static fallback */
  CMG.getFX = function () {
    return cached('cmg-fx', 60, function () {
      return fetchJSON('https://open.er-api.com/v6/latest/EUR', 8000).then(function (r) {
        var rates = r.json && r.json.rates;
        if (!rates || !rates.USD || !rates.CAD || !rates.GBP) { throw new Error('bad fx payload'); }
        return { EUR: 1, USD: 1 / rates.USD, CAD: 1 / rates.CAD, GBP: 1 / rates.GBP };
      });
    }).catch(function () { return STATIC_FX; });
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

  CMG.fmtPct = function (v, digits, signed) {
    if (v == null || isNaN(v)) { return '—'; }
    var d = (digits == null) ? 1 : digits;
    var s = Math.abs(v).toFixed(d);
    if (CMG.lang() === 'es') { s = s.replace('.', ','); }
    var sign = v < 0 ? '−' : (signed ? '+' : '');
    return sign + s + '%';
  };

  CMG.fmtEUR = function (v, maxFrac) {
    if (v == null || isNaN(v)) { return '—'; }
    return new Intl.NumberFormat(CMG.locale(), {
      style: 'currency', currency: 'EUR', maximumFractionDigits: maxFrac == null ? 0 : maxFrac
    }).format(v);
  };

  CMG.fmtMoney = function (v, ccy) {
    if (v == null || isNaN(v)) { return '—'; }
    try {
      return new Intl.NumberFormat(CMG.locale(), {
        style: 'currency', currency: ccy || 'EUR', maximumFractionDigits: 2
      }).format(v);
    } catch (e) { return v.toFixed(2) + ' ' + ccy; }
  };

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

  /* ── closed trade P&L ──
     grossPL(native) = shares × (sell − buy)
     netPL(native)   = grossPL + dividends
     return%         = netPL / (shares × buy) × 100                */
  CMG.calcClosed = function (t) {
    var shares = Number(t.totalShares) || 0;
    var buy = Number(t.avgBuy) || 0;
    var sell = Number(t.sellPrice) || 0;
    var div = Number(t.dividends) || 0;
    var invested = shares * buy;
    var plNative = shares * (sell - buy) + div;
    return {
      ret: invested > 0 ? (plNative / invested) * 100 : 0,
      plNative: plNative,
      invested: invested,
      partial: /\*\s*$/.test(String(t.ticker || '')),
      displayTicker: CMG.normalizeTicker(t.ticker)
    };
  };
})();
