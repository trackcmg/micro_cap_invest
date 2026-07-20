/* ============================================================
   track-record.js — thesis links + live quotes
   The table is rendered at build time from _data/track_record.yml;
   current prices are fetched live from Yahoo Finance through the
   Apps Script URL proxy (same mechanism as the private dashboard).
   ============================================================ */
(function () {
  'use strict';

  var QUOTE_TTL_MIN = 10;          // cache quotes for 10 minutes
  var SYMBOL_TIMEOUT = 15000;

  function init() {
    var cells = document.querySelectorAll('[data-thesis-cell]');
    if (!cells.length) { return; }

    var CMG = window.CMG;
    var map = null;
    var quotes = {};                // symbol → { price, currency }

    /* ── helpers ─────────────────────────────────────────── */

    /* "C$67.50" → 67.5 · "€26.14" → 26.14 · "1,234.5" → 1234.5 */
    function toNumber(s) {
      if (!s) { return null; }
      var m = String(s).replace(/,/g, '').match(/-?\d*\.?\d+/);
      if (!m) { return null; }
      var n = parseFloat(m[0]);
      return isNaN(n) ? null : n;
    }

    var SYMBOLS = { USD: '$', CAD: 'C$', EUR: '€', GBP: '£', AUD: 'A$', CHF: 'CHF ', SEK: 'kr ', NOK: 'kr ' };

    function fmtPrice(price, ccy) {
      var digits = Math.abs(price) < 1 ? 3 : 2;
      var num = price.toFixed(digits);
      if (CMG.lang() === 'es') { num = num.replace('.', ','); }
      var sym = SYMBOLS[ccy];
      return sym ? sym + num : num + ' ' + ccy;
    }

    /* ── live quotes through the proxy ───────────────────── */
    function fetchQuote(symbol) {
      var proxy = document.body.getAttribute('data-price-proxy');
      if (!proxy) { return Promise.reject(new Error('no proxy configured')); }
      var yurl = 'https://query1.finance.yahoo.com/v8/finance/chart/' +
        encodeURIComponent(symbol) + '?range=1d&interval=5m';
      var ctrl = new AbortController();
      var to = setTimeout(function () { ctrl.abort(); }, SYMBOL_TIMEOUT);
      return fetch(proxy + '?url=' + encodeURIComponent(yurl), { signal: ctrl.signal })
        .then(function (r) {
          clearTimeout(to);
          if (!r.ok) { throw new Error('proxy HTTP ' + r.status); }
          return r.json();
        })
        .then(function (d) {
          var res = d && d.chart && d.chart.result && d.chart.result[0];
          if (!res || !res.meta) { throw new Error('unexpected payload'); }
          var m = res.meta;
          var price = m.regularMarketPrice;
          var ccy = m.currency;
          if (!isFinite(price)) { throw new Error('no price'); }
          /* London quotes come in pence — same conversion the dashboard does */
          if (['GBp', 'GBX', 'GBx'].indexOf(ccy) !== -1) { price /= 100; ccy = 'GBP'; }
          return { price: price, currency: ccy };
        });
    }

    function loadQuotes() {
      try {
        var raw = sessionStorage.getItem('cmg-quotes');
        if (raw) {
          var o = JSON.parse(raw);
          if (o && (Date.now() - o.t) < QUOTE_TTL_MIN * 60000) {
            quotes = o.v || {};
            return Promise.resolve();
          }
        }
      } catch (e) {}

      var symbols = [];
      document.querySelectorAll('[data-current-cell]').forEach(function (c) {
        var s = c.getAttribute('data-symbol');
        if (s && symbols.indexOf(s) === -1) { symbols.push(s); }
      });

      return Promise.all(symbols.map(function (s) {
        return fetchQuote(s)
          .then(function (q) { quotes[s] = q; })
          .catch(function () { /* leave this one out; row falls back */ });
      })).then(function () {
        try { sessionStorage.setItem('cmg-quotes', JSON.stringify({ t: Date.now(), v: quotes })); } catch (e) {}
      });
    }

    /* ── render ──────────────────────────────────────────── */
    function fillCurrent() {
      var anyLive = false;
      document.querySelectorAll('[data-current-cell]').forEach(function (cell) {
        var symbol = cell.getAttribute('data-symbol');
        var q = symbol ? quotes[symbol] : null;
        var display, currN;

        if (q) {
          display = fmtPrice(q.price, q.currency);
          currN = q.price;
          anyLive = true;
        } else {
          var manual = cell.getAttribute('data-current');   // fallback from YAML
          if (!manual) { cell.innerHTML = '<span class="no-thesis">—</span>'; return; }
          display = manual;
          currN = toNumber(manual);
        }

        var entryN = toNumber(cell.getAttribute('data-entry'));
        if (entryN === null || currN === null || entryN === 0) {
          cell.textContent = display;
          return;
        }
        var pct = ((currN - entryN) / entryN) * 100;
        var cls = pct > 0 ? 'pos' : (pct < 0 ? 'neg' : '');
        var sign = pct > 0 ? '+' : (pct < 0 ? '−' : '');
        var digits = Math.abs(pct) < 10 ? 1 : 0;
        var num = Math.abs(pct).toFixed(digits);
        if (CMG.lang() === 'es') { num = num.replace('.', ','); }
        cell.innerHTML = CMG.escapeHTML(display) +
          ' <span class="delta ' + cls + '">(' + sign + num + '%)</span>';
      });

      var stamp = document.getElementById('quotes-stamp');
      if (stamp) {
        if (anyLive) {
          var t = new Date();
          var hh = String(t.getHours()).padStart(2, '0');
          var mm = String(t.getMinutes()).padStart(2, '0');
          stamp.textContent = CMG.t('tr.quotes') + ' ' + hh + ':' + mm;
          stamp.hidden = false;
        } else {
          stamp.hidden = true;
        }
      }
    }

    function fillTheses() {
      if (!map) { return; }
      document.querySelectorAll('[data-thesis-cell]').forEach(function (cell) {
        var t = CMG.findThesis(map, cell.getAttribute('data-ticker'));
        cell.innerHTML = t
          ? '<a class="thesis-link" href="' + t.url + '">' + CMG.t('common.thesis_arrow') + '</a>'
          : '<span class="no-thesis">—</span>';
      });
      document.querySelectorAll('[data-company-cell]').forEach(function (cell) {
        if (!cell.hasAttribute('data-name')) {
          cell.setAttribute('data-name', cell.textContent.trim());
        }
        var name = CMG.escapeHTML(cell.getAttribute('data-name'));
        var t = CMG.findThesis(map, cell.getAttribute('data-ticker'));
        cell.innerHTML = t ? '<a href="' + t.url + '">' + name + '</a>' : name;
      });
    }

    CMG.getThesesIndex().then(function (index) {
      map = CMG.buildThesisMap(index);
      fillTheses();
    });

    loadQuotes().then(fillCurrent);

    fillCurrent();
    document.addEventListener('cmg:lang', function () { fillTheses(); fillCurrent(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
