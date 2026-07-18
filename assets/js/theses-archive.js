/* ============================================================
   theses-archive.js — filters for the thesis archive
   ============================================================ */
(function () {
  'use strict';

  function init() {
    var page = document.getElementById('theses-page');
    if (!page) { return; }

    var CMG = window.CMG;
    var selMarket = document.getElementById('f-market');
    var selSector = document.getElementById('f-sector');
    var selStatus = document.getElementById('f-status');
    var resetBtn = document.getElementById('f-reset');
    var countEl = document.getElementById('f-count');
    var noMatch = document.getElementById('arch-nomatch');
    var list = page.querySelector('[data-thesis-list]');
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-ticker]')) : [];

    if (!cards.length) { return; }

    /* Restore filters from URL (?market=&sector=&status=) */
    try {
      var params = new URLSearchParams(location.search);
      ['market', 'sector', 'status'].forEach(function (k) {
        var v = params.get(k);
        var sel = { market: selMarket, sector: selSector, status: selStatus }[k];
        if (v && sel) {
          for (var i = 0; i < sel.options.length; i++) {
            if (sel.options[i].value.toLowerCase() === v.toLowerCase()) { sel.value = sel.options[i].value; break; }
          }
        }
      });
    } catch (e) {}

    function apply() {
      var m = selMarket ? selMarket.value : '';
      var s = selSector ? selSector.value : '';
      var st = selStatus ? selStatus.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var ok =
          (!m || card.getAttribute('data-market') === m) &&
          (!s || card.getAttribute('data-sector') === s) &&
          (!st || card.getAttribute('data-status') === st);
        if (ok) { card.removeAttribute('data-filter-hidden'); }
        else { card.setAttribute('data-filter-hidden', ''); }
        if (ok && !card.hasAttribute('data-lang-hidden')) { visible++; }
      });

      if (countEl) {
        countEl.textContent = visible + ' ' + (CMG.lang() === 'es'
          ? (visible === 1 ? 'tesis' : 'tesis')
          : (visible === 1 ? 'thesis' : 'theses'));
      }
      if (noMatch) { noMatch.hidden = visible !== 0; }

      /* Keep filters shareable via URL without polluting history */
      try {
        var p = new URLSearchParams(location.search);
        ['market', 'sector', 'status'].forEach(function (k) { p.delete(k); });
        if (m) { p.set('market', m); }
        if (s) { p.set('sector', s); }
        if (st) { p.set('status', st); }
        var q = p.toString();
        history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash);
      } catch (e) {}
    }

    [selMarket, selSector, selStatus].forEach(function (sel) {
      if (sel) { sel.addEventListener('change', apply); }
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (selMarket) { selMarket.value = ''; }
        if (selSector) { selSector.value = ''; }
        if (selStatus) { selStatus.value = ''; }
        apply();
      });
    }

    /* Language switch re-runs dedupe, so recount afterwards */
    document.addEventListener('cmg:lang', apply);

    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
