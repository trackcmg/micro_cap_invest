/* ============================================================
   home.js — stats strip (composition only, no amounts)
   ============================================================ */
(function () {
  'use strict';

  function init() {
    var strip = document.getElementById('home-stats');
    if (!strip) { return; }

    var CMG = window.CMG;
    var raw = null;

    /* Show at most 3 visible cards in "Latest theses" (dedupe may hide some) */
    function trimLatest() {
      var list = document.querySelector('#latest-theses [data-thesis-list]');
      if (!list) { return; }
      var shown = 0;
      list.querySelectorAll('[data-ticker]').forEach(function (card) {
        if (card.hasAttribute('data-lang-hidden')) { card.removeAttribute('data-filter-hidden'); return; }
        shown++;
        if (shown > 3) { card.setAttribute('data-filter-hidden', ''); }
        else { card.removeAttribute('data-filter-hidden'); }
      });
    }

    function fill() {
      if (!raw) { return; }
      var openEl = strip.querySelector('[data-stat="open"]');
      var marketsEl = strip.querySelector('[data-stat="markets"]');
      var thesesEl = strip.querySelector('[data-stat="theses"]');
      if (openEl) { openEl.textContent = String(raw.open); }
      if (marketsEl) { marketsEl.textContent = String(raw.markets); }
      if (thesesEl) { thesesEl.textContent = String(raw.theses); }
      strip.hidden = false;
    }

    Promise.all([CMG.getPortfolio(), CMG.getThesesIndex()]).then(function (res) {
      var holdings = (res[0].data && res[0].data.holdings) || [];
      var markets = {};
      holdings.forEach(function (h) { if (h.exchange) { markets[h.exchange] = true; } });
      var tickers = {};
      ((res[1] && res[1].theses) || []).forEach(function (t) {
        var k = CMG.normalizeTicker(t.ticker);
        if (k) { tickers[k] = true; }
      });
      raw = {
        open: holdings.length,
        markets: Object.keys(markets).length,
        theses: Object.keys(tickers).length
      };
      fill();
    }).catch(function () { /* strip stays hidden */ });

    trimLatest();
    document.addEventListener('cmg:lang', function () { fill(); trimLatest(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
