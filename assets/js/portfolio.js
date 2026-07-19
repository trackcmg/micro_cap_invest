/* ============================================================
   portfolio.js — current holdings with thesis links
   No amounts, no weights, no sizing: composition only.
   ============================================================ */
(function () {
  'use strict';

  function init() {
    var root = document.getElementById('portfolio-root');
    if (!root) { return; }

    var CMG = window.CMG;
    var state = { holdings: null, lastModified: null, map: null };

    function skeleton() {
      var rows = '';
      for (var i = 0; i < 6; i++) {
        rows += '<div class="skel-row"><span class="skel"></span><span class="skel"></span><span class="skel"></span></div>';
      }
      return '<div class="table-scroll" aria-hidden="true">' + rows + '</div>';
    }

    function renderError() {
      root.innerHTML =
        '<div class="error-box"><p>' + CMG.t('port.error') + '</p>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-retry>' + CMG.t('port.retry') + '</button></div>';
      root.querySelector('[data-retry]').addEventListener('click', function () {
        try { sessionStorage.removeItem('cmg-portfolio'); } catch (e) {}
        load();
      });
    }

    function render() {
      var esc = CMG.escapeHTML;

      var hs = state.holdings.map(function (h) {
        return { h: h, thesis: CMG.findThesis(state.map, h.ticker) };
      });

      var markets = {};
      var currencies = {};
      hs.forEach(function (x) {
        var m = x.h.exchange || '—';
        var c = x.h.currency || '—';
        markets[m] = (markets[m] || 0) + 1;
        currencies[c] = (currencies[c] || 0) + 1;
      });

      var html = '';

      /* stats */
      html += '<div class="stat-grid">';
      html += '<div class="stat"><span class="stat-value">' + hs.length + '</span><span class="stat-label">' + CMG.t('port.stat_positions') + '</span></div>';
      html += '<div class="stat"><span class="stat-value">' + Object.keys(markets).length + '</span><span class="stat-label">' + CMG.t('port.stat_markets') + '</span></div>';
      html += '</div>';

      /* holdings table */
      html += '<div class="table-scroll"><table class="data-table"><thead><tr>' +
        '<th>' + CMG.t('th.company') + '</th>' +
        '<th>' + CMG.t('th.ticker') + '</th>' +
        '<th>' + CMG.t('th.market') + '</th>' +
        '<th>' + CMG.t('th.ccy') + '</th>' +
        '<th>' + CMG.t('th.thesis') + '</th>' +
        '</tr></thead><tbody>';

      hs.forEach(function (x) {
        var h = x.h;
        var name = esc(h.name || h.ticker);
        var nameCell = x.thesis
          ? '<a href="' + x.thesis.url + '">' + name + '</a>'
          : name;
        html += '<tr>' +
          '<td class="cell-company">' + nameCell + '</td>' +
          '<td><span class="ticker-chip">' + esc(h.ticker) + '</span></td>' +
          '<td>' + esc(h.exchange || '—') + '</td>' +
          '<td>' + esc(h.currency || '—') + '</td>' +
          '<td>' + (x.thesis
            ? '<a class="thesis-link" href="' + x.thesis.url + '">' + CMG.t('common.thesis_arrow') + '</a>'
            : '<span class="no-thesis">—</span>') + '</td>' +
          '</tr>';
      });
      html += '</tbody></table></div>';

      /* meta + note */
      if (state.lastModified) {
        html += '<div class="data-meta"><span>' + CMG.t('port.updated') + ': ' + CMG.fmtDate(state.lastModified) + '</span></div>';
      }
      html += '<p class="footnote">' + CMG.t('port.note') + '</p>';

      /* allocation by position count */
      function allocCard(title, obj) {
        var entries = Object.keys(obj).map(function (k) { return [k, obj[k]]; })
          .sort(function (a, b) { return b[1] - a[1]; });
        var max = entries.length ? entries[0][1] : 1;
        var rows = entries.map(function (e) {
          return '<div class="alloc-row"><span class="alloc-label">' + esc(e[0]) + '</span>' +
            '<span class="alloc-track"><span class="alloc-fill" style="width:' + ((e[1] / max) * 100).toFixed(0) + '%"></span></span>' +
            '<span class="alloc-val">' + e[1] + '</span></div>';
        }).join('');
        return '<div class="alloc-card"><h3>' + title + '</h3>' + rows + '</div>';
      }
      html += '<div class="alloc-grid">' +
        allocCard(CMG.t('port.alloc_market'), markets) +
        allocCard(CMG.t('port.alloc_ccy'), currencies) +
        '</div>';

      root.innerHTML = html;
    }

    function load() {
      root.innerHTML = skeleton();
      Promise.all([CMG.getPortfolio(), CMG.getThesesIndex()])
        .then(function (res) {
          state.holdings = res[0].data.holdings || [];
          state.lastModified = res[0].lastModified;
          state.map = CMG.buildThesisMap(res[1]);
          render();
        })
        .catch(function () { renderError(); });
    }

    document.addEventListener('cmg:lang', function () {
      if (state.holdings) { render(); }
    });

    load();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
