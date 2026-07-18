/* ============================================================
   track-record.js — closed positions, aggregates, equity curve
   ============================================================ */
(function () {
  'use strict';

  function init() {
    var root = document.getElementById('track-root');
    if (!root) { return; }

    var CMG = window.CMG;
    var state = { data: null, map: null, fx: null, chart: null };
    var showEUR = document.body.getAttribute('data-show-eur') === 'true';

    function cssVar(name) {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    function skeleton() {
      var rows = '';
      for (var i = 0; i < 5; i++) {
        rows += '<div class="skel-row"><span class="skel"></span><span class="skel"></span><span class="skel"></span></div>';
      }
      return '<div class="table-scroll" aria-hidden="true">' + rows + '</div>';
    }

    function renderError() {
      root.innerHTML =
        '<div class="error-box"><p>' + CMG.t('tr.error') + '</p>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-retry>' + CMG.t('port.retry') + '</button></div>';
      root.querySelector('[data-retry]').addEventListener('click', function () {
        try { sessionStorage.removeItem('cmg-portfolio'); } catch (e) {}
        load();
      });
    }

    function retClass(v) { return v > 0 ? 'pos' : (v < 0 ? 'neg' : ''); }

    function render() {
      var d = state.data;
      var esc = CMG.escapeHTML;

      var trades = (d.closedTrades || []).map(function (t) {
        var c = CMG.calcClosed(t);
        c.t = t;
        c.thesis = CMG.findThesis(state.map, t.ticker);
        return c;
      });

      var recentFirst = trades.slice().reverse();
      var wins = trades.filter(function (x) { return x.ret > 0; }).length;
      var avg = trades.length ? trades.reduce(function (s, x) { return s + x.ret; }, 0) / trades.length : 0;
      var plEUR = trades.reduce(function (s, x) {
        return s + x.plNative * ((state.fx && state.fx[x.t.currency]) || 1);
      }, 0);

      var html = '';

      /* aggregates */
      html += '<div class="stat-grid">';
      html += '<div class="stat"><span class="stat-value">' + trades.length + '</span><span class="stat-label">' + CMG.t('tr.stat_closed') + '</span></div>';
      html += '<div class="stat"><span class="stat-value">' + (trades.length ? CMG.fmtPct((wins / trades.length) * 100, 0) : '—') + '</span><span class="stat-label">' + CMG.t('tr.stat_win') + '</span></div>';
      html += '<div class="stat"><span class="stat-value ' + retClass(avg) + '">' + CMG.fmtPct(avg, 1, true) + '</span><span class="stat-label">' + CMG.t('tr.stat_avg') + '</span></div>';
      if (showEUR) {
        html += '<div class="stat"><span class="stat-value ' + retClass(plEUR) + '">' + CMG.fmtEUR(plEUR) + '</span><span class="stat-label">' + CMG.t('tr.stat_pl') + '</span></div>';
      }
      html += '</div>';

      /* equity curve */
      var history = (d.history || []).filter(function (s) { return s && s.date; });
      if (history.length >= 2 && window.Chart) {
        html += '<div class="chart-card">' +
          '<h2>' + CMG.t('tr.curve_title') + '</h2>' +
          '<p class="chart-sub">' + CMG.t('tr.curve_sub') + '</p>' +
          '<div class="chart-wrap"><canvas id="eq-chart" role="img" aria-label="' + CMG.t('tr.curve_title') + '"></canvas></div>' +
          '<details class="table-details"><summary>' + CMG.t('tr.table_view') + '</summary>' +
          '<div class="table-scroll"><table class="data-table"><thead><tr>' +
          '<th>' + CMG.t('th.date') + '</th><th class="num">' + CMG.t('th.deployed') + '</th><th class="num">' + CMG.t('th.value') + '</th>' +
          '</tr></thead><tbody>' +
          history.map(function (s) {
            return '<tr><td>' + CMG.fmtDate(s.date) + '</td>' +
              '<td class="num">' + CMG.fmtEUR(s.totalInvested) + '</td>' +
              '<td class="num">' + CMG.fmtEUR(s.totalValue) + '</td></tr>';
          }).join('') +
          '</tbody></table></div></details></div>';
      }

      /* closed positions table */
      html += '<div class="table-scroll"><table class="data-table"><thead><tr>' +
        '<th>' + CMG.t('th.company') + '</th>' +
        '<th>' + CMG.t('th.ticker') + '</th>' +
        '<th>' + CMG.t('th.ccy') + '</th>' +
        '<th class="num">' + CMG.t('th.entrydate') + '</th>' +
        '<th class="num">' + CMG.t('th.exitdate') + '</th>' +
        '<th class="num">' + CMG.t('th.return') + '</th>' +
        (showEUR ? '<th class="num">' + CMG.t('th.pl') + '</th>' : '') +
        '<th>' + CMG.t('th.thesis') + '</th>' +
        '</tr></thead><tbody>';

      recentFirst.forEach(function (x) {
        var t = x.t;
        var name = esc(t.name || x.displayTicker) + (x.partial ? ' *' : '');
        var nameCell = x.thesis ? '<a href="' + x.thesis.url + '">' + name + '</a>' : name;
        html += '<tr>' +
          '<td class="cell-company">' + nameCell + '</td>' +
          '<td><span class="ticker-chip">' + esc(x.displayTicker) + '</span></td>' +
          '<td>' + esc(t.currency || '—') + '</td>' +
          '<td class="num">' + CMG.fmtDate(t.entryDate) + '</td>' +
          '<td class="num">' + CMG.fmtDate(t.exitDate) + '</td>' +
          '<td class="num ' + retClass(x.ret) + '">' + CMG.fmtPct(x.ret, 1, true) + '</td>' +
          (showEUR ? '<td class="num ' + retClass(x.plNative) + '">' + CMG.fmtEUR(x.plNative * ((state.fx && state.fx[t.currency]) || 1)) + '</td>' : '') +
          '<td>' + (x.thesis ? '<a class="thesis-link" href="' + x.thesis.url + '">' + CMG.t('common.thesis_arrow') + '</a>' : '<span class="no-thesis">—</span>') + '</td>' +
          '</tr>';
      });
      html += '</tbody></table></div>';

      html += '<p class="footnote">' + CMG.t('tr.note') + '</p>';

      root.innerHTML = html;
      drawChart(history);
    }

    /* Small plugin: label each series at its last point */
    var endLabels = {
      id: 'endLabels',
      afterDatasetsDraw: function (chart) {
        var ctx = chart.ctx;
        ctx.save();
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textBaseline = 'middle';
        var used = [];
        chart.data.datasets.forEach(function (ds, i) {
          var meta = chart.getDatasetMeta(i);
          if (!meta.data.length) { return; }
          var pt = meta.data[meta.data.length - 1];
          var y = pt.y;
          used.forEach(function (u) { if (Math.abs(u - y) < 14) { y += (y >= u ? 14 : -14); } });
          used.push(y);
          ctx.fillStyle = ds.borderColor;
          ctx.fillText(ds.label, pt.x + 8, y);
        });
        ctx.restore();
      }
    };

    function drawChart(history) {
      var canvas = document.getElementById('eq-chart');
      if (!canvas || !window.Chart || history.length < 2) { return; }
      if (state.chart) { state.chart.destroy(); state.chart = null; }

      var c1 = cssVar('--chart-1');
      var c2 = cssVar('--chart-2');
      var inkMuted = cssVar('--ink-3');
      var hair = cssVar('--hair');
      var surface = cssVar('--surface');
      var ink = cssVar('--ink');

      var labels = history.map(function (s) { return s.date; });

      state.chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: CMG.t('tr.series_value'),
              data: history.map(function (s) { return s.totalValue; }),
              borderColor: c1, backgroundColor: c1,
              borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, tension: 0.2
            },
            {
              label: CMG.t('tr.series_deployed'),
              data: history.map(function (s) { return s.totalInvested; }),
              borderColor: c2, backgroundColor: c2,
              borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, tension: 0.2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { right: 110 } },
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              position: 'bottom', align: 'start',
              labels: { usePointStyle: true, boxWidth: 7, boxHeight: 7, color: inkMuted, font: { family: 'Inter', size: 11 } }
            },
            tooltip: {
              backgroundColor: surface, titleColor: ink, bodyColor: inkMuted,
              borderColor: hair, borderWidth: 1, cornerRadius: 8, padding: 10,
              titleFont: { family: 'Inter', size: 12 }, bodyFont: { family: 'Inter', size: 12 },
              callbacks: {
                title: function (items) { return items.length ? CMG.fmtDate(items[0].label) : ''; },
                label: function (item) { return ' ' + item.dataset.label + ': ' + CMG.fmtEUR(item.parsed.y); }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              border: { color: hair },
              ticks: {
                color: inkMuted, font: { family: 'Inter', size: 11 },
                maxTicksLimit: 6, maxRotation: 0,
                callback: function (v) { return CMG.fmtDate(this.getLabelForValue(v)); }
              }
            },
            y: {
              grid: { color: hair },
              border: { display: false },
              ticks: {
                color: inkMuted, font: { family: 'Inter', size: 11 }, maxTicksLimit: 6,
                callback: function (v) {
                  return new Intl.NumberFormat(CMG.locale(), { notation: 'compact', style: 'currency', currency: 'EUR' }).format(v);
                }
              }
            }
          }
        },
        plugins: [endLabels]
      });
    }

    function load() {
      root.innerHTML = skeleton();
      Promise.all([CMG.getPortfolio(), CMG.getThesesIndex(), CMG.getFX()])
        .then(function (res) {
          state.data = res[0].data;
          state.map = CMG.buildThesisMap(res[1]);
          state.fx = res[2];
          render();
        })
        .catch(function () { renderError(); });
    }

    document.addEventListener('cmg:lang', function () { if (state.data) { render(); } });
    document.addEventListener('cmg:theme', function () { if (state.data) { render(); } });

    load();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
