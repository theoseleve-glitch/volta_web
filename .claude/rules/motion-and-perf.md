# Motion and Performance

The site is Awwwards-level ambitious AND conversion-optimized. Both are achievable — but they require discipline on every animation decision.

## Hard performance targets

These block the launch. If a change regresses any of them, fix before moving on.

| Metric | Target | Tool |
|---|---|---|
| Lighthouse mobile Performance | ≥ 90 | Lighthouse CLI or DevTools |
| LCP (mobile 4G) | < 2.5s | Web Vitals, Lighthouse |
| CLS (all pages) | < 0.1 | Web Vitals |
| INP (p75) | < 200ms | Real-user data |
| Frame rate during scroll | 60fps | DevTools Performance tab |
| Theme size | < 5 MB zipped | `shopify theme push --dry-run` |

## Animation hard rules

1. **Only animate `transform` and `opacity`.** Never: width, height, top, left, margin, padding, border-radius (unless cached via `clip-path`), box-shadow (use layered pseudo-elements instead).
2. **Use `will-change` sparingly** — only during the animation, remove after. Permanent `will-change` costs memory.
3. **Respect `prefers-reduced-motion`.** Every scroll animation, every hover effect that moves more than 8px, every auto-playing loop must have a reduced-motion branch.
4. **Never animate more than 10 elements simultaneously.** Stagger if you need more.
5. **Use `requestAnimationFrame` for any per-frame JS.** Never `setInterval` or unthrottled scroll listeners.

## GSAP patterns

- **One `ScrollTrigger.create()` per effect.** Don't chain multiple triggers with the same `trigger` element.
- **Use `scrub: true` for elements bound to scroll position**, `scrub: 1` for slightly smoothed binding, `toggleActions: "play none none reverse"` for one-shot reveals.
- **Set `start: "top 80%"` as default reveal trigger** (element enters when 80% of viewport from top).
- **Clean up on section unload** in Theme Editor: listen for `shopify:section:unload` and call `ScrollTrigger.getAll().forEach(st => st.kill())` for triggers belonging to that section.

## Lenis configuration

```js
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: false, // native scroll on mobile — lerped scroll feels wrong on touch
});
```

**Disable Lenis when:**
- `prefers-reduced-motion: reduce` matches
- `window.Shopify.designMode === true` (Theme Editor preview)
- User is on a touch-only device (optional — we keep smooth scroll on desktop only)

Sync with GSAP:
```js
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

## Image optimization

- **Use WebP or AVIF**, not PNG or JPEG for any photo or illustration.
- **Serve responsive sizes** via `{% render 'image', image: product.featured_image, sizes: '(min-width: 768px) 50vw, 100vw' %}`.
- **Explicit `width` and `height` on every `<img>`.** Prevents CLS.
- **`loading="eager"` + `fetchpriority="high"` on the LCP image** (hero product shot). Everything else: `loading="lazy"`.
- **Preload the LCP image** in `<head>`: `<link rel="preload" as="image" href="..." imagesrcset="...">`.

## Font loading

- **Preconnect to `fonts.gstatic.com`** in `<head>`.
- **Preload the primary font weight** (Bricolage Grotesque 700 for hero headline).
- **`font-display: swap`** on all faces. Prevents FOIT (Flash of Invisible Text).
- **Self-host fonts if Google Fonts adds > 200ms to load.** Measure first.

## Script loading order

In `/layout/theme.liquid`, just before `</body>`:

```html
<!-- 1. CDN libraries (defer, can load in parallel) -->
<script src="https://cdnjs.cloudflare.com/.../gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/.../ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/.../lenis.min.js" defer></script>

<!-- 2. Theme JS (defer, depends on the above) -->
{{ 'volta-motion.js' | asset_url | script_tag | replace: '<script', '<script defer' }}
{{ 'volta-cursor.js' | asset_url | script_tag | replace: '<script', '<script defer' }}
{{ 'volta-cart.js' | asset_url | script_tag | replace: '<script', '<script defer' }}
```

## CSS delivery

- **Inline critical CSS** (above-the-fold: hero layout, header, base typography) directly in `<head>`.
- **Load non-critical CSS async** via `media="print" onload="this.media='all'"` pattern or `link[rel=preload]` + `onload` swap.
- **Avoid @import in CSS** — it serializes requests.

## The signature moment (mascot)

The mascot is the site's conversion signature. It has to move without blowing perf:

- **SVG, inline.** Not `<img>`, not Lottie (unless the client provides a polished Lottie file).
- **Pre-computed paths.** Each animatable part (body, eyes, fists, mouth) has a unique `id`.
- **GSAP timelines, not CSS keyframes.** Better control, better performance on scroll-bound animations.
- **Limit simultaneous animated properties to 4–6.** Breathing + pupil tracking + slight color shift is the max idle state.
- **Pause animations when mascot is off-screen** using ScrollTrigger's `onEnter` / `onLeave` callbacks.

## Debugging perf

```bash
# Lighthouse CLI
npx lighthouse https://volta-drinks.myshopify.com --preset=perf --form-factor=mobile

# Check bundle sizes
du -sh assets/

# Identify heavy scripts
shopify theme check --category=performance
```

## What to do when perf regresses

1. **Check the Network tab first.** Is a new third-party script loading? Is an image unoptimized?
2. **Check the Performance tab.** Is there a long task > 50ms? What's blocking main thread?
3. **Run Lighthouse in incognito** (extensions can skew results).
4. **Check for layout thrashing.** Any JS reading `offsetHeight` / `getBoundingClientRect` inside a scroll or animation loop is a prime suspect.
5. **Roll back the last commit.** Bisect from there.
