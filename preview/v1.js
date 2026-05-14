/* ══════════════════════════════════════════════════════════
   VOLTA V1 — motion + interaction
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  if (isTouch) document.body.classList.add('touch');

  // ── Preloader ───────────────────────────────────────────
  document.documentElement.classList.add('is-loading');
  const pre = document.getElementById('pre');
  const preN = document.getElementById('pre-n');
  let preStart = performance.now();
  function tickPre() {
    const elapsed = performance.now() - preStart;
    const targetTime = 1400;
    const p = Math.min(elapsed / targetTime, 1);
    if (preN) preN.textContent = Math.floor(p * 100);
    if (p < 1) requestAnimationFrame(tickPre);
    else {
      pre.classList.add('is-done');
      document.documentElement.classList.remove('is-loading');
      onLoaded();
    }
  }
  window.addEventListener('load', () => requestAnimationFrame(tickPre));
  // Fallback if load event already fired
  if (document.readyState === 'complete') requestAnimationFrame(tickPre);

  function onLoaded() {
    document.dispatchEvent(new CustomEvent('volta:loaded'));
  }

  // ── Lenis + GSAP sync ───────────────────────────────────
  function initMotion() {
    if (reduced || typeof window.gsap === 'undefined' || typeof window.Lenis === 'undefined') return;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;

    // ── Headline letter drop ─────────────────────────────
    const heads = document.querySelectorAll('.hero__head, .section-head h2');
    heads.forEach((el) => {
      const text = el.dataset.text || el.textContent.trim();
      // Skip if innerHTML already has spans (e.g. <br>, <em>)
      if (el.querySelector('em, br, span')) return;
      el.textContent = '';
      const words = text.split(/\s+/);
      words.forEach((word, wi) => {
        const wordEl = document.createElement('span');
        wordEl.className = 'word';
        [...word].forEach((ch) => {
          const s = document.createElement('span');
          s.className = 'ltr';
          s.textContent = ch;
          wordEl.appendChild(s);
        });
        el.appendChild(wordEl);
        if (wi < words.length - 1) {
          const sp = document.createElement('span');
          sp.className = 'sp';
          sp.textContent = '\u00a0';
          el.appendChild(sp);
        }
      });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          el.querySelectorAll('.ltr, .sp').forEach((s, i) => {
            setTimeout(() => s.classList.add('in'), i * 40);
          });
        },
      });
    });

    // ── Section reveals ──────────────────────────────────
    const reveal = (sel, opts = {}) => {
      document.querySelectorAll(sel).forEach((el) => {
        gsap.fromTo(el,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1, y: 0,
            duration: 0.9, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: opts.start || 'top 88%', once: true },
            ...opts.gsap,
          });
      });
    };
    reveal('.flavor');
    reveal('.manifesto__copy');
    reveal('.manifesto__visual', { gsap: { x: 0, duration: 1.1 } });
    reveal('.builder__composer');
    reveal('.offer');
    reveal('.faq__item');
    reveal('.footer__newsletter > *');

    // ── Sticky nav behavior ──────────────────────────────
    const nav = document.getElementById('nav');
    let lastY = 0;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        nav.classList.toggle('is-scrolled', y > 8);
        if (Math.abs(y - lastY) > 8) {
          if (y > lastY && y > 120) nav.classList.add('is-hidden');
          else nav.classList.remove('is-hidden');
          lastY = y;
        }
      },
    });

    // ── Shot section: stick-on pin with number scrub ─────
    // (Optional polish — keeps the 60ml number pinned briefly)

    // ── Custom cursor ────────────────────────────────────
    if (!isTouch) {
      const cursor = document.querySelector('.cursor');
      const dot = cursor.querySelector('.cursor__dot');
      const ring = cursor.querySelector('.cursor__ring');
      const label = cursor.querySelector('.cursor__label');
      const xD = gsap.quickTo(dot, 'x', { duration: 0.18, ease: 'power3.out' });
      const yD = gsap.quickTo(dot, 'y', { duration: 0.18, ease: 'power3.out' });
      const xR = gsap.quickTo(ring, 'x', { duration: 0.32, ease: 'power3.out' });
      const yR = gsap.quickTo(ring, 'y', { duration: 0.32, ease: 'power3.out' });
      const xL = gsap.quickTo(label, 'x', { duration: 0.32, ease: 'power3.out' });
      const yL = gsap.quickTo(label, 'y', { duration: 0.32, ease: 'power3.out' });
      window.addEventListener('pointermove', (e) => {
        xD(e.clientX); yD(e.clientY);
        xR(e.clientX); yR(e.clientY);
        xL(e.clientX); yL(e.clientY);
      }, { passive: true });

      document.querySelectorAll('a, button, [data-cursor="hover"]').forEach((el) => {
        el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
        el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
      });
      document.querySelectorAll('[data-cursor="view"]').forEach((el) => {
        el.addEventListener('pointerenter', () => {
          cursor.classList.add('is-view');
          label.textContent = el.dataset.cursorLabel || 'VIEW';
        });
        el.addEventListener('pointerleave', () => cursor.classList.remove('is-view'));
      });
    }

    // ── Magnetic CTAs ────────────────────────────────────
    if (!isTouch) {
      const mags = document.querySelectorAll('.v-magnetic');
      mags.forEach((el) => {
        const qx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
        const qy = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
        const radius = 90;
        const strength = 0.28;
        el.addEventListener('pointermove', (e) => {
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.hypot(dx, dy);
          if (dist < radius) {
            qx(dx * strength);
            qy(dy * strength);
          } else { qx(0); qy(0); }
        });
        el.addEventListener('pointerleave', () => { qx(0); qy(0); });
      });
    }
  }

  // ── Subscription mixer (variable pack size + free-form quantity) ──
  // TARGET is the *suggested* total — set by the user via .preset[data-size]
  // buttons. Presets snap to ratios that sum to TARGET, but +/- on each flavor
  // row is free-form: the user can go above or below TARGET freely.
  // Add pack sizes by adding a button: <button class="preset" data-size="N">.
  function initComposer() {
    const composer = document.querySelector('.builder__composer');
    if (!composer) return;
    const FLAVORS = ['focus', 'kick', 'green', 'fire'];
    let TARGET = parseInt(composer.dataset.total, 10) || 24;

    // Ratios sum to 1 — multiplied by TARGET to produce concrete shot counts.
    const PRESET_RATIOS = {
      balanced: { focus: 0.25,  kick: 0.25,  green: 0.25,  fire: 0.25 },
      focus:    { focus: 10/24, kick: 4/24,  green: 6/24,  fire: 4/24 },
      kick:     { focus: 4/24,  kick: 10/24, green: 4/24,  fire: 6/24 },
      green:    { focus: 6/24,  kick: 4/24,  green: 10/24, fire: 4/24 },
      fire:     { focus: 4/24,  kick: 4/24,  green: 4/24,  fire: 12/24 },
    };

    function presetFor(name) {
      const ratios = PRESET_RATIOS[name];
      if (!ratios) return null;
      const rounded = FLAVORS.map((f) => Math.round(ratios[f] * TARGET));
      // Push any rounding drift into the dominant flavor of the preset
      // so totals always equal TARGET exactly.
      const drift = TARGET - rounded.reduce((s, v) => s + v, 0);
      const dominantIdx = FLAVORS.reduce(
        (best, f, i) => (ratios[f] > ratios[FLAVORS[best]] ? i : best), 0);
      rounded[dominantIdx] += drift;
      return Object.fromEntries(FLAVORS.map((f, i) => [f, rounded[i]]));
    }

    const state = presetFor('balanced');

    const $val  = Object.fromEntries(FLAVORS.map((f) => [f, composer.querySelector(`[data-val="${f}"]`)]));
    const $seg  = Object.fromEntries(FLAVORS.map((f) => [f, composer.querySelector(`.mix-seg--${f}`)]));
    const $row  = Object.fromEntries(FLAVORS.map((f) => [f, composer.querySelector(`.mix-row[data-flavor="${f}"]`)]));
    const $btns = Object.fromEntries(FLAVORS.map((f) => [f, $row[f].querySelectorAll('.mix-btn')]));
    const $mixPresets = composer.querySelectorAll('.preset[data-preset]');
    const $sizeBtns   = composer.querySelectorAll('.preset[data-size]');
    const $hintTotal  = composer.querySelector('.mix-hint__total');

    function detectPreset() {
      for (const name of Object.keys(PRESET_RATIOS)) {
        const target = presetFor(name);
        if (FLAVORS.every((f) => state[f] === target[f])) return name;
      }
      return null;
    }

    function render(bumped) {
      const total = FLAVORS.reduce((s, f) => s + state[f], 0);
      FLAVORS.forEach((f) => {
        $val[f].textContent = state[f];
        // Mix-bar segments are proportional to the actual total so the bar
        // always fills cleanly — even when the user is above or below TARGET.
        $seg[f].style.setProperty('--pct', total > 0 ? (state[f] / total) * 100 : 0);
        $btns[f][0].disabled = state[f] <= 0;
        // Per-flavor safety cap. The *total* is uncapped — the sum of all
        // four can exceed TARGET, which is exactly how the user goes from 24 → 25.
        $btns[f][1].disabled = state[f] >= TARGET;
      });
      if (bumped) {
        $val[bumped].classList.add('is-bumped');
        setTimeout(() => $val[bumped].classList.remove('is-bumped'), 250);
      }
      if ($hintTotal) $hintTotal.textContent = `${total}/${TARGET}`;

      // Preset buttons: dynamic count summary in <span> + pressed state
      const matched = detectPreset();
      $mixPresets.forEach((b) => {
        const name = b.dataset.preset;
        const target = presetFor(name);
        const span = b.querySelector('span');
        if (span && target) span.textContent = FLAVORS.map((f) => target[f]).join('·');
        b.setAttribute('aria-pressed', name === matched ? 'true' : 'false');
      });

      // Pack-size buttons: pressed state matches current TARGET
      $sizeBtns.forEach((b) => {
        b.setAttribute('aria-pressed',
          parseInt(b.dataset.size, 10) === TARGET ? 'true' : 'false');
      });
    }

    function adjust(flavor, delta) {
      // Free-form: each +/- modifies that flavor only. No auto-rebalance,
      // so the total can drift above or below TARGET as the user wants.
      if (delta > 0) {
        if (state[flavor] >= TARGET) return;  // per-flavor safety cap
        state[flavor] += 1;
      } else {
        if (state[flavor] <= 0) return;
        state[flavor] -= 1;
      }
      render(flavor);
    }

    function setTarget(newTarget) {
      if (!Number.isFinite(newTarget) || newTarget <= 0 || newTarget === TARGET) return;
      TARGET = newTarget;
      composer.dataset.total = String(newTarget);
      // Snap to balanced at the new size — predictable, avoids weird drift
      Object.assign(state, presetFor('balanced'));
      render();
    }

    composer.addEventListener('click', (e) => {
      const sizeBtn = e.target.closest('.preset[data-size]');
      if (sizeBtn) {
        setTarget(parseInt(sizeBtn.dataset.size, 10));
        return;
      }
      const mixBtn = e.target.closest('.mix-btn');
      if (mixBtn) {
        const row = mixBtn.closest('.mix-row');
        const flavor = row.dataset.flavor;
        const delta = parseInt(mixBtn.dataset.delta, 10) || 0;
        adjust(flavor, delta);
        return;
      }
      const presetBtn = e.target.closest('.preset[data-preset]');
      if (presetBtn) {
        const target = presetFor(presetBtn.dataset.preset);
        if (!target) return;
        Object.assign(state, target);
        render();
      }
    });

    render();
  }

  // ── Pre-order CTA (stub — wire to D1 later) ──────────────
  function initPreorder() {
    const btn = document.getElementById('preorder-cta');
    if (!btn) return;
    btn.addEventListener('click', () => {
      // Scroll to newsletter / capture email
      const footer = document.getElementById('footer');
      if (footer && window.__lenis) window.__lenis.scrollTo(footer, { duration: 1.4 });
      else if (footer) footer.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ── Newsletter form (local only for now) ─────────────────
  function initNewsletter() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type=email]').value.trim();
      if (!email) return;
      // TODO: POST to /api/waitlist (same D1 backend)
      form.querySelector('button').textContent = 'Inscrit ✓';
      form.querySelector('button').disabled = true;
      console.log('[volta] newsletter submit (stub):', email);
    });
  }

  // ── Boot ─────────────────────────────────────────────────
  function boot() {
    initMotion();
    initComposer();
    initPreorder();
    initNewsletter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
