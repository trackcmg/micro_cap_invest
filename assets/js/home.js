/* All theses remain visible after language deduplication.
   Price statistics use an unweighted average, never portfolio CAGR. */
(function () {
  'use strict';
  function money(value) {
    var match = /^(C\$|A\$|\$|€|£)\s*(\d+(?:,\d{3})*(?:\.\d+)?)$/.exec(String(value || '').trim());
    return match ? { price: Number(match[2].replace(/,/g, '')), currency: { 'C$': 'CAD', 'A$': 'AUD', '$': 'USD', '€': 'EUR', '£': 'GBP' }[match[1]] } : null;
  }
  function quote(symbol) {
    var proxy = document.body.getAttribute('data-price-proxy');
    if (!proxy) return Promise.reject(new Error('No price source'));
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 15000);
    var url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(symbol) + '?range=1d&interval=5m';
    return fetch(proxy + '?url=' + encodeURIComponent(url), { signal: controller.signal })
      .then(function (response) { if (!response.ok) throw new Error('Quote unavailable'); return response.json(); })
      .then(function (data) {
        var result = data && data.chart && data.chart.result && data.chart.result[0];
        var meta = result && result.meta;
        if (!meta || typeof meta.regularMarketPrice !== 'number' || !Number.isFinite(meta.regularMarketPrice) || meta.regularMarketPrice <= 0) throw new Error('Invalid price');
        var price = meta.regularMarketPrice;
        var currency = meta.currency;
        if (['GBp', 'GBX', 'GBx'].indexOf(currency) !== -1) { price /= 100; currency = 'GBP'; }
        if (typeof meta.regularMarketTime !== 'number' || !Number.isFinite(meta.regularMarketTime) || meta.regularMarketTime <= 0 || meta.regularMarketTime * 1000 > Date.now() + 300000) throw new Error('Invalid quote date');
        return { price: price, currency: currency, time: meta.regularMarketTime * 1000 };
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
      var valid = results.filter(function (r) { return r !== null; });
      var complete = finished && records.length > 0 && valid.length === records.length;
      mean.textContent = '—';
      mean.classList.remove('pos', 'neg');
      positive.textContent = '—';
      if (complete) {
        var average = valid.reduce(function (sum, r) { return sum + r.change; }, 0) / valid.length;
        mean.textContent = new Intl.NumberFormat(es ? 'es-ES' : 'en-GB', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: 'exceptZero' }).format(average);
        if (average !== 0) mean.classList.add(average > 0 ? 'pos' : 'neg');
        positive.textContent = valid.filter(function (r) { return r.change > 0; }).length + ' / ' + records.length;
      }
      if (!finished) { status.textContent = es ? 'Consultando cotizaciones…' : 'Fetching quotes…'; return; }
      status.textContent = (es ? 'Precios disponibles: ' : 'Prices available: ') + valid.length + ' / ' + records.length + '. ';
      if (!complete) status.textContent += es ? 'Estadísticas pendientes hasta disponer de todos los precios.' : 'Statistics pending until every price is available.';
      var times = valid.filter(function (r) { return r.time; }).map(function (r) { return r.time; });
      if (times.length) status.textContent += (es ? ' Cotización más antigua: ' : ' Oldest quote: ') + new Intl.DateTimeFormat(es ? 'es-ES' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(Math.min.apply(null, times))) + (es ? '. Los precios pueden ir con retraso.' : '. Prices may be delayed.');
    }
    document.addEventListener('cmg:lang', render);
    render();
    Promise.all(records.map(function (record) {
      var entry = money(record.getAttribute('data-entry'));
      var saleText = record.getAttribute('data-sale');
      if (!entry || entry.price <= 0) return Promise.resolve(null);
      var sale = money(saleText);
      var latest = saleText ? (sale ? Promise.resolve(sale) : Promise.reject(new Error('Invalid sale'))) : quote(record.getAttribute('data-symbol'));
      return latest.then(function (value) {
        if (entry.currency !== value.currency) throw new Error('Currency mismatch');
        return { change: value.price / entry.price - 1, time: value.time || null };
      }).catch(function () { return null; });
    })).then(function (values) { results = values; finished = true; render(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
