/*
 * volta-mascot.js
 * VoltaMascot class — controls a single mascot SVG's animation states.
 * States: idle, charging, discharge, punch, celebrate, sad.
 * Instances self-register and listen for cart events + scroll triggers.
 *
 * Replace with a Lottie-backed VoltaMascot once the client delivers a
 * polished Lottie JSON — the public API (setState, punch, celebrate) stays
 * identical so callers don't change.
 */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const designMode = !!(window.Shopify && window.Shopify.designMode);

  class VoltaMascot {
    constructor(root) {
      this.root = root;
      this.variant = root.className.match(/v-mascot--(\w+)/)?.[1] || 'hero';
      this.scrollMode = root.getAttribute('data-mascot-scroll') || 'idle';
      this.state = 'idle';
      this.idleTimeline = null;

      this._cacheParts();
      if (reduceMotion || designMode || !window.gsap) {
        // Static happy pose — no animation
        return;
      }

      this._startIdle();
      this._bindCursor();
      this._bindScroll();
      this._bindCartEvents();
    }

    _cacheParts() {
      this.body = this.root.querySelector('#v-mascot-body');
      this.leftEye = this.root.querySelector('#v-mascot-left-eye');
      this.rightEye = this.root.querySelector('#v-mascot-right-eye');
      this.leftPupil = this.root.querySelector('#v-mascot-left-pupil');
      this.rightPupil = this.root.querySelector('#v-mascot-right-pupil');
      this.mouth = this.root.querySelector('#v-mascot-mouth');
      this.leftFist = this.root.querySelector('#v-mascot-left-fist');
      this.rightFist = this.root.querySelector('#v-mascot-right-fist');
    }

    _startIdle() {
      const gsap = window.gsap;
      if (this.idleTimeline) this.idleTimeline.kill();
      this.idleTimeline = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } });
      this.idleTimeline.to(this.root, { scale: 1.02, duration: 1.5 });
      if (this.body) this.idleTimeline.to(this.body, { y: -2, duration: 1.5 }, 0);
    }

    _bindCursor() {
      if (!this.leftPupil || !this.rightPupil) return;
      const gsap = window.gsap;
      const radius = 3;

      window.addEventListener('pointermove', (e) => {
        const r = this.root.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = (e.clientX - cx) / r.width;
        const dy = (e.clientY - cy) / r.height;
        const x = Math.max(-1, Math.min(1, dx * 2)) * radius;
        const y = Math.max(-1, Math.min(1, dy * 2)) * radius;
        gsap.to([this.leftPupil, this.rightPupil], { x, y, duration: 0.4, ease: 'power2.out' });
      }, { passive: true });
    }

    _bindScroll() {
      if (this.scrollMode !== 'charge' || !window.ScrollTrigger) return;
      const gsap = window.gsap;
      const section = this.root.closest('section') || this.root.parentElement;
      if (!section) return;

      window.ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const p = self.progress;
          // For SVG mode: tween the body fill; for PNG mode: tween root brightness
          if (this.body) {
            gsap.to(this.body, { fillOpacity: 0.5 + 0.5 * p, duration: 0.2, overwrite: 'auto' });
          } else {
            gsap.to(this.root, { filter: 'brightness(' + (0.85 + 0.25 * p) + ')', duration: 0.2, overwrite: 'auto' });
          }
          if (p > 0.5 && this.state !== 'charging') this.setState('charging');
          if (p < 0.2 && this.state !== 'idle') this.setState('idle');
        },
      });
    }

    _bindCartEvents() {
      document.addEventListener('volta:cart:added', () => {
        if (this.variant === 'hero' || this.variant === 'drawer') this.punch();
      });
      document.addEventListener('volta:cart:cleared', () => {
        if (this.variant === 'drawer') this.setState('sad');
      });
      document.addEventListener('volta:checkout:success', () => this.celebrate());
    }

    setState(state) {
      const gsap = window.gsap;
      this.state = state;
      this.root.setAttribute('data-mascot-state', state);

      switch (state) {
        case 'charging':
          if (this.leftPupil) gsap.to([this.leftPupil, this.rightPupil], { fill: 'var(--volta-yellow, #FDE047)', duration: 0.3 });
          gsap.to(this.root, { scale: 1.05, duration: 0.3 });
          break;
        case 'sad':
          if (this.mouth) gsap.to(this.mouth, { attr: { d: 'M 82 112 Q 94 102 106 112' }, duration: 0.4 });
          if (this.leftPupil) gsap.to([this.leftPupil, this.rightPupil], { y: 2, duration: 0.3 });
          // PNG mode — just droop slightly
          if (!this.body) gsap.to(this.root, { scaleY: 0.97, rotation: -3, duration: 0.4 });
          break;
        case 'idle':
        default:
          if (this.leftPupil) gsap.to([this.leftPupil, this.rightPupil], { fill: 'var(--volta-ink, #0E0E10)', y: 0, duration: 0.3 });
          if (this.mouth) gsap.to(this.mouth, { attr: { d: 'M 82 108 Q 94 118 106 108' }, duration: 0.4 });
          gsap.to(this.root, { scale: 1, scaleY: 1, rotation: 0, duration: 0.3 });
          break;
      }
    }

    punch() {
      const gsap = window.gsap;
      if (this.leftFist) {
        gsap.timeline()
          .to(this.leftFist, { x: 24, y: -8, rotate: -20, duration: 0.18, ease: 'power3.out' })
          .to(this.leftFist, { x: 0, y: 0, rotate: 0, duration: 0.3, ease: 'power3.inOut' });
      } else {
        // PNG mode — thrust whole image
        gsap.timeline()
          .to(this.root, { x: 16, rotate: -6, duration: 0.15, ease: 'power3.out' })
          .to(this.root, { x: 0, rotate: 0, duration: 0.3, ease: 'elastic.out(1, 0.5)' });
      }
    }

    celebrate() {
      const gsap = window.gsap;
      gsap.timeline()
        .to(this.root, { y: -40, duration: 0.3, ease: 'power2.out' })
        .to(this.root, { y: 0, duration: 0.5, ease: 'bounce.out' });
      if (this.leftFist) {
        gsap.to([this.leftFist, this.rightFist], { y: -20, rotate: -10, duration: 0.3, yoyo: true, repeat: 1 });
      }
    }

    discharge() {
      const gsap = window.gsap;
      gsap.timeline()
        .to(this.root, { scale: 1.3, duration: 0.15, ease: 'power3.out' })
        .to(this.root, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.5)' });
    }
  }

  function initAll() {
    document.querySelectorAll('[data-volta-mascot]').forEach((el) => {
      if (el._voltaMascot) return;
      el._voltaMascot = new VoltaMascot(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', initAll);

  window.VoltaMascot = {
    ready: true,
    init: initAll,
    Class: VoltaMascot,
  };
})();
