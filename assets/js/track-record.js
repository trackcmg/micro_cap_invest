/* ============================================================
   track-record.js — thesis links + current-price variation
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

    /* "C$67.50" → 67.5 · "€26.14" → 26.14 · "1,234.5p" → 1234.5 */
    function toNumber(s) {
      if (!s) { return null; }
      var m = String(s).replace(/,/g, '').match(/-?\d*\.?\d+/);
      if (!m) { return null; }
      var n = parseFloat(m[0]);
      return isNaN(n) ? null : n;
    }

    /* Current price cell: append the % move vs entry, coloured */
    function fillCurrent() {
      document.querySelectorAll('[data-current-cell]').forEach(function (cell) {
        var current = cell.getAttribute('data-current');
        if (!current) { return; }               // stays "—"
        var entryN = toNumber(cell.getAttribute('data-entry'));
        var currN = toNumber(current);
        if (entryN === null || currN === null || entryN === 0) {
          cell.textContent = current;
          return;
        }
        var pct = ((currN - entryN) / entryN) * 100;
        var cls = pct > 0 ? 'pos' : (pct < 0 ? 'neg' : '');
        var sign = pct > 0 ? '+' : (pct < 0 ? '−' : '');
        var digits = Math.abs(pct) < 10 ? 1 : 0;
        var num = Math.abs(pct).toFixed(digits);
        if (CMG.lang() === 'es') { num = num.replace('.', ','); }
        cell.innerHTML = CMG.escapeHTML(current) +
          ' <span class="delta ' + cls + '">(' + sign + num + '%)</span>';
      });
    }

    function fill() {
      if (map) {
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
      fillCurrent();
    }

    CMG.getThesesIndex().then(function (index) {
      map = CMG.buildThesisMap(index);
      fill();
    });

    fillCurrent();
    document.addEventListener('cmg:lang', fill);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
