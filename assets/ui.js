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

  function setupMarrakechClock(root) {
    root = root || document;
    var locations = root.querySelectorAll('.contact__location');
    if (!locations.length) return;
    function update() {
      var value = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Casablanca'
      }).format(new Date());
      locations.forEach(function (location) {
        var time = location.querySelector('[data-contact-time]');
        if (!time) {
          time = document.createElement('span');
          time.setAttribute('data-contact-time', '');
          location.appendChild(time);
        }
        time.textContent = value;
      });
    }
    update();
    window.setInterval(update, 30000);
  }

  /* ---------- optional analytics consent ---------- */
  var ANALYTICS_CONSENT_KEY = 'otmane-analytics-consent';

  function getAnalyticsConsent() {
    try { return window.localStorage.getItem(ANALYTICS_CONSENT_KEY); }
    catch (err) { return null; }
  }

  function applyAnalyticsConsent(value) {
    if (typeof window.clarity !== 'function') return;
    window.clarity('consentv2', {
      ad_Storage: 'denied',
      analytics_Storage: value === 'granted' ? 'granted' : 'denied'
    });
  }

  function saveAnalyticsConsent(value) {
    try { window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value); }
    catch (err) { /* Continue in cookieless mode when storage is unavailable. */ }
    applyAnalyticsConsent(value);
  }

  function setupAnalyticsConsent() {
    if (document.getElementById('analyticsConsent')) return;

    var savedChoice = getAnalyticsConsent();
    if (savedChoice === 'granted' || savedChoice === 'denied') {
      applyAnalyticsConsent(savedChoice);
    }

    var banner = document.createElement('section');
    banner.className = 'analytics-consent';
    banner.id = 'analyticsConsent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Analytics choices');
    banner.hidden = Boolean(savedChoice);
    banner.innerHTML =
      '<div class="analytics-consent__copy">' +
        '<p>I use optional Microsoft Clarity analytics to understand whether my case studies are clear and engaging. Your choice won\'t affect access.</p>' +
      '</div>' +
      '<div class="analytics-consent__actions">' +
        '<button class="analytics-consent__button analytics-consent__button--primary" type="button" data-analytics-choice="granted">Allow analytics</button>' +
        '<button class="analytics-consent__button analytics-consent__button--quiet" type="button" data-analytics-choice="denied">Continue without</button>' +
      '</div>';
    document.body.appendChild(banner);

    function showBanner() {
      banner.hidden = false;
      banner.classList.remove('is-leaving');
      window.requestAnimationFrame(function () {
        banner.classList.add('is-visible');
      });
      var firstChoice = banner.querySelector('[data-analytics-choice="granted"]');
      if (firstChoice) firstChoice.focus({ preventScroll: true });
    }

    function hideBanner() {
      banner.classList.remove('is-visible');
      banner.classList.add('is-leaving');
      window.setTimeout(function () {
        banner.hidden = true;
        banner.classList.remove('is-leaving');
      }, 240);
    }

    banner.addEventListener('click', function (event) {
      var choice = event.target.closest('[data-analytics-choice]');
      if (!choice) return;
      saveAnalyticsConsent(choice.getAttribute('data-analytics-choice'));
      hideBanner();
    });

    var footerMeta = document.querySelector('.contact__meta');
    if (footerMeta) {
      var preferences = document.createElement('button');
      preferences.className = 'analytics-preferences';
      preferences.type = 'button';
      preferences.textContent = 'Analytics choices';
      preferences.addEventListener('click', showBanner);
      footerMeta.appendChild(preferences);
    }

    if (!savedChoice) {
      window.requestAnimationFrame(function () {
        banner.classList.add('is-visible');
      });
    }
  }

  window.UI = {
    setupCursor: setupCursor,
    runLoader: runLoader,
    setupMarrakechClock: setupMarrakechClock,
    setupAnalyticsConsent: setupAnalyticsConsent
  };

  // Cursor is independent of everything else — start it as soon as the DOM exists.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setupCursor();
      setupMarrakechClock(document);
      setupAnalyticsConsent();
    });
  } else {
    setupCursor();
    setupMarrakechClock(document);
    setupAnalyticsConsent();
  }
})();
