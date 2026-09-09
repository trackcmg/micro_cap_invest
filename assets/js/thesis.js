(function () {
  'use strict';
  var content = document.getElementById('thesis-content');
  var toc = document.querySelector('.article-toc');
  if (!content || !toc) return;
  var headings = content.querySelectorAll('h2');
  var list = toc.querySelector('ol');
  headings.forEach(function (heading, index) {
    if (!heading.id) heading.id = 'section-' + (index + 1);
    var item = document.createElement('li');
    var link = document.createElement('a');
    link.href = '#' + encodeURIComponent(heading.id);
    link.textContent = heading.textContent;
    item.appendChild(link);
    list.appendChild(item);
  });
  toc.hidden = headings.length === 0;
  var minutes = Math.max(1, Math.ceil(content.textContent.trim().split(/\s+/).length / 220));
  toc.querySelector('.reading-time').textContent = minutes + (document.documentElement.lang === 'es' ? ' min de lectura' : ' min read');
  content.querySelectorAll('img').forEach(function (img) {
    img.loading = 'lazy';
    img.decoding = 'async';
  });
})();
