/*
 * volta-header.js
 * Sticky header behavior — hides on scroll-down, shows on scroll-up.
 * Works with or without Lenis.
 */
(function () {
  'use strict';

  class VoltaHeader extends HTMLElement {
    constructor() {
      super();
      this.lastY = 0;
      this.threshold = 8;
    }

    connectedCallback() {
      this.addEventListener('pointerleave', this._onLeave.bind(this));
      if (window.Shopify && window.Shopify.designMode) return; // don't hide in editor
      window.addEventListener('scroll', this._onScroll.bind(this), { passive: true });
      // Cart count from window.cart.item_count via volta-cart.js dispatches
      document.addEventListener('volta:cart:updated', this._updateCartCount.bind(this));
    }

    _onScroll() {
      const y = window.scrollY;
      const scrolled = y > 8;
      this.classList.toggle('is-scrolled', scrolled);

      if (Math.abs(y - this.lastY) < this.threshold) return;
      if (y > this.lastY && y > 120) {
        this.classList.add('is-hidden');
      } else {
        this.classList.remove('is-hidden');
      }
      this.lastY = y;
    }

    _onLeave() {
      // Show header when mouse leaves (user reaching for nav)
      this.classList.remove('is-hidden');
    }

    _updateCartCount(e) {
      const count = e.detail && typeof e.detail.item_count === 'number' ? e.detail.item_count : null;
      if (count === null) return;
      const el = this.querySelector('[data-volta-cart-count]');
      const link = this.querySelector('[data-volta-cart-toggle]');
      if (el) el.textContent = String(count);
      if (link) link.setAttribute('data-count', String(count));
    }
  }

  if (!customElements.get('volta-header')) {
    customElements.define('volta-header', VoltaHeader);
  }

  // Initialize cart count attribute on load
  document.addEventListener('DOMContentLoaded', function () {
    const link = document.querySelector('[data-volta-cart-toggle]');
    const countEl = document.querySelector('[data-volta-cart-count]');
    if (link && countEl) link.setAttribute('data-count', countEl.textContent.trim());
  });
})();
