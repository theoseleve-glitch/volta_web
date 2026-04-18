/*
 * volta-events.js
 * Pushes custom events to window.dataLayer (GTM) and invokes Klaviyo
 * (_learnq.push) + Meta Pixel (fbq) where available. Listens to the
 * volta:* CustomEvents dispatched by cart/product/mascot scripts.
 *
 * Event catalog (see /docs/ANALYTICS.md):
 *   volta_page_view              Every page
 *   volta_add_to_cart            On cart add
 *   volta_subscription_selected  On subscription toggle ON
 *   volta_cursor_engaged         Once per session on first cursor hover
 *   volta_mascot_clicked         On mascot click (if we wire it later)
 *   volta_checkout_started       On checkout button click
 */
(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];
  function push(event, payload) {
    window.dataLayer.push(Object.assign({ event: event }, payload || {}));
    // Klaviyo
    try {
      const _learnq = window._learnq || (window._learnq = []);
      _learnq.push(['track', event, payload || {}]);
    } catch (_) {}
    // Meta Pixel — translate Volta events to Meta standard where applicable
    try {
      if (!window.fbq) return;
      if (event === 'volta_add_to_cart') {
        window.fbq('track', 'AddToCart', {
          content_ids: payload?.product_id ? [String(payload.product_id)] : undefined,
          content_type: 'product',
          value: payload?.price ? payload.price / 100 : undefined,
          currency: payload?.currency || 'EUR',
        });
      } else if (event === 'volta_checkout_started') {
        window.fbq('track', 'InitiateCheckout');
      }
    } catch (_) {}
  }

  // Page view
  push('volta_page_view', {
    path: location.pathname,
    locale: document.documentElement.lang,
  });

  // Add to cart
  document.addEventListener('volta:cart:added', (e) => {
    const item = e.detail || {};
    push('volta_add_to_cart', {
      product_id: item.product_id,
      variant_id: item.variant_id || item.id,
      price: item.final_price || item.price,
      quantity: item.quantity || 1,
      subscription: !!item.selling_plan_allocation,
      currency: window.Shopify?.currency?.active || 'EUR',
    });
  });

  // Subscription toggle
  document.addEventListener('change', (e) => {
    if (!e.target.matches('[data-volta-sub-value]')) return;
    if (!e.target.value) return; // switched to one-time
    push('volta_subscription_selected', {
      selling_plan_id: e.target.value,
    });
  });

  // Cursor engaged — fire once per session
  (function () {
    if (sessionStorage.getItem('volta_cursor_engaged') === '1') return;
    let fired = false;
    document.addEventListener('pointerenter', (e) => {
      if (fired) return;
      if (!e.target || !e.target.matches || !e.target.matches('a, button, [data-cursor]')) return;
      fired = true;
      sessionStorage.setItem('volta_cursor_engaged', '1');
      push('volta_cursor_engaged');
    }, true);
  })();

  // Checkout button
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-volta-checkout]')) return;
    push('volta_checkout_started', { source: 'drawer' });
  });

  // Core Web Vitals
  (function () {
    if (!('PerformanceObserver' in window)) return;
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) push('web_vital', { name: 'LCP', value: Math.round(last.startTime) });
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (_) {}

    let clsValue = 0;
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) clsValue += entry.value;
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          push('web_vital', { name: 'CLS', value: Math.round(clsValue * 1000) / 1000 });
        }
      }, { once: true });
    } catch (_) {}

    try {
      const inpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.interactionId) {
            push('web_vital', { name: 'INP', value: Math.round(entry.duration) });
          }
        }
      });
      inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 40 });
    } catch (_) {}
  })();

  window.VoltaEvents = { push: push };
})();
