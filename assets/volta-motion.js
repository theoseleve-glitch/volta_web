/*
 * volta-motion.js
 * Motion foundation — Lenis + GSAP + ScrollTrigger wiring, plus `window.VoltaMotion`
 * helpers for reveal/pin/parallax/magnetize used across sections.
 *
 * Loaded AFTER the CDN scripts that define window.gsap, window.ScrollTrigger, window.Lenis.
 * Disables itself on: prefers-reduced-motion, Theme Editor (shopify:designMode),
 * and absence of required globals.
 */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDesignMode = !!(window.Shopify && window.Shopify.designMode);
  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';
  var hasLenis = typeof window.Lenis !== 'undefined';

  // Expose a minimal API even when disabled so section code can call it safely.
  window.VoltaMotion = window.VoltaMotion || {
    enabled: false,
    lenis: null,
    reveal: function () {},
    pin: function () {},
    parallax: function () {},
    magnetize: function () {},
    refresh: function () {},
    kill: function () {},
  };

  if (prefersReduced || isDesignMode || !hasGSAP || !hasScrollTrigger || !hasLenis) {
    // Still reveal everything so content is visible — just no animation.
    document.documentElement.classList.add('v-motion-disabled');
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('.v-reveal').forEach(function (el) {
        el.classList.add('is-revealed');
      });
    });
    return;
  }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  // ── Lenis ───────────────────────────────────────────────────────────────
  var lenis = new window.Lenis({
    duration: 1.2,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    smoothTouch: false,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // ── Public API ──────────────────────────────────────────────────────────
  function reveal(selector, opts) {
    opts = opts || {};
    var els = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;
    if (!els || !els.length) return;
    els.forEach(function (el, i) {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: opts.y || 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: opts.duration || 0.55,
          ease: opts.ease || 'power2.out',
          delay: (opts.stagger || 0.04) * i,
          scrollTrigger: {
            trigger: el,
            start: opts.start || 'top 95%',
            once: true,
          },
          onStart: function () { el.classList.add('is-revealed'); },
        }
      );
    });
  }

  function pin(selector, opts) {
    opts = opts || {};
    var el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return null;
    return ScrollTrigger.create({
      trigger: el,
      start: opts.start || 'top top',
      end: opts.end || 'bottom top',
      pin: true,
      pinSpacing: opts.pinSpacing !== false,
    });
  }

  function parallax(selector, speed) {
    speed = typeof speed === 'number' ? speed : 0.85;
    var els = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;
    if (!els || !els.length) return;
    els.forEach(function (el) {
      gsap.to(el, {
        yPercent: -(1 - speed) * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  function magnetize(selector, strength) {
    strength = typeof strength === 'number' ? strength : 0.3;
    var radius = 80;
    var els = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;
    if (!els || !els.length) return;
    els.forEach(function (el) {
      var qx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      var qy = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        var dx = e.clientX - cx;
        var dy = e.clientY - cy;
        var dist = Math.hypot(dx, dy);
        if (dist < radius) {
          qx(dx * strength);
          qy(dy * strength);
        } else {
          qx(0); qy(0);
        }
      });
      el.addEventListener('pointerleave', function () { qx(0); qy(0); });
    });
  }

  function refresh() { ScrollTrigger.refresh(); }

  function kill() {
    ScrollTrigger.getAll().forEach(function (st) { st.kill(); });
    if (lenis && lenis.destroy) lenis.destroy();
  }

  // ── Auto-init ───────────────────────────────────────────────────────────
  function init() {
    reveal('.v-reveal');
    magnetize('.v-magnetic');
    parallax('.v-parallax', 0.85);

    // Refresh ScrollTrigger on Theme Editor section reload (editor reshuffles DOM)
    document.addEventListener('shopify:section:load', refresh);
    document.addEventListener('shopify:section:unload', function (e) {
      // Remove ScrollTriggers that belong to the unloaded section to avoid ghost triggers
      var sectionEl = e.target;
      ScrollTrigger.getAll().forEach(function (st) {
        if (sectionEl.contains(st.trigger)) st.kill();
      });
    });
    document.addEventListener('shopify:section:select', refresh);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.VoltaMotion = {
    enabled: true,
    lenis: lenis,
    reveal: reveal,
    pin: pin,
    parallax: parallax,
    magnetize: magnetize,
    refresh: refresh,
    kill: kill,
  };
})();
