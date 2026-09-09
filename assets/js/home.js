/* Equal initial allocations; gross dividends accrue on ex-date, without reinvestment.
   All theses remain visible after language deduplication. */
(function () {
  'use strict';
  function money(value) {
    var match = /^(C\$|A\$|\$|€|£)\s*(\d+(?:,\d{3})*(?:\.\d+)?)$/.exec(String(value || '').trim());
    return match ? { price: Number(match[2].replace(/,/g, '')), currency: { 'C$': 'CAD', 'A$': 'AUD', '$': 'USD', '€': 'EUR', '£': 'GBP' }[match[1]] } : null;
  }
  function date(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    var time = Date.parse(value + 'T00:00:00Z');
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : null;
  }
  function load(record) {
    var entry = money(record.getAttribute('data-entry'));
    var saleText = record.getAttribute('data-sale');
    var sale = money(saleText);
    var opened = record.getAttribute('data-opened');
    var sold = record.getAttribute('data-sold');
    var start = date(opened);
    var end = saleText ? date(sold) : Date.now();
    if (!entry || entry.price <= 0 || start === null || end === null || start > end || end > Date.now() || (saleText && (!sale || sale.currency !== entry.currency))) return Promise.reject(new Error('Invalid entry or sale dates'));
    var proxy = document.body.getAttribute('data-price-proxy');
    if (!proxy) return Promise.reject(new Error('No price source'));
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 20000);
    var url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(record.getAttribute('data-symbol')) + '?period1=' + Math.floor(start / 1000) + '&period2=' + Math.floor((saleText ? end + 86400000 : end) / 1000) + '&interval=1d&events=div%2Csplits';
    return fetch(proxy + '?url=' + encodeURIComponent(url), { signal: controller.signal })
      .then(function (response) { if (!response.ok) throw new Error('History unavailable'); return response.json(); })
      .then(function (data) {
        var result = data && data.chart && data.chart.result && data.chart.result[0];
        var meta = result && result.meta;
        if (!meta || !Array.isArray(result.timestamp) || !result.timestamp.length) throw new Error('Incomplete history');
        var pence = ['GBp', 'GBX', 'GBx'].indexOf(meta.currency) !== -1;
        var currency = pence ? 'GBP' : meta.currency;
        if (entry.currency !== currency) throw new Error('Currency mismatch');
        var price = sale ? sale.price : meta.regularMarketPrice;
        if (!sale && pence) price /= 100;
        if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) throw new Error('Invalid price');
        var time = sale ? end : meta.regularMarketTime * 1000;
        if (!Number.isFinite(time) || time <= 0 || time > Date.now() + 300000) throw new Error('Invalid quote date');
        var events = result.events || {};
        // Do not mix a pre-split entry price with post-split prices or dividends.
        if (Object.keys(events.splits || {}).length) throw new Error('Split requires entry review');
        var dividends = 0;
        var until = sale ? sold : new Date().toISOString().slice(0, 10);
        Object.keys(events.dividends || {}).forEach(function (key) {
          var event = events.dividends[key];
          if (typeof event.amount !== 'number' || !Number.isFinite(event.amount) || event.amount < 0 || !Number.isFinite(event.date)) throw new Error('Invalid dividend');
          var exDate = new Date(event.date * 1000).toISOString().slice(0, 10);
          if (exDate > opened && exDate <= until) dividends += event.amount / (pence ? 100 : 1);
        });
        return { price: price, currency: currency, dividends: dividends, change: (price + dividends) / entry.price - 1, time: time };
      }).finally(function () { clearTimeout(timer); });
  }
  function init() {
    var mean = document.getElementById('stat-mean');
    if (!mean) return;
    var positive = document.getElementById('stat-positive');
    var status = document.getElementById('stats-status');
    var records = Array.from(document.querySelectorAll('[data-stat-record]'));
    var results = [];
    var finished = false;
    function render() {
      var es = window.CMG.lang() === 'es';
      var locale = es ? 'es-ES' : 'en-GB';
      var percent = new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: 'exceptZero' });
      var valid = results.filter(function (r) { return r !== null; });
      var complete = finished && records.length > 0 && valid.length === records.length;
      mean.textContent = '—';
      mean.classList.remove('pos', 'neg');
      positive.textContent = '—';
      if (complete) {
        var average = valid.reduce(function (sum, r) { return sum + r.change; }, 0) / valid.length;
        mean.textContent = percent.format(average);
        if (average !== 0) mean.classList.add(average > 0 ? 'pos' : 'neg');
        positive.textContent = valid.filter(function (r) { return r.change > 0; }).length + ' / ' + records.length;
      }
      records.forEach(function (record, index) {
        var value = results[index];
        ['price', 'dividends', 'return'].forEach(function (field) {
          var cell = record.querySelector('[data-stat-' + field + ']');
          if (!cell) return;
          cell.classList.remove('pos', 'neg');
          cell.textContent = '—';
          if (!value) return;
          if (field === 'return') {
            cell.textContent = percent.format(value.change);
            if (value.change !== 0) cell.classList.add(value.change > 0 ? 'pos' : 'neg');
          } else cell.textContent = new Intl.NumberFormat(locale, { style: 'currency', currency: value.currency, minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(value[field]);
        });
      });
      if (!finished) { status.textContent = es ? 'Consultando precios y dividendos…' : 'Fetching prices and dividends…'; return; }
      status.textContent = (es ? 'Históricos disponibles: ' : 'Histories available: ') + valid.length + ' / ' + records.length + '. ';
      if (!complete) status.textContent += es ? 'Resumen pendiente: faltan datos válidos o hay operaciones que requieren revisión.' : 'Overview pending: missing valid data or corporate actions requiring review.';
      var times = valid.map(function (r) { return r.time; });
      if (times.length) status.textContent += (es ? ' Precio de referencia más antiguo: ' : ' Oldest reference price: ') + new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(Math.min.apply(null, times))) + (es ? '. Los datos pueden ir con retraso.' : '. Data may be delayed.');
    }
    document.addEventListener('cmg:lang', render);
    render();
    Promise.all(records.map(function (record) { return load(record).catch(function () { return null; }); }))
      .then(function (values) { results = values; finished = true; render(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
