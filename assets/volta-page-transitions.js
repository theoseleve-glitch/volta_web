/*
 * volta-page-transitions.js
 * Uses the View Transitions API (if supported) for fade-between-routes.
 * Instant navigation fallback otherwise — no Barba/Swup dependency.
 */
(function () {
  'use strict';

  if (!document.startViewTransition) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || link.target === '_blank' || link.hasAttribute('download')) return;
    // Only same-origin internal links
    let url;
    try { url = new URL(href, location.href); } catch (_) { return; }
    if (url.origin !== location.origin) return;
    // Skip cart routes (they use AJAX drawer)
    if (url.pathname.startsWith('/cart')) return;

    e.preventDefault();
    document.startViewTransition(async () => {
      location.href = url.href;
    });
  });
})();
