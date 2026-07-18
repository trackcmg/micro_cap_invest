/* ============================================================
   portfolio.js — live holdings view with thesis links
   ============================================================ */
(function () {
  'use strict';

  function init() {
    var root = document.getElementById('portfolio-root');
    if (!root) { return; }

    var CMG = window.CMG;
    var state = { data: null, lastModified: null, map: null, fx: null };
    var showEntry = document.body.getAttribute('data-show-entry') === 'true';

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

    function thesisCell(t) {
      if (!t) { return '<span class="no-thesis">—</span>'; }
      return '<a class="thesis-link" href="' + t.url + '">' + CMG.t('common.thesis_arrow') + '</a>';
    }

    function render() {
      var d = state.data;
      var fx = state.fx;
      var esc = CMG.escapeHTML;

      var hs = (d.holdings || []).map(function (h) {
        var rate = fx[h.currency] || 1;
        var cost = (Number(h.shares) || 0) * (Number(h.entryPrice) || 0) * rate;
        return { h: h, cost: cost, thesis: CMG.findThesis(state.map, h.ticker) };
      });

      var total = hs.reduce(function (s, x) { return s + x.cost; }, 0);
      hs.sort(function (a, b) { return b.cost - a.cost; });
      hs.forEach(function (x) { x.weight = total > 0 ? (x.cost / total) * 100 : 0; });

      var top3 = hs.slice(0, 3).reduce(function (s, x) { return s + x.weight; }, 0);
      var markets = {};
      var currencies = {};
      hs.forEach(function (x) {
        var m = x.h.exchange || '—';
        var c = x.h.currency || '—';
        markets[m] = (markets[m] || 0) + x.weight;
        currencies[c] = (currencies[c] || 0) + x.weight;
      });

      var html = '';

      /* stats */
      html += '<div class="stat-grid">';
      html += '<div class="stat"><span class="stat-value">' + hs.length + '</span><span class="stat-label">' + CMG.t('port.stat_positions') + '</span></div>';
      html += '<div class="stat"><span class="stat-value">' + CMG.fmtPct(top3, 0) + '</span><span class="stat-label">' + CMG.t('port.stat_top3') + '</span></div>';
      html += '<div class="stat"><span class="stat-value">' + Object.keys(markets).length + '</span><span class="stat-label">' + CMG.t('port.stat_markets') + '</span></div>';
      html += '</div>';

      /* holdings table */
      html += '<div class="table-scroll"><table class="data-table"><thead><tr>' +
        '<th>' + CMG.t('th.company') + '</th>' +
        '<th>' + CMG.t('th.ticker') + '</th>' +
        '<th>' + CMG.t('th.market') + '</th>' +
        '<th>' + CMG.t('th.ccy') + '</th>' +
        (showEntry ? '<th class="num">' + CMG.t('th.entry') + '</th>' : '') +
        '<th class="num">' + CMG.t('th.weight') + '</th>' +
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
          (showEntry ? '<td class="num">' + CMG.fmtMoney(Number(h.entryPrice), h.currency) + '</td>' : '') +
          '<td class="num"><span class="wcell"><span class="wbar"><i style="width:' + Math.min(100, x.weight).toFixed(1) + '%"></i></span>' + CMG.fmtPct(x.weight, 1) + '</span></td>' +
          '<td>' + thesisCell(x.thesis) + '</td>' +
          '</tr>';
      });
      html += '</tbody></table></div>';

      /* meta row */
      html += '<div class="data-meta">';
      if (state.lastModified) {
        html += '<span>' + CMG.t('port.updated') + ': ' + CMG.fmtDate(state.lastModified) + '</span>';
      }
      html += '</div>';
      html += '<p class="footnote">' + CMG.t('port.weights_note') + '</p>';

      /* allocation */
      function allocCard(title, obj) {
        var entries = Object.keys(obj).map(function (k) { return [k, obj[k]]; })
          .sort(function (a, b) { return b[1] - a[1]; });
        var max = entries.length ? entries[0][1] : 1;
        var rows = entries.map(function (e) {
          return '<div class="alloc-row"><span class="alloc-label">' + esc(e[0]) + '</span>' +
            '<span class="alloc-track"><span class="alloc-fill" style="width:' + ((e[1] / max) * 100).toFixed(1) + '%"></span></span>' +
            '<span class="alloc-val">' + CMG.fmtPct(e[1], 1) + '</span></div>';
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
      Promise.all([CMG.getPortfolio(), CMG.getThesesIndex(), CMG.getFX()])
        .then(function (res) {
          state.data = res[0].data;
          state.lastModified = res[0].lastModified;
          state.map = CMG.buildThesisMap(res[1]);
          state.fx = res[2];
          render();
        })
        .catch(function () { renderError(); });
    }

    document.addEventListener('cmg:lang', function () {
      if (state.data) { render(); }
    });

    load();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
