// Site-wide progressive enhancements. Every page is fully usable without JS.
(function () {
  // Give the sticky header a hairline border once the page has scrolled
  var header = document.querySelector('.site-header');
  if (header) {
    var ticking = false;
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
  }

  // Fade content in as it scrolls into view. Only blocks that start below the
  // fold are touched (the top of the page animates in with CSS), so nothing is
  // hidden unless it can be revealed, and reduced-motion users see it all.
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  var targets = document.querySelectorAll(
    '.site-main .section, .site-main .metrics, .post-item, .card, .project-card, .social-card, ' +
    '.contact-option, .publication-item, .role, .theme, .author-box, .related, .post-navigation, ' +
    '.diagram, .canvas-container'
  );
  var fold = window.innerHeight;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

  targets.forEach(function (el) {
    // Skip anything already on screen, and anything nested in a block we reveal
    if (el.getBoundingClientRect().top < fold) return;
    if (el.parentElement && el.parentElement.closest('.reveal')) return;
    el.classList.add('reveal');
    observer.observe(el);
  });
})();
