// Reading enhancements for blog posts: table of contents, heading anchors,
// copy-code buttons and a reading-progress bar. All optional; the post reads
// fine without JavaScript.
(function () {
  var content = document.querySelector('.post-content');
  if (!content) return;

  // Heading anchors + table of contents
  var headings = content.querySelectorAll('h2[id], h3[id]');
  var toc = document.querySelector('.toc');
  var tocList = toc && toc.querySelector('ul');
  headings.forEach(function (h) {
    var anchor = document.createElement('a');
    anchor.className = 'heading-anchor';
    anchor.href = '#' + h.id;
    anchor.setAttribute('aria-label', 'Link to this section');
    anchor.textContent = '#';
    h.appendChild(anchor);

    // Keep the contents short: top-level sections only
    if (tocList && h.tagName === 'H2') {
      var li = document.createElement('li');
      var link = document.createElement('a');
      link.href = '#' + h.id;
      link.textContent = h.firstChild.textContent.trim();
      li.appendChild(link);
      tocList.appendChild(li);
    }
  });
  if (toc && tocList.children.length >= 3) {
    toc.hidden = false;
    // Open by default on wide screens, collapsed on phones
    if (window.matchMedia('(min-width: 700px)').matches) toc.open = true;
  }

  // Copy buttons on code blocks
  content.querySelectorAll('pre').forEach(function (pre) {
    if (!navigator.clipboard) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code to clipboard');
    button.addEventListener('click', function () {
      var code = pre.querySelector('code') || pre;
      navigator.clipboard.writeText(code.innerText).then(function () {
        button.textContent = 'Copied';
        setTimeout(function () { button.textContent = 'Copy'; }, 1500);
      });
    });
    var holder = pre.parentElement.classList.contains('highlight') ? pre.parentElement : pre;
    holder.appendChild(button);
  });

  // Reading progress
  var bar = document.querySelector('.reading-progress');
  if (bar) {
    var ticking = false;
    var update = function () {
      var rect = content.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var progress = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 1;
      bar.style.transform = 'scaleX(' + progress + ')';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }
})();

// Copy-link share button and language labels on code blocks
(function () {
  var copy = document.querySelector('.share-copy');
  if (copy && navigator.clipboard) {
    copy.hidden = false;
    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(copy.dataset.url).then(function () {
        copy.textContent = 'Link copied';
        setTimeout(function () { copy.textContent = 'Copy link'; }, 1500);
      });
    });
  }

  document.querySelectorAll('.post-content div[class*="language-"]').forEach(function (block) {
    var m = block.className.match(/language-([a-z0-9+#-]+)/i);
    if (!m || m[1] === 'plaintext') return;
    var label = document.createElement('span');
    label.className = 'code-lang';
    label.textContent = m[1];
    block.insertBefore(label, block.firstChild);
  });
})();
