/*
 * volta-product.js
 * Scroll-scrubbed product hero (scale + rotation). Variant change swaps hidden
 * input + price. Thumbnail click swaps main image. All animations respect
 * reduced-motion and designMode.
 */
(function () {
  'use strict';

  function init() {
    const root = document.querySelector('[data-volta-product]');
    if (!root) return;

    // ── Thumbnail → main image swap ─────────────────────────────────────
    const mainImg = root.querySelector('.v-product__img');
    root.querySelectorAll('.v-product__thumb').forEach((thumb) => {
      thumb.addEventListener('click', () => {
        root.querySelectorAll('.v-product__thumb').forEach((t) => t.classList.remove('is-active'));
        thumb.classList.add('is-active');
        if (mainImg) {
          mainImg.src = thumb.dataset.mediaUrl || mainImg.src;
        }
      });
    });

    // ── Variant radio → update form hidden id + price label ─────────────
    root.querySelectorAll('[data-volta-variant]').forEach((input) => {
      input.addEventListener('change', (e) => {
        root.querySelectorAll('.v-product__variant').forEach((v) => v.classList.remove('is-active'));
        e.target.closest('.v-product__variant')?.classList.add('is-active');
        const hidden = root.querySelector('[data-volta-variant-id]');
        if (hidden) hidden.value = e.target.value;
      });
    });

    // ── Quantity stepper ────────────────────────────────────────────────
    const qtyField = root.querySelector('[data-volta-qty]');
    if (qtyField) {
      root.querySelectorAll('.v-product__qty-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const current = parseInt(qtyField.value, 10) || 1;
          const next = btn.name === 'plus' ? current + 1 : Math.max(1, current - 1);
          qtyField.value = String(next);
          qtyField.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
    }

    // ── Subscription toggle → update selling_plan hidden field ──────────
    const form = root.querySelector('.v-product__add-form');
    const subInputs = root.querySelectorAll('[data-volta-sub-value]');
    subInputs.forEach((input) => {
      input.addEventListener('change', (e) => {
        root.querySelectorAll('.v-sub-toggle__option').forEach((o) => o.classList.remove('is-active'));
        e.target.closest('.v-sub-toggle__option')?.classList.add('is-active');
        if (!form) return;
        let planField = form.querySelector('input[name="selling_plan"]');
        const planId = e.target.value;
        if (planId) {
          if (!planField) {
            planField = document.createElement('input');
            planField.type = 'hidden';
            planField.name = 'selling_plan';
            form.appendChild(planField);
          }
          planField.value = planId;
        } else if (planField) {
          planField.remove();
        }
      });
    });

    // ── Scroll-scrubbed hero ───────────────────────────────────────────
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const designMode = !!(window.Shopify && window.Shopify.designMode);
    if (reduceMotion || designMode || !window.gsap || !window.ScrollTrigger || !mainImg) return;
    if (window.innerWidth < 900) return; // stacked layout on mobile — no scrub

    window.gsap.to(mainImg, {
      scale: 1.2,
      rotate: 3,
      ease: 'none',
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init on Theme Editor section reload
  document.addEventListener('shopify:section:load', init);
})();
