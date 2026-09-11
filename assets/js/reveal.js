(function () {
  "use strict";
  var els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var vh = window.innerHeight || document.documentElement.clientHeight;

  function isInInitialView(el) {
    var r = el.getBoundingClientRect();
    return r.top < vh && r.bottom > 0;
  }

  // Anything already on screen at load time shouldn't play the scroll-reveal
  // fade — it just doubles up with the page's own cross-document view
  // transition (most noticeable on mobile, where more content sits above
  // the fold). Only elements the user actually scrolls to should animate.
  var toObserve = [];
  els.forEach(function (el) {
    if (reduceMotion || isInInitialView(el)) {
      el.classList.add("is-visible");
    } else {
      toObserve.push(el);
    }
  });

  if (!toObserve.length || !("IntersectionObserver" in window)) {
    toObserve.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  toObserve.forEach(function (el) { io.observe(el); });
})();
