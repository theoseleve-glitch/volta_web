/*
 * volta-cursor.js
 * Custom cursor with lagged ring + state-driven label. Depends on GSAP.
 * Hidden on touch devices, in Theme Editor design mode, and when reduced-motion.
 */
(function () {
  'use strict';

  var root = document.querySelector('.v-cursor');
  if (!root) return;

  var isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDesignMode = !!(window.Shopify && window.Shopify.designMode);

  if (isTouch || prefersReduced || isDesignMode || typeof window.gsap === 'undefined') {
    document.body.classList.add('cursor-hidden');
    return;
  }

  var gsap = window.gsap;
  var dot = root.querySelector('.v-cursor__dot');
  var ring = root.querySelector('.v-cursor__ring');
  var label = root.querySelector('.v-cursor__label');

  // Hide until first move (no flash at 0,0)
  gsap.set(root, { autoAlpha: 0 });

  var xDot = gsap.quickTo(dot, 'x', { duration: 0.15, ease: 'power3.out' });
  var yDot = gsap.quickTo(dot, 'y', { duration: 0.15, ease: 'power3.out' });
  var xRing = gsap.quickTo(ring, 'x', { duration: 0.3, ease: 'power3.out' });
  var yRing = gsap.quickTo(ring, 'y', { duration: 0.3, ease: 'power3.out' });
  var xLabel = gsap.quickTo(label, 'x', { duration: 0.3, ease: 'power3.out' });
  var yLabel = gsap.quickTo(label, 'y', { duration: 0.3, ease: 'power3.out' });

  var shown = false;
  window.addEventListener('pointermove', function (e) {
    if (!shown) {
      gsap.to(root, { autoAlpha: 1, duration: 0.2 });
      shown = true;
    }
    xDot(e.clientX);
    yDot(e.clientY);
    xRing(e.clientX);
    yRing(e.clientY);
    xLabel(e.clientX);
    yLabel(e.clientY);
  }, { passive: true });

  window.addEventListener('pointerdown', function () {
    gsap.to(ring, { scale: 0.75, duration: 0.12, yoyo: true, repeat: 1 });
  }, { passive: true });

  function bind(selector, stateClass, defaultLabel) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.addEventListener('pointerenter', function () {
        root.classList.add(stateClass);
        var text = el.getAttribute('data-cursor-label') || defaultLabel || '';
        if (text) label.textContent = text;
      });
      el.addEventListener('pointerleave', function () {
        root.classList.remove(stateClass);
      });
    });
  }

  function bindAll() {
    // Any link or button → hover state
    bind('a, button, [data-cursor="hover"]', 'v-cursor--hover', '');
    // Product media → view state
    bind('[data-cursor="view"]', 'v-cursor--view', 'VIEW');
    // Horizontal-scroll sections → drag state
    bind('[data-cursor="drag"]', 'v-cursor--drag', 'DRAG');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindAll);
  } else {
    bindAll();
  }

  // Rebind after Theme Editor section reload
  document.addEventListener('shopify:section:load', bindAll);
})();
