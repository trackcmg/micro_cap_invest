/* ============================================================
   track-record.js — links each record row to its thesis
   (the table itself is rendered at build time from
    _data/track_record.yml)
   ============================================================ */
(function () {
  'use strict';

  function init() {
    var cells = document.querySelectorAll('[data-thesis-cell]');
    if (!cells.length) { return; }

    var CMG = window.CMG;
    var map = null;

    function fill() {
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
      fill();
    });

    document.addEventListener('cmg:lang', fill);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
