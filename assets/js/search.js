// ⌘K / Ctrl+K search palette. The index (/search.json) is fetched on first open.
(function () {
  var dialog = document.getElementById('search-dialog');
  var input = document.getElementById('search-input');
  var list = document.getElementById('search-results');
  var empty = document.getElementById('search-empty');
  var trigger = document.getElementById('search-trigger');
  if (!dialog || !input || typeof dialog.showModal !== 'function') return;

  var index = null;
  var results = [];
  var selected = 0;

  if (trigger) {
    trigger.hidden = false;
    var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    trigger.title = 'Search (' + (isMac ? '⌘K' : 'Ctrl K') + ')';
    trigger.addEventListener('click', open);
  }

  function load() {
    if (index) return Promise.resolve(index);
    return fetch(dialog.dataset.index || '/search.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        index = data.map(function (d) {
          d._title = d.title.toLowerCase();
          d._meta = (d.description + ' ' + d.tags).toLowerCase();
          d._body = decode(d.content).toLowerCase();
          return d;
        });
        return index;
      });
  }

  function decode(html) {
    var t = document.createElement('textarea');
    t.innerHTML = html;
    return t.value;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function highlight(text, terms) {
    var out = escapeHtml(text);
    terms.forEach(function (t) {
      var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      out = out.replace(re, '<mark>$1</mark>');
    });
    return out;
  }

  function snippet(doc, terms) {
    var body = decode(doc.content);
    var lower = body.toLowerCase();
    // Prefer a whole-word match (e.g. "pose" in prose, not inside "transpose")
    var at = -1;
    for (var i = 0; i < terms.length && at < 0; i++) {
      var m = new RegExp('\\b' + terms[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).exec(lower);
      at = m ? m.index : -1;
    }
    for (var j = 0; j < terms.length && at < 0; j++) at = lower.indexOf(terms[j]);
    if (at < 0) return doc.description || body.slice(0, 120);
    var start = Math.max(0, at - 40);
    return (start > 0 ? '…' : '') + body.slice(start, start + 140).trim() + '…';
  }

  // Light stemming so "leakage" finds "leak" and "tracking" finds "track"
  var SUFFIXES = ['ations', 'ation', 'ings', 'ing', 'ages', 'age', 'ies', 'ed', 'es', 's'];
  function variants(term) {
    for (var i = 0; i < SUFFIXES.length; i++) {
      var suf = SUFFIXES[i];
      if (term.length - suf.length >= 4 && term.slice(-suf.length) === suf) {
        return [term, term.slice(0, -suf.length)];
      }
    }
    return [term];
  }

  function has(text, forms) {
    for (var i = 0; i < forms.length; i++) if (text.indexOf(forms[i]) >= 0) return true;
    return false;
  }

  function search(query) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) {
      // Empty query: show pages as quick navigation
      return index.filter(function (d) { return d.type === 'Page'; })
        .map(function (d) { return { doc: d, text: d.description }; });
    }
    return index.map(function (d) {
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var f = variants(terms[i]);
        var s = (has(d._title, f) ? 10 : 0) + (has(d._meta, f) ? 4 : 0) + (has(d._body, f) ? 1 : 0);
        if (!s) return null; // every term must match somewhere
        score += s;
      }
      if (d.type === 'Post') score += 0.5;
      return { doc: d, score: score, text: snippet(d, terms) };
    }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, 8);
  }

  function render() {
    var terms = [];
    input.value.toLowerCase().split(/\s+/).filter(Boolean).forEach(function (t) {
      terms = terms.concat(variants(t).slice(-1));
    });
    results = search(input.value);
    selected = 0;
    list.innerHTML = results.map(function (r, i) {
      return '<li role="option" id="search-opt-' + i + '" aria-selected="' + (i === 0) + '">' +
        '<a href="' + r.doc.url + '">' +
        '<span class="result-type">' + r.doc.type + '</span>' +
        '<span class="result-title">' + highlight(r.doc.title, terms) + '</span>' +
        '<span class="result-snippet">' + highlight(r.text || '', terms) + '</span>' +
        '</a></li>';
    }).join('');
    empty.hidden = results.length > 0;
    input.setAttribute('aria-activedescendant', results.length ? 'search-opt-0' : '');
  }

  function move(delta) {
    if (!results.length) return;
    var items = list.children;
    items[selected].setAttribute('aria-selected', 'false');
    selected = (selected + delta + results.length) % results.length;
    items[selected].setAttribute('aria-selected', 'true');
    items[selected].scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', 'search-opt-' + selected);
  }

  function open() {
    if (dialog.open) return;
    dialog.showModal();
    input.value = '';
    load().then(render).catch(function () {
      empty.hidden = false;
      empty.textContent = 'Search is unavailable right now.';
    });
    input.focus();
  }

  input.addEventListener('input', function () { if (index) render(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selected]) window.location.href = results[selected].doc.url;
    }
  });

  // Click on the backdrop closes the dialog
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });

  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open(); }
    else if (e.key === '/' && !typing && !dialog.open) { e.preventDefault(); open(); }
  });
})();
