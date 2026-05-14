/**
 * volta-lightning.js
 * Lightning bolts scheduler + floating sparks for the Charged Hero.
 *
 * Expected DOM hooks (created by sections/volta-hero.liquid):
 *   #v-bolts-layer  — SVG <svg> element; JS appends <path> children directly
 *   #v-sparks-layer — empty <div>; JS injects <span class="v-spark"> children
 *
 * Spark animation is driven by the CSS class "v-spark" (rise keyframe) defined
 * in sections/volta-hero.liquid. This file only creates the DOM nodes.
 *
 * Guards (all must pass for animation to start):
 *   1. prefers-reduced-motion is NOT 'reduce'
 *   2. window.Shopify.designMode is NOT true (Theme Editor disables motion)
 *   3. The hero container is in the viewport (IntersectionObserver pauses bolts)
 */
(function () {
  'use strict';

  // Guard 1: reduced motion — skip entirely, no observer set up
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Guard 2: Shopify Theme Editor — skip entirely
  if (window.Shopify && window.Shopify.designMode === true) return;

  // ─────────────────────────────────────────────────────────────
  // INIT — runs once per valid page load (or section:load event)
  // ─────────────────────────────────────────────────────────────
  function initLightning() {
    const bolts = document.querySelector('#v-bolts-layer');
    const sparks = document.querySelector('#v-sparks-layer');
    if (!bolts || !sparks) return; // hero not present on this page

    // Guard 3: IntersectionObserver — pause bolts when hero is off-screen
    let running = true;
    const hero = bolts.parentElement;
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          running = e.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    io.observe(hero);

    // ─────── PORTED FROM docs/volta-design-extract/waitlist/project/index.html:511-620 ───────

    // --- LIGHTNING BOLTS (lines 514-604) ---

    function addPath(d, width, type) {
      // Pick a colour: 15% chance of yellow, 85% green
      var color = Math.random() < 0.15 ? '#FBEE49' : '#78ff88';

      // Core stroke path
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      p.setAttribute('stroke', color);
      p.setAttribute('stroke-width', width);
      p.setAttribute('opacity', '0');
      p.setAttribute('fill', 'none');
      bolts.appendChild(p);

      // Outer glow clone (wider, blurred)
      var g = p.cloneNode();
      g.setAttribute('stroke', color);
      g.setAttribute('stroke-width', width * 4);
      g.setAttribute('opacity', '0');
      g.style.filter = 'blur(6px)';
      bolts.insertBefore(g, p);

      var life = 120 + Math.random() * 180;
      var flickers = type === 'main' ? 3 : 2;
      var start = performance.now();

      function tick(now) {
        var t = now - start;
        if (t > life) {
          p.remove();
          g.remove();
          return;
        }
        var progress = t / life;
        var phase = Math.sin(progress * Math.PI * flickers * 2);
        var op = Math.max(0, (1 - progress) * (0.3 + phase * 0.7));
        p.setAttribute('opacity', op.toFixed(3));
        g.setAttribute('opacity', (op * 0.5).toFixed(3));
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    function randBolt() {
      var sides = ['top', 'right', 'bottom', 'left'];
      var startSide = sides[Math.floor(Math.random() * 4)];
      var side2 = sides[Math.floor(Math.random() * 4)];
      while (side2 === startSide) side2 = sides[Math.floor(Math.random() * 4)];

      function coord(s) {
        var t = Math.random();
        if (s === 'top')    return [t * 1000, -20];
        if (s === 'bottom') return [t * 1000, 1020];
        if (s === 'left')   return [-20, t * 1000];
        return [1020, t * 1000];
      }

      var start = coord(startSide);
      var x1 = start[0], y1 = start[1];
      var end = coord(side2);
      var x2 = end[0], y2 = end[1];

      var segs = 10 + Math.floor(Math.random() * 6);
      var pts = [[x1, y1]];

      for (var i = 1; i < segs; i++) {
        var t = i / segs;
        var mx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 140;
        var my = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 140;
        pts.push([mx, my]);

        // occasional branch (~25% chance, not first or last segment)
        if (Math.random() < 0.25 && i > 1 && i < segs - 1) {
          var last = pts[pts.length - 1];
          var bx = last[0], by = last[1];
          var branch = 'M ' + bx + ' ' + by;
          var cx = bx, cy = by;
          var blen = 3 + Math.floor(Math.random() * 4);
          for (var j = 0; j < blen; j++) {
            cx += (Math.random() - 0.5) * 120;
            cy += (Math.random() - 0.5) * 120;
            branch += ' L ' + cx + ' ' + cy;
          }
          addPath(branch, 1 + Math.random() * 1, 'branch');
        }
      }

      pts.push([x2, y2]);
      var d = 'M ' + pts.map(function (p) { return p.join(' '); }).join(' L ');
      addPath(d, 2 + Math.random() * 1.5, 'main');
    }

    function scheduleBolts() {
      // Guard 3: only spawn when hero is visible
      if (running) {
        var burst = Math.random() < 0.3 ? 2 + Math.floor(Math.random() * 2) : 1;
        for (var i = 0; i < burst; i++) {
          setTimeout(randBolt, i * 80);
        }
      }
      // Always re-schedule so bolts resume automatically when hero scrolls back in
      var next = 900 + Math.random() * 2200;
      setTimeout(scheduleBolts, next);
    }
    scheduleBolts();

    // --- FLOATING SPARKS (lines 607-620) ---
    // Spans use class "v-spark" — the rise CSS keyframe lives in volta-hero.liquid.
    // Sparks are created once; their CSS animation loops indefinitely.

    for (var s = 0; s < 18; s++) {
      var span = document.createElement('span');
      span.className = 'v-spark';
      span.style.left = Math.random() * 100 + '%';
      span.style.bottom = -Math.random() * 30 + 'px';
      span.style.animationDuration = (10 + Math.random() * 16) + 's';
      span.style.animationDelay = -Math.random() * 20 + 's';
      span.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
      span.style.opacity = String(Math.random() * 0.7 + 0.3);
      // ~30% of sparks glow green instead of yellow
      if (Math.random() < 0.3) {
        span.style.background = '#78ff88';
        span.style.boxShadow = '0 0 10px #78ff88';
      }
      sparks.appendChild(span);
    }

    // ─────── END PORT ───────
  }

  // ─────────────────────────────────────────────────────────────
  // BOOT — wait for DOM, then init
  // ─────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightning, { once: true });
  } else {
    initLightning();
  }

  // Theme Editor: re-run when the hero section is injected at runtime
  document.addEventListener('shopify:section:load', function (e) {
    if (e.target.querySelector('#v-bolts-layer')) initLightning();
  });

})();
