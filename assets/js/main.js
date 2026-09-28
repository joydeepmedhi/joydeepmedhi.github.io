// Site-wide progressive enhancements. Every page is fully usable without JS.
(function () {
  // Give the sticky header a hairline border once the page has scrolled
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
