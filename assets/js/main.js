/* ==========================================================================
   Ashish Pathania — academic portfolio
   assets/js/main.js  —  vanilla JS, no dependencies.
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- 1. Theme ---------------- */
  var STORE = 'ap-theme';

  function applyTheme(mode) {
    if (mode === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    var btn = $('#themeBtn');
    if (btn) btn.setAttribute('aria-label', 'Switch to ' + (mode === 'dark' ? 'light' : 'dark') + ' theme');
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  var themeBtn = $('#themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(STORE, next); } catch (e) {}
    });
  }
  applyTheme(currentTheme());

  // follow the OS only while the visitor has made no explicit choice
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onSchemeChange = function (e) {
      var saved = null;
      try { saved = localStorage.getItem(STORE); } catch (err) {}
      if (!saved) applyTheme(e.matches ? 'dark' : 'light');
    };
    if (mq.addEventListener) mq.addEventListener('change', onSchemeChange);
    else if (mq.addListener) mq.addListener(onSchemeChange);
  }

  /* ---------------- 2. Mobile nav ---------------- */
  var navToggle = $('#navToggle');
  var navLinks  = $('#navLinks');

  function closeNav() {
    if (!navLinks) return;
    navLinks.classList.remove('is-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('click', function (e) {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) closeNav();
    });
  }

  /* ---------------- 3. Sticky nav shadow + back-to-top ---------------- */
  var nav   = $('#nav');
  var toTop = $('#toTop');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('is-stuck', y > 12);
    if (toTop) toTop.classList.toggle('is-shown', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------- 4. Scrollspy ---------------- */
  var spyLinks = $$('#navLinks a[href^="#"]');
  var sections = spyLinks
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var visible = new Map();

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) visible.set(en.target.id, en.intersectionRatio);
        else visible.delete(en.target.id);
      });

      var bestId = null, bestRatio = -1;
      visible.forEach(function (ratio, id) {
        if (ratio > bestRatio) { bestRatio = ratio; bestId = id; }
      });
      if (!bestId) return;

      spyLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + bestId);
      });
    }, {
      rootMargin: '-30% 0px -55% 0px',
      threshold: [0, 0.15, 0.4, 0.8]
    });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------- 5. Reveal on scroll ----------------
     Nothing is hidden until the observer is genuinely running: .reveal-on is
     added immediately before observe(), and a failsafe drops it again if any
     block is somehow still hidden a few seconds later. A missing or broken
     script therefore leaves the page fully visible rather than blank. */
  function showAll(els) {
    els.forEach(function (el) { el.classList.add('is-in'); });
    document.documentElement.classList.remove('reveal-on');
  }

  var revealables = $$('.reveal');
  var pending = revealables.slice();

  // Not gated on `reduced`: under that preference the CSS drops the slide and
  // leaves a pure cross-fade, so the staggered entrance still runs without any
  // movement. Only an empty page skips it entirely.
  if (!revealables.length) {
    showAll(revealables);
  } else {
    document.documentElement.classList.add('reveal-on');

    var reveal = function (el) {
      var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
      if (delay) setTimeout(function () { el.classList.add('is-in'); }, delay);
      else el.classList.add('is-in');
    };

    // Sweep by geometry: reveal anything at or above the fold, and drop the
    // guard entirely once nothing is left pending.
    var revealTick = function () {
      var fold = window.innerHeight * 0.94;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top >= fold) return true;
        reveal(el);
        return false;
      });
      if (!pending.length) showAll(revealables);
    };

    window.addEventListener('scroll', revealTick, { passive: true });
    window.addEventListener('resize', revealTick);
    window.addEventListener('load', revealTick);

    // IntersectionObserver in parallel with the scroll sweep: whichever fires
    // first wins, so neither a missed observer callback nor a browser that
    // coalesces scroll events can strand an element at opacity 0.
    if ('IntersectionObserver' in window) {
      var ro = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          reveal(en.target);
          pending = pending.filter(function (p) { return p !== en.target; });
          obs.unobserve(en.target);
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
      revealables.forEach(function (el) { ro.observe(el); });
    }

    revealTick();
    setTimeout(revealTick, 400);
    setTimeout(revealTick, 1200);

    // Last resort. After this point nothing stays hidden under any
    // circumstances; it only ever affects content still below the fold, which
    // the reader is by definition not looking at.
    setTimeout(function () { showAll(revealables); }, 6000);
  }

  /* ---------------- 5b. Stat counters ----------------
     The final figures are already in the HTML, so this only ever animates what
     is otherwise correct: if the script never runs, or rAF is paused because
     the tab is in the background, the real numbers are what stay on screen. */
  var strip = $('.stats');
  var counters = $$('.stat__n');

  if (strip && counters.length) {
    counters.forEach(function (el) { el.setAttribute('data-target', el.textContent.trim()); });

    // Once a counter has landed it is marked done and nothing may touch it
    // again, so no repeat invocation or stray timer can reset it to 1.
    var settle = function (el) {
      var raw = el.getAttribute('data-target');
      if (raw) el.textContent = raw;
      el.setAttribute('data-done', '1');
    };

    var DUR = 3000;   // same for every counter, so the strip counts as one unit

    var countUp = function (el, delay) {
      if (el.getAttribute('data-done') === '1') return;

      var raw = el.getAttribute('data-target') || '';
      var target = parseInt(raw, 10);
      if (isNaN(target) || target <= 1) { settle(el); return; }

      var from = 1;
      setTimeout(function () {
        if (el.getAttribute('data-done') === '1') return;
        var t0 = null;
        var frame = function (ts) {
          if (el.getAttribute('data-done') === '1') return;
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / DUR);
          // linear: with targets as small as 3, an ease-out would reach the
          // final value a third of the way in and then sit there looking static
          el.textContent = String(Math.round(from + (target - from) * p));
          if (p < 1) requestAnimationFrame(frame);
          else settle(el);
        };
        requestAnimationFrame(frame);
      }, delay);

      // belt and braces: land on the true value even if rAF never ticks
      // (a background tab pauses rAF but still runs timers)
      setTimeout(function () { settle(el); }, delay + DUR + 500);
    };

    var LEAD = 550;        // hold on 1 so the count isn't over during first paint
    var onScreen = function () {
      var r = strip.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };

    /* Deliberately NOT gated on prefers-reduced-motion. That setting exists to
       suppress movement — parallax, sliding, scaling — which is what triggers
       vestibular discomfort. This counter moves nothing; only the digits change,
       in place. The fades and slides elsewhere on the page still honour it. */
    if (true) {
      // Pre-paint: if the strip is already on screen, blank to 1 synchronously
      // so the real figures are never shown and then yanked back to 1.
      if (onScreen()) counters.forEach(function (el) { el.textContent = '1'; });

      var armed = true;    // a run is allowed
      var running = false;

      var play = function () {
        if (running || !armed || document.visibilityState === 'hidden') return;
        running = true;
        armed = false;

        counters.forEach(function (el) {
          el.removeAttribute('data-done');    // clear so a replay can animate
          el.textContent = '1';
        });

        setTimeout(function () {
          counters.forEach(function (el, i) { countUp(el, i * 80); });
        }, LEAD);

        // per-run guarantee: land on the true figures, then allow a later replay
        setTimeout(function () {
          counters.forEach(settle);
          running = false;
        }, LEAD + DUR + 900);
      };

      // Primary trigger. Fires whenever the strip is meaningfully on screen —
      // including straight after layout when it is already in view, and again
      // if you scroll away and come back.
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) play();
            else if (!running) armed = true;
          });
        }, { threshold: 0.35 }).observe(strip);
      }

      // geometry fallback, for anything the observer misses
      var onView = function () { if (onScreen()) play(); };
      window.addEventListener('scroll', onView, { passive: true });
      window.addEventListener('load', onView);
      document.addEventListener('visibilitychange', onView);
      setTimeout(onView, 700);
      setTimeout(onView, 1800);
    }
  }

  /* ---------------- 6. Publication filter ---------------- */
  var filterBtns = $$('.filter[data-filter]');
  var pubItems   = $$('.pub[data-status]');
  var pubEmpty   = $('#pubEmpty');

  if (filterBtns.length && pubItems.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-filter');

        filterBtns.forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });

        var shown = 0;
        pubItems.forEach(function (item) {
          var match = key === 'all' || item.getAttribute('data-status') === key;
          item.classList.toggle('is-hidden', !match);
          if (match) shown++;
        });

        if (pubEmpty) pubEmpty.classList.toggle('is-shown', shown === 0);
      });
    });
  }

  /* ---------------- 7. Lightbox ---------------- */
  var lb       = $('#lightbox');
  var lbImg    = $('#lbImg');
  var lbTitle  = $('#lbTitle');
  var lbText   = $('#lbText');
  var lbIdx    = $('#lbIdx');
  var lbPrev   = $('.lb-prev');
  var lbNext   = $('.lb-next');
  var figs     = $$('.fig');
  var lastFocus = null;

  /* One gallery per chapter rather than a single 29-figure run: browsing stays
     inside the chapter you opened, and stepping past its last figure closes
     the viewer and returns you to that chapter on the page. */
  var groups = $$('.figs').map(function (container) {
    var chapter = container.closest('.chapter');
    var numEl   = chapter && chapter.querySelector('.chapter__num');
    var num     = numEl ? parseInt(numEl.textContent, 10) : 0;
    return {
      items: $$('.fig', container),
      block: chapter,
      label: num ? 'Chapter ' + num : 'Figures'
    };
  }).filter(function (g) { return g.items.length; });

  var group = groups[0] || null;
  var idx = 0;

  function render() {
    if (!group) return;
    var f = group.items[idx];
    var n = group.items.length;

    lbImg.setAttribute('src', f.getAttribute('data-full'));
    lbImg.setAttribute('alt', f.getAttribute('data-title') || 'Research figure');
    lbImg.setAttribute('data-bg', f.getAttribute('data-bg') || 'light');

    lbTitle.textContent = f.getAttribute('data-title') || '';
    lbText.textContent  = f.getAttribute('data-cap') || '';
    lbIdx.textContent   = group.label + ' · Figure ' + (idx + 1) + ' of ' + n + ' · ' +
      (idx + 1 === n ? '→ or Esc to close' : '← → to browse, Esc to close');

    // nothing before the first figure, so make that explicit
    if (lbPrev) lbPrev.disabled = (idx === 0);
  }

  function step(delta) {
    if (!group) return;
    var next = idx + delta;
    if (next < 0) return;                       // clamp at the chapter's first figure
    if (next >= group.items.length) {           // past the last -> done with this chapter
      closeLb(true);
      return;
    }
    idx = next;
    render();
  }

  function openLb(g, i) {
    if (!lb) return;
    lastFocus = document.activeElement;
    group = g;
    idx = i;
    render();
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    var closeBtn = $('.lb-close', lb);
    if (closeBtn) closeBtn.focus();
  }

  function closeLb(atChapterEnd) {
    if (!lb) return;
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    lbImg.setAttribute('src', '');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    // reaching the end of a chapter drops you back onto that chapter;
    // closing by hand leaves your scroll position untouched.
    if (atChapterEnd === true && group && group.block) {
      group.block.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }

  groups.forEach(function (g) {
    g.items.forEach(function (f, i) {
      f.addEventListener('click', function () { openLb(g, i); });
    });
  });

  if (lb) {
    lb.addEventListener('click', function (e) {
      // closest(), not hasAttribute(): a click usually lands on the <svg> or
      // its <path> inside the button, which carries no data-close of its own.
      if (e.target === lb || (e.target.closest && e.target.closest('[data-close]'))) closeLb();
    });
    $$('[data-lb-prev]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    });
    $$('[data-lb-next]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); step(1); });
    });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape')     { e.preventDefault(); closeLb(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); step(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'Tab') {
        // keep focus inside the dialog
        var f = $$('button:not([disabled])', lb);
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------------- 8. Copy e-mail ---------------- */
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var label = btn.querySelector('[data-copy-label]') || btn;
      var original = label.textContent;

      var done = function () {
        label.textContent = 'Copied';
        setTimeout(function () { label.textContent = original; }, 1600);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:absolute;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------------- 9. Footer year ---------------- */
  var yr = $('#year');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
