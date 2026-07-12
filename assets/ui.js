/* ============================================================
   Shared UI — custom cursor + page loader
   Used by index.html and work.html
   ============================================================ */
(function () {
  'use strict';

  /* ---------- custom cursor ---------- */
  function setupCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var cursor = document.getElementById('cursorFollower');
    if (!cursor) return;
    if (cursor.dataset.init === '1') return;   // never bind twice
    cursor.dataset.init = '1';

    var SD = 20;    // default size
    var SL = 44;    // link size
    var SP = 100;   // project card size
    var LP = 0.14;  // position lerp
    var LS = 0.12;  // size lerp

    var tx = -300, ty = -300, cx = -300, cy = -300;
    var tSize = SD, cSize = SD;
    var visible = false;

    cursor.style.opacity = '0';
    cursor.style.width = SD + 'px';
    cursor.style.height = SD + 'px';

    var CARD_SEL = '.work__card, .wl-card, .wcard';
    var LINK_SEL = 'a, button, .cs-live-link, .cs-slider__handle';

    // Event delegation — works for elements rendered at any time.
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX;
      ty = e.clientY;

      if (!visible) {
        cx = tx; cy = ty;
        cursor.style.opacity = '1';
        visible = true;
      }

      var card = e.target.closest ? e.target.closest(CARD_SEL) : null;
      if (card) {
        tSize = SP;
        cursor.classList.add('is-project');
        return;
      }

      cursor.classList.remove('is-project');
      var link = e.target.closest ? e.target.closest(LINK_SEL) : null;
      tSize = link ? SL : SD;
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      cursor.style.opacity = '0';
      visible = false;
    });

    (function tick() {
      cx += (tx - cx) * LP;
      cy += (ty - cy) * LP;
      cSize += (tSize - cSize) * LS;
      cursor.style.transform =
        'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px) translate(-50%,-50%)';
      cursor.style.width = cSize.toFixed(1) + 'px';
      cursor.style.height = cSize.toFixed(1) + 'px';
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- page loader ---------- */
  // images: array of image URLs. onDone: called exactly once when finished.
  function runLoader(images, onDone) {
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      try { onDone(); } catch (err) { console.error(err); }
    }

    var loader = document.getElementById('loader');
    var imgsWrap = document.getElementById('loaderImgs');
    var countEl = document.getElementById('loaderCount');

    // If anything is missing, don't hold the page hostage.
    if (!loader || !imgsWrap || !countEl || !images || !images.length) {
      if (loader) loader.style.display = 'none';
      finish();
      return;
    }

    var DURATION = 2000;   // total loader time (ms)
    var STEP = 20;         // counter tick (ms)
    var SLIDE = 800;       // must match CSS transition on .loader

    // Inject cycling images
    images.forEach(function (src, i) {
      var img = document.createElement('img');
      img.src = src;
      img.className = 'loader__img' + (i === 0 ? ' is-active' : '');
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      imgsWrap.appendChild(img);
    });

    var slides = imgsWrap.querySelectorAll('.loader__img');
    var current = 0;
    var imgTimer = setInterval(function () {
      slides[current].classList.remove('is-active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('is-active');
    }, DURATION / images.length);

    var elapsed = 0;
    var counter = setInterval(function () {
      elapsed += STEP;
      var pct = Math.min(100, Math.round((elapsed / DURATION) * 100));
      countEl.textContent = pct + '%';
      if (pct >= 100) {
        clearInterval(counter);
        clearInterval(imgTimer);
        loader.classList.add('is-done');           // slides up (CSS)
        setTimeout(function () {
          loader.style.display = 'none';
          finish();
        }, SLIDE);
      }
    }, STEP);

    // Absolute safety net — page is never stuck, whatever happens.
    setTimeout(function () {
      clearInterval(counter);
      clearInterval(imgTimer);
      if (loader) loader.style.display = 'none';
      finish();
    }, DURATION + SLIDE + 1500);
  }

  window.UI = { setupCursor: setupCursor, runLoader: runLoader };

  // Cursor is independent of everything else — start it as soon as the DOM exists.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCursor);
  } else {
    setupCursor();
  }
})();