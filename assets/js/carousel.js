(function () {
  "use strict";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var INTERVAL = 4000;

  document.querySelectorAll(".cover-carousel").forEach(function (root) {
    var track = root.querySelector(".cc-track");
    var slides = track.children;
    var dots = root.querySelectorAll(".cc-dots button");
    var caption = root.querySelector(".cc-caption");
    var n = slides.length;
    var idx = 0;

    function mark() {
      dots.forEach(function (d, i) {
        if (i === idx) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
      if (caption) caption.textContent = slides[idx].getAttribute("data-label") || "";
    }

    function go(i) {
      idx = (i + n) % n;
      track.scrollTo({ left: idx * track.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
      mark();
    }

    // Touch and trackpad swipes scroll natively (scroll-snap); keep dots in sync.
    track.addEventListener("scroll", function () {
      if (dragging) return;
      var c = Math.round(track.scrollLeft / track.clientWidth);
      if (c !== idx && c >= 0 && c < n) { idx = c; mark(); }
    }, { passive: true });

    dots.forEach(function (d, i) {
      d.addEventListener("click", function () { go(i); kick(); });
    });

    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { go(idx + 1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { go(idx - 1); e.preventDefault(); }
    });

    // Mouse drag (native scrolling doesn't cover click-and-drag with a mouse).
    var dragging = false, moved = false, startX = 0, startLeft = 0;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true; moved = false;
      startX = e.clientX; startLeft = track.scrollLeft;
      track.classList.add("is-dragging");
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      track.scrollLeft = startLeft - dx;
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      var w = track.clientWidth, dx = e.clientX - startX;
      var target = Math.round(startLeft / w);
      if (dx < -w * 0.15) target++;
      else if (dx > w * 0.15) target--;
      go(Math.max(0, Math.min(n - 1, target)));
      // Re-enable snapping only after the smooth scroll has settled.
      setTimeout(function () { track.classList.remove("is-dragging"); }, 450);
      kick();
    }
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);

    // Auto-advance (detail pages only), paused while the user is interacting.
    var timer = null, paused = false;
    var autoplay = root.hasAttribute("data-autoplay") && !reduceMotion && n > 1;
    function kick() {
      if (!autoplay) return;
      clearInterval(timer);
      timer = setInterval(function () {
        if (!paused && !dragging && !document.hidden) go(idx + 1);
      }, INTERVAL);
    }
    if (autoplay) {
      root.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") paused = true; });
      root.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { paused = false; kick(); } });
      root.addEventListener("touchstart", function () { paused = true; }, { passive: true });
      root.addEventListener("touchend", function () { paused = false; kick(); }, { passive: true });
      root.addEventListener("focusin", function () { paused = true; });
      root.addEventListener("focusout", function () { paused = false; kick(); });
      kick();
    }

    mark();
  });
})();
