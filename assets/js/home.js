/* ============================================================
   home.js — live stats strip on the home page
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
      var closedEl = strip.querySelector('[data-stat="closed"]');
      var growthEl = strip.querySelector('[data-stat="growth"]');

      if (openEl) { openEl.textContent = String(raw.open); }
      if (closedEl) { closedEl.textContent = String(raw.closed); }
      if (growthEl) {
        if (raw.growth == null) {
          growthEl.textContent = '—';
        } else {
          growthEl.textContent = CMG.fmtPct(raw.growth, 0, true);
          growthEl.classList.toggle('pos', raw.growth > 0);
          growthEl.classList.toggle('neg', raw.growth < 0);
        }
      }
      strip.hidden = false;
    }

    CMG.getPortfolio().then(function (r) {
      var d = r.data;
      var last = (d.history && d.history.length) ? d.history[d.history.length - 1] : null;
      raw = {
        open: (d.holdings || []).length,
        closed: (d.closedTrades || []).length,
        growth: (last && last.totalInvested > 0)
          ? ((last.totalValue / last.totalInvested) - 1) * 100
          : null
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
