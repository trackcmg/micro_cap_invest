/* ============================================================
   home.js — trims "Latest theses" to 3 visible cards
   ============================================================ */
(function () {
  'use strict';

  function init() {
    var list = document.querySelector('#latest-theses [data-thesis-list]');
    if (!list) { return; }

    /* Show at most 3 visible cards (dedupe may hide some language pairs) */
    function trimLatest() {
      var shown = 0;
      list.querySelectorAll('[data-ticker]').forEach(function (card) {
        if (card.hasAttribute('data-lang-hidden')) { card.removeAttribute('data-filter-hidden'); return; }
        shown++;
        if (shown > 3) { card.setAttribute('data-filter-hidden', ''); }
        else { card.removeAttribute('data-filter-hidden'); }
      });
    }

    trimLatest();
    document.addEventListener('cmg:lang', trimLatest);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
