/*
 * volta-cart.js
 * Cart drawer logic. Intercepts product-form submits, calls /cart/add.js,
 * refreshes the drawer via /cart.js, updates line items + free-shipping bar.
 *
 * Public events (document):
 *   volta:cart:updated  (detail = cart JSON)
 *   volta:cart:added    (detail = added item)
 *   volta:cart:cleared
 *
 * Focus-trapped drawer; Escape closes; click-outside closes.
 */
(function () {
  'use strict';

  const drawer = document.querySelector('[data-volta-drawer]');
  if (!drawer) return;

  const overlay = drawer.querySelector('[data-volta-drawer-overlay]');
  const closeBtn = drawer.querySelector('[data-volta-drawer-close]');
  const itemsEl = drawer.querySelector('[data-volta-drawer-items]');
  const emptyEl = drawer.querySelector('[data-volta-drawer-empty]');
  const footerEl = drawer.querySelector('[data-volta-drawer-footer]');
  const subtotalEl = drawer.querySelector('[data-volta-subtotal]');
  const countEl = drawer.querySelector('[data-volta-drawer-count]');
  const shippingWrap = drawer.querySelector('[data-volta-free-shipping]');
  const shippingFill = drawer.querySelector('[data-volta-free-shipping-fill]');
  const shippingText = drawer.querySelector('[data-volta-free-shipping-text]');

  const freeThreshold = parseInt(drawer.dataset.freeThreshold, 10) || 2500;
  let previousFocus = null;

  function open() {
    previousFocus = document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.VoltaMotion?.lenis) window.VoltaMotion.lenis.stop();
    setTimeout(() => closeBtn?.focus(), 100);
    document.dispatchEvent(new CustomEvent('volta:drawer:open'));
  }

  function close() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (window.VoltaMotion?.lenis) window.VoltaMotion.lenis.start();
    if (previousFocus) previousFocus.focus();
    document.dispatchEvent(new CustomEvent('volta:drawer:close'));
  }

  function formatMoney(cents) {
    const locale = document.documentElement.lang || 'fr';
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency: window.Shopify?.currency?.active || 'EUR' }).format(cents / 100);
    } catch (_) {
      return (cents / 100).toFixed(2) + ' €';
    }
  }

  function updateFreeShipping(total) {
    if (!shippingWrap) return;
    const remaining = freeThreshold - total;
    if (total === 0) {
      shippingWrap.hidden = true;
      return;
    }
    shippingWrap.hidden = false;
    const pct = Math.min(100, Math.max(0, (total / freeThreshold) * 100));
    if (shippingFill) shippingFill.style.transform = 'scaleX(' + pct / 100 + ')';
    const bar = shippingWrap.querySelector('.v-drawer__progress-bar');
    if (bar) bar.setAttribute('aria-valuenow', String(Math.round(pct)));
    if (shippingText) {
      if (remaining <= 0) {
        shippingText.textContent = window.voltaCartStrings?.freeShippingUnlocked || 'Livraison offerte débloquée ✓';
      } else {
        const tpl = window.voltaCartStrings?.freeShippingRemaining || 'Plus que {amount} pour la livraison offerte';
        shippingText.textContent = tpl.replace('{amount}', formatMoney(remaining));
      }
    }
  }

  // Safely build a line-item row from JSON using DOM methods (no innerHTML for
  // untrusted fields like product_title, variant_title).
  function buildLineItem(item) {
    const li = document.createElement('li');
    li.className = 'v-drawer-item';
    li.dataset.voltaLineItem = '';
    li.dataset.key = item.key;

    const media = document.createElement('a');
    media.className = 'v-drawer-item__media';
    media.href = item.url;
    if (item.image) {
      const img = document.createElement('img');
      img.className = 'v-drawer-item__img';
      img.src = item.image;
      img.alt = item.product_title || '';
      img.loading = 'lazy';
      media.appendChild(img);
    }
    li.appendChild(media);

    const body = document.createElement('div');
    body.className = 'v-drawer-item__body';

    const titleLink = document.createElement('a');
    titleLink.className = 'v-drawer-item__title';
    titleLink.href = item.url;
    titleLink.textContent = item.product_title || '';
    body.appendChild(titleLink);

    if (item.variant_title && item.variant_title !== 'Default Title') {
      const variant = document.createElement('span');
      variant.className = 'v-mono v-drawer-item__variant';
      variant.textContent = item.variant_title;
      body.appendChild(variant);
    }

    if (item.selling_plan_allocation) {
      const badge = document.createElement('span');
      badge.className = 'v-mono v-drawer-item__badge';
      badge.textContent = item.selling_plan_allocation.selling_plan.name;
      body.appendChild(badge);
    }

    const row = document.createElement('div');
    row.className = 'v-drawer-item__row';

    const qty = document.createElement('div');
    qty.className = 'v-drawer-item__qty';
    const minusBtn = document.createElement('button');
    minusBtn.type = 'button';
    minusBtn.dataset.voltaQtyChange = '-1';
    minusBtn.textContent = '−';
    minusBtn.setAttribute('aria-label', '−');
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.min = '0';
    qtyInput.value = String(item.quantity);
    qtyInput.dataset.voltaQtyInput = '';
    const plusBtn = document.createElement('button');
    plusBtn.type = 'button';
    plusBtn.dataset.voltaQtyChange = '1';
    plusBtn.textContent = '+';
    plusBtn.setAttribute('aria-label', '+');
    qty.append(minusBtn, qtyInput, plusBtn);
    row.appendChild(qty);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'v-drawer-item__remove';
    removeBtn.dataset.voltaRemove = '';
    removeBtn.textContent = window.voltaCartStrings?.remove || 'Retirer';
    row.appendChild(removeBtn);

    body.appendChild(row);
    li.appendChild(body);

    const price = document.createElement('div');
    price.className = 'v-drawer-item__price v-mono';
    price.dataset.voltaLinePrice = '';
    price.textContent = formatMoney(item.final_line_price);
    li.appendChild(price);

    return li;
  }

  function renderFromJSON(cart) {
    if (!itemsEl) return;
    // Clear existing
    while (itemsEl.firstChild) itemsEl.removeChild(itemsEl.firstChild);
    if (cart.item_count === 0) return;
    cart.items.forEach((item) => itemsEl.appendChild(buildLineItem(item)));
  }

  async function renderItems(cart) {
    if (!itemsEl) return;
    if (cart.item_count === 0) {
      while (itemsEl.firstChild) itemsEl.removeChild(itemsEl.firstChild);
      return;
    }
    // Client-side DOM render — server-rendered section rendering would be preferable,
    // but requires wiring a dedicated section fragment. Safe-by-default.
    renderFromJSON(cart);
  }

  async function refresh() {
    try {
      const res = await fetch('/cart.js', { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('cart fetch failed');
      const cart = await res.json();
      await renderItems(cart);
      if (countEl) countEl.textContent = '(' + cart.item_count + ')';
      if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);
      if (emptyEl) emptyEl.hidden = cart.item_count > 0;
      if (footerEl) footerEl.hidden = cart.item_count === 0;
      updateFreeShipping(cart.total_price);
      document.dispatchEvent(new CustomEvent('volta:cart:updated', { detail: cart }));
      return cart;
    } catch (err) {
      console.error('[volta:cart] refresh failed', err);
      return null;
    }
  }

  async function changeLine(key, quantity) {
    const row = drawer.querySelector('[data-key="' + CSS.escape(key) + '"]');
    if (row) row.classList.add('is-updating');
    try {
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: key, quantity: quantity }),
      });
      const cart = await refresh();
      if (quantity === 0 && cart && cart.item_count === 0) {
        document.dispatchEvent(new CustomEvent('volta:cart:cleared'));
      }
    } catch (err) {
      console.error('[volta:cart] change failed', err);
      if (row) row.classList.remove('is-updating');
    }
  }

  // ── Intercept Add-to-Cart product-form submits ───────────────────────────
  document.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (!form.matches('[data-type="add-to-cart-form"]')) return;
    e.preventDefault();

    const btn = form.querySelector('[data-volta-add-to-cart]');
    if (btn) btn.disabled = true;

    const formData = new FormData(form);
    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });
      if (!res.ok) {
        console.warn('[volta:cart] add failed', res.status);
        return;
      }
      const added = await res.json();
      document.dispatchEvent(new CustomEvent('volta:cart:added', { detail: added }));
      await refresh();
      open();
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  // ── Delegated drawer interactions ────────────────────────────────────────
  drawer.addEventListener('click', (e) => {
    const qtyBtn = e.target.closest('[data-volta-qty-change]');
    const removeBtn = e.target.closest('[data-volta-remove]');
    const row = e.target.closest('[data-volta-line-item]');

    if (qtyBtn && row) {
      const input = row.querySelector('[data-volta-qty-input]');
      const delta = parseInt(qtyBtn.dataset.voltaQtyChange, 10);
      const next = Math.max(0, (parseInt(input.value, 10) || 0) + delta);
      input.value = String(next);
      changeLine(row.dataset.key, next);
    } else if (removeBtn && row) {
      changeLine(row.dataset.key, 0);
    } else if (e.target === overlay || e.target.closest('[data-volta-drawer-close]')) {
      close();
    }
  });

  drawer.addEventListener('change', (e) => {
    if (!e.target.matches('[data-volta-qty-input]')) return;
    const row = e.target.closest('[data-volta-line-item]');
    if (!row) return;
    const next = Math.max(0, parseInt(e.target.value, 10) || 0);
    changeLine(row.dataset.key, next);
  });

  // ── Cart icon → open ──────────────────────────────────────────────────────
  document.querySelectorAll('[data-volta-cart-toggle]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  });

  // ── Escape closes, focus trap ─────────────────────────────────────────────
  drawer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const focusables = drawer.querySelectorAll('a, button, input, [tabindex="0"]');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Initial hydrate
  (async () => {
    try {
      const res = await fetch('/cart.js');
      if (res.ok) {
        const cart = await res.json();
        updateFreeShipping(cart.total_price);
        document.dispatchEvent(new CustomEvent('volta:cart:updated', { detail: cart }));
      }
    } catch (_) { /* silent */ }
  })();

  window.VoltaCart = {
    ready: true,
    open: open,
    close: close,
    refresh: refresh,
    change: changeLine,
  };
})();
