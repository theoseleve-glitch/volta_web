/*
 * volta-preloader.js
 * First-visit preloader. Mascot charges from 0 → 100% as page loads.
 * At 100%, discharge + wipe + reveal.
 * Skipped when: sessionStorage has already-shown flag, prefers-reduced-motion,
 * designMode, or keyboard Escape pressed.
 */
(function () {
  'use strict';

  const root = document.querySelector('[data-volta-preloader]');
  if (!root) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const designMode = !!(window.Shopify && window.Shopify.designMode);
  const alreadyShown = sessionStorage.getItem('volta_preloader_shown') === '1';

  function skip() {
    root.remove();
    document.documentElement.classList.remove('v-loading');
    document.body.classList.remove('v-loading');
    sessionStorage.setItem('volta_preloader_shown', '1');
    document.dispatchEvent(new CustomEvent('volta:preloader:done'));
  }

  if (reduceMotion || designMode || alreadyShown) {
    skip();
    return;
  }

  document.documentElement.classList.add('v-loading');
  document.body.classList.add('v-loading');

  const numEl = root.querySelector('[data-volta-preloader-num]');
  const wipe = root.querySelector('[data-volta-preloader-wipe]');
  const MIN_DURATION = 1500;
  const MAX_DURATION = 3000;
  const start = performance.now();

  let current = 0;
  function setCounter(p) {
    current = p;
    if (numEl) numEl.textContent = String(Math.round(p));
  }

  // Track page load progress: image count loaded + font ready
  let imagesLoaded = 0;
  const imgs = Array.from(document.images);
  const totalImgs = Math.max(1, imgs.length);

  imgs.forEach((img) => {
    if (img.complete) imagesLoaded++;
    img.addEventListener('load', () => imagesLoaded++);
    img.addEventListener('error', () => imagesLoaded++);
  });

  // Main tick loop
  let done = false;
  function tick() {
    if (done) return;
    const elapsed = performance.now() - start;
    const imgProgress = imagesLoaded / totalImgs;
    const timeProgress = Math.min(1, elapsed / MIN_DURATION);
    const effective = Math.min(imgProgress, timeProgress);
    // Smoothly approach target
    const target = Math.round(effective * 100);
    const next = Math.min(100, current + Math.max(1, (target - current) * 0.2));
    setCounter(next);

    if (next >= 100 || elapsed > MAX_DURATION) {
      setCounter(100);
      finish();
      return;
    }
    requestAnimationFrame(tick);
  }

  function finish() {
    done = true;
    // Wipe: yellow stripe slides from bottom to top
    if (wipe) {
      wipe.style.transform = 'translateY(0%)';
    }
    setTimeout(skip, 900);
  }

  // Keyboard skip
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !done) {
      done = true;
      skip();
    }
  });

  requestAnimationFrame(tick);
})();
