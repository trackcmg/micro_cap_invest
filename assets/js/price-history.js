/* Animated price histories for thesis cards and articles. The purchase price is
   the author's actual entry; subsequent points are unadjusted daily closes. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var requests = Object.create(null);
  var chartId = 0;

  function isoDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    var time = Date.parse(value + 'T00:00:00Z');
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : null;
  }

  function money(value) {
    var match = /^(C\$|A\$|\$|€|£)\s*(\d+(?:,\d{3})*(?:\.\d+)?)$/.exec(String(value || '').trim());
    if (!match) return null;
    return {
      price: Number(match[2].replace(/,/g, '')),
      currency: { 'C$': 'CAD', 'A$': 'AUD', '$': 'USD', '€': 'EUR', '£': 'GBP' }[match[1]]
    };
  }

  function svgNode(tag, attributes) {
    var node = document.createElementNS(NS, tag);
    Object.keys(attributes || {}).forEach(function (key) { node.setAttribute(key, attributes[key]); });
    return node;
  }

  function history(symbol, opened, sold) {
    var key = symbol + '|' + opened + '|' + (sold || '');
    if (requests[key]) return requests[key];
    var proxy = document.body.getAttribute('data-price-proxy');
    if (!proxy) return Promise.reject(new Error('Price source unavailable'));
    var start = isoDate(opened);
    var saleDate = sold ? isoDate(sold) : null;
    var end = sold ? saleDate + 86400000 : Date.now() + 86400000;
    if (start === null || (sold && saleDate === null) || !Number.isFinite(end) || start >= end) return Promise.reject(new Error('Invalid dates'));
    var query = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(symbol) +
      '?period1=' + Math.floor(start / 1000) + '&period2=' + Math.floor(end / 1000) +
      '&interval=1d&events=div%2Csplits';
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 20000);
    requests[key] = fetch(proxy + '?url=' + encodeURIComponent(query), { signal: controller.signal })
      .then(function (response) { if (!response.ok) throw new Error('History unavailable'); return response.json(); })
      .then(function (data) {
        var result = data && data.chart && data.chart.result && data.chart.result[0];
        if (!result || !result.meta || !Array.isArray(result.timestamp) ||
            !result.indicators || !result.indicators.quote || !result.indicators.quote[0] ||
            !Array.isArray(result.indicators.quote[0].close)) throw new Error('Incomplete price history');
        return result;
      })
      .finally(function () { clearTimeout(timer); });
    return requests[key];
  }

  function series(result, entry, opened, sold, sale) {
    var meta = result.meta;
    var pence = ['GBp', 'GBX', 'GBx'].indexOf(meta.currency) !== -1;
    if ((pence ? 'GBP' : meta.currency) !== entry.currency) throw new Error('Currency mismatch');
    // Yahoo's historical prices can be split adjusted while our purchase price is not.
    if (Object.keys((result.events && result.events.splits) || {}).length) throw new Error('Split needs review');
    var start = isoDate(opened);
    var limit = sold ? isoDate(sold) + 86400000 : Date.now() + 300000;
    var points = [{ time: start, price: entry.price }];
    result.timestamp.forEach(function (stamp, index) {
      var time = stamp * 1000;
      var close = result.indicators.quote[0].close[index];
      if (!Number.isFinite(time) || time <= start || time > limit ||
          typeof close !== 'number' || !Number.isFinite(close) || close <= 0) return;
      points.push({ time: time, price: close / (pence ? 100 : 1) });
    });
    points.sort(function (a, b) { return a.time - b.time; });
    if (sold) {
      if (!sale || sale.currency !== entry.currency || sale.price <= 0) throw new Error('Invalid sale');
      points.push({ time: isoDate(sold) + 86399000, price: sale.price });
    } else {
      var quoteTime = meta.regularMarketTime * 1000;
      var quote = meta.regularMarketPrice / (pence ? 100 : 1);
      if (Number.isFinite(quoteTime) && quoteTime > points[points.length - 1].time &&
          quoteTime <= Date.now() + 300000 && Number.isFinite(quote) && quote > 0) {
        points.push({ time: quoteTime, price: quote });
      }
    }
    if (points.length < 2 || points[points.length - 1].time <= start) throw new Error('No price observations');
    return points;
  }

  function render(chart, points, entry) {
    var full = chart.classList.contains('price-history-full');
    var lang = chart.getAttribute('data-chart-lang') === 'es' ? 'es' : 'en';
    var locale = lang === 'es' ? 'es-ES' : 'en-GB';
    var sold = chart.getAttribute('data-chart-sold');
    var latest = points[points.length - 1];
    var formatMoney = new Intl.NumberFormat(locale, {
      style: 'currency', currency: entry.currency, minimumFractionDigits: 2, maximumFractionDigits: 2
    });
    var formatPct = new Intl.NumberFormat(locale, {
      style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: 'exceptZero'
    });
    var formatDate = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
    var width = full ? 700 : 600;
    var height = full ? 260 : 118;
    var left = 8, right = width - 8, top = 14, bottom = height - 14;
    var low = Math.min.apply(null, points.map(function (point) { return point.price; }));
    var high = Math.max.apply(null, points.map(function (point) { return point.price; }));
    var padding = Math.max((high - low) * 0.14, entry.price * 0.025);
    low = Math.max(0, low - padding);
    high += padding;
    var firstTime = points[0].time;
    var lastTime = latest.time;
    function x(point) { return left + (point.time - firstTime) / (lastTime - firstTime) * (right - left); }
    function y(point) { return bottom - (point.price - low) / (high - low) * (bottom - top); }

    var svg = svgNode('svg', { viewBox: '0 0 ' + width + ' ' + height, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    var clipId = 'price-reveal-' + (++chartId);
    var defs = svgNode('defs');
    var clip = svgNode('clipPath', { id: clipId });
    var reveal = svgNode('rect', { x: 0, y: 0, width: 0, height: height });
    clip.appendChild(reveal);
    defs.appendChild(clip);
    svg.appendChild(defs);
    if (full) [0.25, 0.5, 0.75].forEach(function (part) {
      svg.appendChild(svgNode('line', { x1: left, x2: right, y1: top + part * (bottom - top), y2: top + part * (bottom - top), class: 'price-history-gridline' }));
    });
    var baseline = y({ price: entry.price });
    svg.appendChild(svgNode('line', { x1: left, x2: right, y1: baseline, y2: baseline, class: 'price-history-baseline' }));
    var lineData = points.map(function (point, index) { return (index ? 'L' : 'M') + x(point).toFixed(2) + ' ' + y(point).toFixed(2); }).join(' ');
    var area = svgNode('path', {
      d: lineData + ' L' + right + ' ' + bottom + ' L' + left + ' ' + bottom + ' Z',
      class: 'price-history-area', 'clip-path': 'url(#' + clipId + ')'
    });
    var line = svgNode('path', { d: lineData, class: 'price-history-line', 'clip-path': 'url(#' + clipId + ')' });
    var startDot = svgNode('circle', { cx: left, cy: y(points[0]), r: full ? 4 : 3, class: 'price-history-start' });
    var cursor = svgNode('circle', { cx: left, cy: y(points[0]), r: full ? 6 : 4, class: 'price-history-cursor' });
    svg.appendChild(area);
    svg.appendChild(line);
    svg.appendChild(startDot);
    svg.appendChild(cursor);

    var plot = chart.querySelector('[data-chart-plot]');
    plot.textContent = '';
    plot.appendChild(svg);
    plot.setAttribute('role', 'img');
    plot.setAttribute('aria-label', (lang === 'es' ? 'Cotización desde la compra: ' : 'Share price since purchase: ') +
      formatMoney.format(entry.price) + ' → ' + formatMoney.format(latest.price) +
      ', ' + formatPct.format(latest.price / entry.price - 1) +
      (lang === 'es' ? ', sin dividendos.' : ', excluding dividends.'));

    chart.querySelector('[data-chart-start]').textContent =
      (lang === 'es' ? 'Compra · ' : 'Purchase · ') + formatDate.format(new Date(firstTime)) + ' · ' + formatMoney.format(entry.price);
    var changeNode = chart.querySelector('[data-chart-change]');
    var endNode = chart.querySelector('[data-chart-end]');
    var change = latest.price / entry.price - 1;
    changeNode.classList.toggle('pos', change > 0);
    changeNode.classList.toggle('neg', change < 0);
    changeNode.textContent = formatPct.format(change);
    endNode.textContent = (sold ? (lang === 'es' ? 'Venta' : 'Sale') : (lang === 'es' ? 'Último' : 'Latest')) +
      ' · ' + formatDate.format(new Date(lastTime)) + ' · ' + formatMoney.format(latest.price);

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      reveal.setAttribute('width', width);
      cursor.setAttribute('cx', x(latest));
      cursor.setAttribute('cy', y(latest));
      return;
    }
    var duration = full ? 2400 : 1650;
    var started = null;
    function step(now) {
      if (started === null) started = now;
      var progress = Math.min(1, (now - started) / duration);
      var time = firstTime + progress * (lastTime - firstTime);
      var index = 1;
      while (index < points.length - 1 && points[index].time < time) index++;
      var before = points[index - 1], after = points[index];
      var fraction = Math.max(0, Math.min(1, (time - before.time) / (after.time - before.time)));
      var price = before.price + fraction * (after.price - before.price);
      reveal.setAttribute('width', left + progress * (right - left) + 2);
      cursor.setAttribute('cx', left + progress * (right - left));
      cursor.setAttribute('cy', y({ price: price }));
      if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  function initChart(chart) {
    var entry = money(chart.getAttribute('data-chart-entry'));
    var opened = chart.getAttribute('data-chart-opened');
    var sold = chart.getAttribute('data-chart-sold');
    var sale = sold ? money(chart.getAttribute('data-chart-sale')) : null;
    var lang = chart.getAttribute('data-chart-lang') === 'es' ? 'es' : 'en';
    if (!entry || entry.price <= 0 || isoDate(opened) === null) return fail(chart, lang);
    history(chart.getAttribute('data-chart-symbol'), opened, sold)
      .then(function (result) { render(chart, series(result, entry, opened, sold, sale), entry); })
      .catch(function () { fail(chart, lang); });
  }

  function fail(chart, lang) {
    var plot = chart.querySelector('[data-chart-plot]');
    plot.textContent = lang === 'es' ? 'Histórico no disponible ahora.' : 'Price history unavailable right now.';
    plot.classList.add('price-history-error');
    chart.querySelector('[data-chart-end]').textContent = '—';
  }

  function init() {
    var charts = document.querySelectorAll('[data-price-history]');
    if (!charts.length) return;
    if (!('IntersectionObserver' in window)) {
      charts.forEach(initChart);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        initChart(entry.target);
      });
    }, { rootMargin: '200px 0px' });
    charts.forEach(function (chart) { observer.observe(chart); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
