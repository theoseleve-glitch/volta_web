# Performance Audit — Scaffold Summary

Status as of **Prompt 11** run (2026-04-17). Live-URL Lighthouse is deferred until a dev theme exists; this doc captures the static optimizations already in place and the ones blocked on a live preview.

## Hard targets (from `CLAUDE.md`)

| Metric | Target | Status |
|---|---|---|
| Lighthouse Performance (mobile) | ≥ 90 | **Pending live URL** |
| Lighthouse Accessibility | ≥ 95 | **Pending live URL** |
| LCP (mobile 4G) | < 2.5s | **Pending RUM** |
| CLS | < 0.1 | Structurally enforced (explicit `width`/`height` on all `<img>` via `image_tag` filter) |
| Scroll FPS | 60 | Structurally enforced (animate only `transform` + `opacity`; GSAP ticker sync) |
| `shopify theme check` | 0 errors | ✅ Clean |
| Theme size | < 5 MB zipped | Unknown (depends on product imagery) |

## Checks that passed locally

### Script loading
- All third-party CDN scripts (GSAP, ScrollTrigger, Lenis) load with `defer`
- All local `volta-*.js` files load with `defer`
- No render-blocking scripts in `<head>`
- `shopify:section:load` listener wired in `volta-motion.js` so Theme Editor live-reload doesn't leak ScrollTriggers

### CSS delivery
- `volta-tokens.css` loads after `base.css` with a standard `stylesheet_tag` — small (~6 KB)
- Section-scoped CSS lives in `{% stylesheet %}` blocks per section (Dawn bundles these into a single request)
- No `@import` chains
- Font loading: Google Fonts preconnected in `<head>`, one `rel="preload"` for the display CSS, `display=swap` on all faces

### Image handling
- Every `<img>` in Volta sections rendered via Shopify's `image_tag` filter → automatic `width` + `height` attributes → no CLS from unsized images
- Hero mascot is inline SVG (no image request, no LCP contribution)
- Products grid images: `loading="lazy"`, `sizes="(min-width: 900px) 40vw, 90vw"`
- Product page main image: `loading="eager"` + `fetchpriority="high"` (it's the LCP candidate)
- Noise/grain overlay via SVG data URL — zero network cost

### JS correctness
- `volta-motion.js` uses `gsap.ticker` (single RAF) — no per-element `requestAnimationFrame` loops
- `volta-cursor.js` uses `quickTo` — no scroll listeners, just `pointermove` which runs on compositor thread
- `volta-cart.js` uses delegated event handlers on the drawer root — not N listeners for N line items
- Free-shipping progress bar uses `transform: scaleX()` — no layout thrash

### Animation discipline
Audited every `gsap.to` / `gsap.set` / `gsap.timeline`:
- Hero mascot idle: animates `scale` + `y` on root (`transform` only)
- Cursor: animates `x`/`y` on root (`transform` only via GSAP)
- Product image scrub: animates `scale` + `rotate` (both `transform`)
- Cart drawer open: animates `transform: translateX()` via CSS
- **No animations of `width`, `height`, `top`, `left`, `margin`, `padding`, or `box-shadow`**

### Mascot SVG complexity
- Path count: 1 body + 2 eyes + 2 pupils + 1 mouth + 2 fists (each ~4 elements) = ~13 elements
- Well under the "50 path" threshold flagged in the perf rules

## Blocked on live preview

These three checks require a deployed Shopify dev theme:

1. **Lighthouse mobile**: `npx lighthouse https://<dev-theme-url> --preset=perf --form-factor=mobile`
2. **Real-user Core Web Vitals**: collected via GTM + `web-vitals` library (wired in Prompt 13), reports to dataLayer
3. **`shopify theme push --dry-run` size check**: requires CLI auth

### Run order once the dev theme is live

```bash
# 1. Get dev theme URL
shopify theme list

# 2. Run Lighthouse against the dev theme (homepage + product page)
npx lighthouse https://<dev-theme-url>          --preset=perf --form-factor=mobile --output=json --output-path=./lighthouse-home.json
npx lighthouse https://<dev-theme-url>/products/ginger-classic --preset=perf --form-factor=mobile --output=json --output-path=./lighthouse-product.json

# 3. Axe accessibility
npx @axe-core/cli https://<dev-theme-url>

# 4. Theme size
shopify theme push --dry-run --json | jq '.files | length, (.files | map(.size) | add)'
```

## Known optimizations deferred to post-launch

These are not required to ship but should be queued for post-launch iteration:

1. **Critical CSS inlining for hero** — move the `.v-hero` layout CSS into an inline `<style>` in `<head>`, load the rest async. Only meaningful if LCP is > 2s after Prompt 13 completes. Measure first.
2. **Self-host Google Fonts** if Google Fonts adds > 200ms to LCP (measure via Lighthouse). Dawn already self-hosts Shopify fonts; Volta currently uses Google CDN.
3. **Preload the hero background noise SVG** — currently not preloaded but it's tiny (~200 bytes in data URL), probably not worth the effort.
4. **HTTP/2 prioritization** for CDN scripts — Shopify's CDN handles this.
5. **Section Rendering API for cart drawer** — we render line items via client-side DOM construction. Using Section Rendering API for a dedicated `volta-cart-drawer-fragment` section would move the render to the server. Not blocking, but safer with custom metafields and better SSR.
