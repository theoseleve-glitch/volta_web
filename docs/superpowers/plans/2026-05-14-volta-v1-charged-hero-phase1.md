# Volta V1 Charged Hero (Phase 1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the deployed minimal V1 hero (theme `199379681617`) with a brand-true Charged Hero — indigo deep-space background with lightning bolts, floating sparks, mascot focal point, Dunbar Tall typography, and the Lenis+GSAP motion stack — grounded in `docs/volta-design-extract/`.

**Architecture:** Refactor Part B's dormant `sections/volta-hero.liquid` into a single z-stacked composition (background → grid floor → vignette → grain → lightning → sparks → mascot → corner-brackets → chrome → content → preloader). Lightning + sparks scheduler lives in a separate JS file (`assets/volta-lightning.js`) so the section stays focused and the JS can be guarded once (reduced-motion + IntersectionObserver + Shopify design-mode). Motion API (Lenis + GSAP + magnetize/reveal) loads globally via `layout/theme.liquid` so Phase 2 and 3 sections inherit it for free. Design tokens migrate to the confirmed palette + Dunbar Tall in `assets/volta-tokens.css` — single source of truth, no parallel system.

**Tech Stack:** Shopify Liquid (Dawn-based), Adobe Fonts (Typekit kit `gjt3qnf` — Dunbar Tall Ultra Italic + Extra Bold), GSAP 3.12.5 + ScrollTrigger + Lenis 1.1.18 (all CDN, deferred), the existing `assets/volta-motion.js` API.

---

## Spec reference

This plan implements **Phase 1** of `docs/superpowers/specs/2026-05-14-volta-v1-charged-multisection-design.md` — Sections 3 (Locked decisions) and 4 (Phase 1 — Charged Hero). Phases 2 + 3 will be planned separately after Phase 1 ships and is QA'd by the owner.

---

## File structure (Phase 1)

| File | Action | Responsibility |
|---|---|---|
| `assets/volta-tokens.css` | Modify | Update color values (`--volta-yellow`, `--volta-green`) + add `--volta-indigo` + replace `--font-display` value. Keep token names so legacy refs don't break. |
| `layout/theme.liquid` | Modify | Inject Typekit `<link>` in `<head>` + GSAP/ScrollTrigger/Lenis CDN scripts + `volta-motion.js` before `</body>` |
| `assets/volta-courant.svg` | Create | Brand mark (copy from `preview/assets/volta-courant.svg`) |
| `assets/volta-lightning.js` | Create | Lightning bolts scheduler + floating sparks; reduced-motion + IntersectionObserver + designMode guards |
| `snippets/volta-preloader.liquid` | Modify | Use Volta Courant + Dunbar Tall; reduced-motion bypass |
| `sections/volta-hero.liquid` | Modify (full refactor) | Charged Hero — z-stack layers, mascot, chrome, content, schema. Replaces deployed minimal hero. |
| `locales/fr.default.json` | Modify | Add Charged Hero keys (eyebrow, ticker, CTA, mascot alt) |
| `locales/en.json` | Modify | EN parity |
| `locales/fr.default.schema.json` | Modify | Schema label keys for hero settings |
| `locales/en.schema.json` | Modify | Schema label EN parity |
| `templates/index.json` | Modify | Point home at `volta-hero` (was `volta-hero-v1`) |
| `sections/volta-hero-v1.liquid` | Delete | Retired by spec |
| `assets/volta-hero-v1.css` | Delete | Retired |

---

## Phase 1 task list

### Task 1: Migrate design tokens to confirmed palette + Dunbar Tall

**Why this comes first:** Every downstream task references these tokens. Lock the source of truth before any visual file is touched.

**Files:**
- Modify: `assets/volta-tokens.css`
- Read for reference: `docs/volta-design-extract/waitlist/project/assets/colors_and_type.css`

- [ ] **Step 1: Read the design-extract token source-of-truth**

```bash
cat "docs/volta-design-extract/waitlist/project/assets/colors_and_type.css"
```

Capture from it:
- The exact hex values for indigo (`#12104b`), neon green (`#78ff88`), yellow (`#FBEE49`)
- The font-family declaration for Dunbar Tall (likely `'dunbar-tall', sans-serif`)
- Any class system (`.v-hero`, `.v-h1`, `.v-mono`, `.v-label`) — note for Task 6 reuse

- [ ] **Step 2: Read the current tokens to know what to preserve**

```bash
cat assets/volta-tokens.css
```

Note which tokens exist (spacing scale, easing, durations, z-index, motion classes). All of those stay.

- [ ] **Step 3: Apply the token migration**

Edit `assets/volta-tokens.css`:

a) **Update `--volta-yellow`** — change value from `#FDE047` to `#FBEE49`. (Token name unchanged so all existing references update automatically.)

b) **Update `--volta-green`** — change value from `#7FEFA8` to `#78ff88`.

c) **Add `--volta-indigo`** — new token, paste this declaration into the `:root {}` block right after `--volta-yellow`:

```css
  --volta-indigo: #12104b;
  --volta-indigo-deep: #0a0930;
```

d) **Replace `--font-display` value** — change from `'Bricolage Grotesque', system-ui, sans-serif` to:

```css
  --font-display: 'dunbar-tall', 'Bricolage Grotesque', system-ui, sans-serif;
```

(Bricolage Grotesque stays as a fallback during the Typekit load window; once Dunbar loads it takes over.)

e) **Keep all other tokens unchanged** — spacing, easing, durations, z-index, `.v-reveal` / `.v-cursor` classes all stay.

- [ ] **Step 4: Verify with shopify theme check**

Run:
```bash
npx shopify theme check 2>&1 | grep -i "volta-tokens" || echo "OK — no offenses on volta-tokens.css"
```

Expected: `OK — no offenses on volta-tokens.css`

- [ ] **Step 5: Commit**

```bash
git add assets/volta-tokens.css
git commit -m "feat(tokens): migrate to confirmed Volta palette + Dunbar Tall fallback chain

- Update --volta-yellow value to #FBEE49 (design-extract confirmed)
- Update --volta-green value to #78ff88 (design-extract confirmed)
- Add --volta-indigo (#12104b) + --volta-indigo-deep (#0a0930) for hero surface
- Add 'dunbar-tall' as primary --font-display with Bricolage Grotesque fallback

Token names unchanged — legacy references continue to resolve."
```

---

### Task 2: Wire Typekit + Lenis + GSAP + motion API in layout/theme.liquid

**Why this comes next:** The hero composition depends on Dunbar Tall (Typekit) and the motion API. Loading them globally means every section in Phase 2/3 inherits motion for free.

**Files:**
- Modify: `layout/theme.liquid`

- [ ] **Step 1: Read the current layout**

```bash
cat layout/theme.liquid
```

Identify two injection points:
- The end of `<head>` (just before `</head>`) — for Typekit `<link>`
- Just before `</body>` — for the CDN scripts + `volta-motion.js`

- [ ] **Step 2: Inject Typekit stylesheet in `<head>`**

Add these three lines just before the closing `</head>` tag:

```liquid
  {%- comment -%} Adobe Fonts (Typekit kit gjt3qnf — Dunbar Tall Ultra Italic + Extra Bold). Licensed for volta-drinks.myshopify.com. {%- endcomment -%}
  <link rel="preconnect" href="https://use.typekit.net" crossorigin>
  <link rel="stylesheet" href="https://use.typekit.net/gjt3qnf.css">
```

- [ ] **Step 3: Inject motion stack before `</body>`**

Add this block just before the closing `</body>` tag (in order — GSAP first, ScrollTrigger second, Lenis third, our motion API last):

```liquid
  {%- comment -%} Motion stack (deferred, CDN). volta-motion.js orchestrates Lenis + GSAP + reveal/magnetize. {%- endcomment -%}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js" defer></script>
  <script src="{{ 'volta-motion.js' | asset_url }}" defer></script>
```

- [ ] **Step 4: Verify with theme check**

```bash
npx shopify theme check 2>&1 | grep -E "theme\.liquid|RemoteAsset" || echo "OK — no new offenses"
```

There may be pre-existing `RemoteAsset` warnings on theme.liquid (Klaviyo, etc.) — those are pre-existing and acceptable. Only flag NEW offenses introduced by your edits.

- [ ] **Step 5: Commit**

```bash
git add layout/theme.liquid
git commit -m "feat(layout): wire Typekit + GSAP/Lenis CDN + volta-motion.js globally

- Add Adobe Fonts kit gjt3qnf in <head> (Dunbar Tall) with preconnect
- Add GSAP 3.12.5 + ScrollTrigger + Lenis 1.1.18 before </body>, all defer
- Load assets/volta-motion.js after CDNs so the API initializes globally

Enables motion (reveal, magnetize, parallax) for every section in Phase 1-3."
```

---

### Task 3: Port Volta Courant SVG into theme assets

**Why:** The preloader (Task 5) and the eventual footer corner mark both reference it. It needs to live in `/assets/` so Shopify's `asset_url` filter resolves it.

**Files:**
- Create: `assets/volta-courant.svg`
- Read source: `preview/assets/volta-courant.svg` (or `New folder/Volta Courant.svg` if the preview version is absent)

- [ ] **Step 1: Locate the source SVG**

```bash
ls -la preview/assets/volta-courant.svg "New folder/Volta Courant.svg" 2>&1
```

Pick the cleanest source (prefer `preview/assets/` if both exist — it's the version the prototype was developed against).

- [ ] **Step 2: Copy into theme assets**

```bash
cp "preview/assets/volta-courant.svg" assets/volta-courant.svg
```

(Adjust the source path if the previous step pointed at `New folder/` instead.)

- [ ] **Step 3: Inspect the SVG for inline width/height/viewBox**

```bash
head -c 600 assets/volta-courant.svg
```

Verify it has a `viewBox` attribute (required for responsive sizing). If width/height are hard-coded in px, they should be removed (responsive sizing comes from the CSS at the call site). If `viewBox` is missing, manually inspect and add one.

- [ ] **Step 4: Commit**

```bash
git add assets/volta-courant.svg
git commit -m "feat(assets): copy Volta Courant SVG into theme assets

Source: preview/assets/volta-courant.svg. Used by the preloader (Task 5)
and the eventual full footer corner mark (Phase 2)."
```

---

### Task 4: Create assets/volta-lightning.js — scheduler + sparks + guards

**Why now:** The hero (Task 6) embeds this script with `<script src=...>` and references the DOM hooks it creates. Building it before the hero means the section can be tested visually as soon as it's deployed.

**Files:**
- Create: `assets/volta-lightning.js`
- Read source: `docs/volta-design-extract/waitlist/project/index.html` (lines ~511-604 for lightning + sparks JS, ~21-91 for the SVG markup pattern)

- [ ] **Step 1: Read the design-extract animator code**

```bash
sed -n '500,610p' "docs/volta-design-extract/waitlist/project/index.html"
```

Identify the function(s): typically `randBolt()` that creates an SVG path, `spawnBolts()` that schedules them on setTimeout/setInterval, and a sparks helper that injects floating dots.

- [ ] **Step 2: Read the SVG markup pattern**

```bash
sed -n '21,91p' "docs/volta-design-extract/waitlist/project/index.html"
```

Note the container IDs/classes expected by the JS (e.g., `#bolts-layer`, `.sparks-layer`). The hero (Task 6) will reproduce these.

- [ ] **Step 3: Create `assets/volta-lightning.js`**

Write to `assets/volta-lightning.js`:

```javascript
/**
 * volta-lightning.js
 * Lightning bolts scheduler + floating sparks for the Charged Hero.
 *
 * Expected DOM hooks (created by sections/volta-hero.liquid):
 *   #v-bolts-layer  — SVG <svg> element with a <defs><filter id="v-bolt-glow"> already inside
 *   #v-sparks-layer — empty <div>
 *
 * Guards (all three must pass for animation to start):
 *   1. prefers-reduced-motion is NOT 'reduce'
 *   2. The hero is in the viewport (IntersectionObserver)
 *   3. window.Shopify.designMode is NOT true (Theme Editor disables motion)
 */
(function () {
  'use strict';

  // Guard 1: reduced motion
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mql.matches) return;

  // Guard 2: Shopify design mode
  if (window.Shopify && window.Shopify.designMode === true) return;

  const initLightning = () => {
    const bolts = document.querySelector('#v-bolts-layer');
    const sparks = document.querySelector('#v-sparks-layer');
    if (!bolts || !sparks) return; // hero not on this page

    // --- PORTED FROM docs/volta-design-extract/waitlist/project/index.html:511-604 ---
    // Paste the randBolt() + spawnBolts() + sparks helper code here verbatim.
    // Replace any selectors with the IDs above (#v-bolts-layer, #v-sparks-layer).
    // If the original code listens on `document.body` or similar, scope it to
    // `bolts.parentElement` instead so it only animates within the hero.
    // --- END PORT ---

    // Guard 3: pause when off-screen (IntersectionObserver)
    let running = true;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          running = e.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    io.observe(bolts.parentElement);

    // The scheduler functions ported above should consult `running` before
    // spawning a new bolt or spark. Easiest pattern: wrap the spawn call in
    //   if (running) spawnNextBolt();
    // and re-schedule unconditionally.
  };

  // Wait for DOMContentLoaded so the hero markup exists
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightning, { once: true });
  } else {
    initLightning();
  }

  // Theme Editor: re-run on section reload (if the hero section is added)
  document.addEventListener('shopify:section:load', (e) => {
    if (e.target.querySelector('#v-bolts-layer')) initLightning();
  });
})();
```

- [ ] **Step 4: Port the lightning + sparks code**

Open `docs/volta-design-extract/waitlist/project/index.html`, copy lines 511-604 (or whatever range you identified in Step 1) into the marked block in `volta-lightning.js`. Adapt:
- Replace any references to `document.querySelector('.bolt-container')` (or similar) with `bolts`
- Replace any references to the sparks container with `sparks`
- Wherever a `setTimeout` or `setInterval` schedules the next bolt/spark, wrap the spawn call in `if (running) { ... }` so the IntersectionObserver pause actually halts spawning

- [ ] **Step 5: Verify the file parses**

```bash
node -c assets/volta-lightning.js && echo "OK — parses"
```

Expected: `OK — parses`. If a SyntaxError, fix and re-run.

- [ ] **Step 6: Commit**

```bash
git add assets/volta-lightning.js
git commit -m "feat(lightning): add bolts scheduler + sparks JS with three guards

Ported from docs/volta-design-extract/waitlist/project/index.html.
Guards: prefers-reduced-motion (skip entirely) + IntersectionObserver
(pause when off-screen) + Shopify.designMode (skip in Theme Editor).
Re-runs on shopify:section:load so it survives Theme Editor reloads."
```

---

### Task 5: Refresh snippets/volta-preloader.liquid

**Files:**
- Modify: `snippets/volta-preloader.liquid`
- Read for reference: `preview/index.html` (preloader markup near top, ~lines 19-24)

- [ ] **Step 1: Read the current snippet**

```bash
cat snippets/volta-preloader.liquid
```

Note what's there. The audit said it exists.

- [ ] **Step 2: Read the prototype's preloader for the animation pattern**

```bash
sed -n '15,40p' preview/index.html
```

Identify the `courantRun` keyframe and the layout (Volta Courant SVG centered, fades out after content paints).

- [ ] **Step 3: Rewrite snippets/volta-preloader.liquid**

The full snippet should be:

```liquid
{%- comment -%}
  volta-preloader.liquid — Shown once per page load, dismisses after content paint.
  Disabled when prefers-reduced-motion: reduce OR Shopify.designMode === true.
{%- endcomment -%}

<div class="v-preloader" id="v-preloader" role="status" aria-busy="true" aria-label="{{ 'accessibility.preloader' | t }}">
  <div class="v-preloader__mark">
    {%- comment -%} Inline SVG for animation control (rather than <img>) {%- endcomment -%}
    <img
      class="v-preloader__courant"
      src="{{ 'volta-courant.svg' | asset_url }}"
      alt=""
      width="180"
      height="40"
      decoding="async"
      fetchpriority="high"
    >
  </div>
</div>

{% stylesheet %}
.v-preloader {
  position: fixed; inset: 0;
  z-index: 9999;
  display: grid; place-items: center;
  background: var(--volta-indigo, #12104b);
  transition: opacity 0.6s var(--ease-out-expo, cubic-bezier(.16,1,.3,1));
}
.v-preloader[data-done="true"] { opacity: 0; pointer-events: none; }
.v-preloader__courant {
  width: clamp(120px, 18vw, 220px);
  height: auto;
  animation: vCourantRun 1.4s var(--ease-out-expo, cubic-bezier(.16,1,.3,1)) both;
}
@keyframes vCourantRun {
  0%   { transform: translateY(20px) scale(0.96); opacity: 0; }
  40%  { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .v-preloader { display: none; }
  .v-preloader__courant { animation: none; }
}
{% endstylesheet %}

<script>
  (function () {
    if (window.Shopify && window.Shopify.designMode === true) {
      const el = document.getElementById('v-preloader');
      if (el) el.remove();
      return;
    }
    const dismiss = () => {
      const el = document.getElementById('v-preloader');
      if (!el) return;
      el.setAttribute('data-done', 'true');
      el.setAttribute('aria-busy', 'false');
      setTimeout(() => el.remove(), 700);
    };
    if (document.readyState === 'complete') {
      dismiss();
    } else {
      window.addEventListener('load', dismiss, { once: true });
    }
  })();
</script>
```

- [ ] **Step 4: Verify with theme check**

```bash
npx shopify theme check 2>&1 | grep "volta-preloader" || echo "OK — no offenses on volta-preloader"
```

- [ ] **Step 5: Commit**

```bash
git add snippets/volta-preloader.liquid
git commit -m "feat(preloader): refresh to use Volta Courant SVG + indigo surface

- Replaces previous Part B implementation with Volta Courant mark on
  indigo surface (--volta-indigo).
- Dismisses on window.load; design-mode skip; reduced-motion bypass.
- Status role + aria-busy for screen readers."
```

---

### Task 6: Refactor sections/volta-hero.liquid into Charged Hero

**Why this is the biggest task:** This is the actual visual deliverable for Phase 1. All prior tasks were infrastructure. Take time on the schema (it shapes what the owner can edit in the Theme Editor).

**Files:**
- Modify (full refactor): `sections/volta-hero.liquid`
- Read for reference: existing Part B content of that file; `snippets/volta-mascot.liquid` (mascot usage); `sections/volta-hero-v1.liquid` (currently deployed minimal hero — borrow schema patterns)

- [ ] **Step 1: Read the three inputs**

```bash
cat sections/volta-hero.liquid           # Part B starting point
cat snippets/volta-mascot.liquid          # mascot integration
cat sections/volta-hero-v1.liquid         # deployed minimal hero (will be deleted in Task 8)
```

Capture:
- From Part B's hero: existing schema, settings, locale keys it references
- From mascot snippet: what `variant` and `scroll` parameters are valid
- From V1 hero: the `featured_product` setting + the direct-to-checkout form pattern (lines ~110-122) + the floating chrome (logo top-left, cart top-right) — keep all of this in the new hero

- [ ] **Step 2: Replace `sections/volta-hero.liquid` content**

Write the full new file. Structure:

```liquid
{%- comment -%}
  volta-hero.liquid — Charged Hero (V1 Phase 1).
  Spec: docs/superpowers/specs/2026-05-14-volta-v1-charged-multisection-design.md
  Z-stack: indigo base → radial gradients → grid floor → vignette → grain →
           lightning → sparks → mascot → corner brackets → chrome → content → preloader.
{%- endcomment -%}

{%- liquid
  assign featured = section.settings.featured_product
  assign cta_label = section.settings.cta_label | default: 'sections.volta_hero.cta_label' | t
  assign eyebrow = section.settings.eyebrow
  assign ticker = section.settings.ticker
-%}

<section class="v-hero-charged" data-section-id="{{ section.id }}" aria-labelledby="v-hero-title-{{ section.id }}">
  {%- comment -%} Layer 0-1: indigo + radial gradients (CSS) {%- endcomment -%}
  <div class="v-hero-charged__bg" aria-hidden="true"></div>

  {%- comment -%} Layer 2: grid floor (CSS) {%- endcomment -%}
  <div class="v-hero-charged__grid" aria-hidden="true"></div>

  {%- comment -%} Layer 3: vignette {%- endcomment -%}
  <div class="v-hero-charged__vignette" aria-hidden="true"></div>

  {%- comment -%} Layer 4: grain {%- endcomment -%}
  <div class="v-hero-charged__grain" aria-hidden="true"></div>

  {%- comment -%} Layer 5: lightning SVG (target for volta-lightning.js) {%- endcomment -%}
  <svg id="v-bolts-layer" class="v-hero-charged__bolts" aria-hidden="true" preserveAspectRatio="none">
    <defs>
      <filter id="v-bolt-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    {%- comment -%} Bolts appended by JS at runtime {%- endcomment -%}
  </svg>

  {%- comment -%} Layer 6: sparks (target for volta-lightning.js) {%- endcomment -%}
  <div id="v-sparks-layer" class="v-hero-charged__sparks" aria-hidden="true"></div>

  {%- comment -%} Layer 7: mascot (right side, reactive) {%- endcomment -%}
  <div class="v-hero-charged__mascot">
    {%- render 'volta-mascot', variant: 'hero', scroll: 'charge' -%}
  </div>

  {%- comment -%} Layer 8: corner brackets {%- endcomment -%}
  <span class="v-hero-charged__bracket v-hero-charged__bracket--tl" aria-hidden="true"></span>
  <span class="v-hero-charged__bracket v-hero-charged__bracket--tr" aria-hidden="true"></span>
  <span class="v-hero-charged__bracket v-hero-charged__bracket--bl" aria-hidden="true"></span>
  <span class="v-hero-charged__bracket v-hero-charged__bracket--br" aria-hidden="true"></span>

  {%- comment -%} Layer 9: chrome — VOLTA logo + cart {%- endcomment -%}
  <a href="{{ routes.root_url }}" class="v-hero-charged__logo" aria-label="{{ 'accessibility.home' | t }}">
    <img
      src="{{ 'volta-logo-v2.png' | asset_url }}"
      alt="Volta"
      width="120" height="40"
      loading="eager"
      decoding="async"
    >
  </a>

  <a href="{{ routes.cart_url }}" class="v-hero-charged__cart" aria-label="{%- if cart.item_count > 0 -%}{{ 'accessibility.cart_count' | t: count: cart.item_count }}{%- else -%}{{ 'accessibility.cart_empty' | t }}{%- endif -%}">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path d="M6 7h12l-1.5 11h-9z"/>
      <path d="M9 7V5a3 3 0 0 1 6 0v2"/>
    </svg>
    {%- if cart.item_count > 0 -%}<span class="v-hero-charged__cart-count">{{ cart.item_count }}</span>{%- endif -%}
  </a>

  {%- comment -%} Layer 10: content {%- endcomment -%}
  <div class="v-hero-charged__content">
    {%- if eyebrow != blank -%}
      <p class="v-hero-charged__eyebrow">{{ eyebrow }}</p>
    {%- else -%}
      <p class="v-hero-charged__eyebrow">{{ 'sections.volta_hero.eyebrow' | t }}</p>
    {%- endif -%}

    <h1 id="v-hero-title-{{ section.id }}" class="v-hero-charged__title" data-v-letters>
      {%- if section.settings.title != blank -%}{{ section.settings.title }}{%- else -%}{{ 'sections.volta_hero.title' | t }}{%- endif -%}
    </h1>

    {%- if ticker != blank -%}
      <p class="v-hero-charged__ticker">{{ ticker }}</p>
    {%- else -%}
      <p class="v-hero-charged__ticker">{{ 'sections.volta_hero.ticker' | t }}</p>
    {%- endif -%}

    {%- comment -%} CTA: direct-to-checkout if product set; graceful "BIENTÔT" pill if not {%- endcomment -%}
    {%- if featured != blank and featured.available -%}
      <form action="{{ routes.cart_add_url }}" method="post" class="v-hero-charged__form" enctype="multipart/form-data">
        <input type="hidden" name="id" value="{{ featured.variants.first.id }}">
        <input type="hidden" name="quantity" value="1">
        <input type="hidden" name="return_to" value="/checkout">
        <button type="submit" class="v-hero-charged__cta" data-v-magnet>
          <span>{{ cta_label }}</span>
          <span class="v-hero-charged__cta-price">{{ featured.price | money }}</span>
        </button>
      </form>
    {%- else -%}
      <button type="button" class="v-hero-charged__cta v-hero-charged__cta--disabled" aria-disabled="true" disabled>
        <span>{{ 'sections.volta_hero.cta_pending' | t }}</span>
      </button>
    {%- endif -%}
  </div>

  {%- comment -%} Layer 11: preloader {%- endcomment -%}
  {%- render 'volta-preloader' -%}
</section>

{% stylesheet %}
/* === Charged Hero === */
.v-hero-charged {
  position: relative;
  min-height: 100svh;
  background: var(--volta-indigo, #12104b);
  color: #fff;
  font-family: var(--font-body, system-ui);
  overflow: hidden;
  isolation: isolate;
}

/* Layer 0-1: radial gradients on top of base indigo */
.v-hero-charged__bg {
  position: absolute; inset: 0; z-index: 1;
  background:
    radial-gradient(60% 50% at 20% 30%, rgba(120,255,136,0.10), transparent 70%),
    radial-gradient(50% 40% at 80% 75%, rgba(251,238,73,0.10), transparent 70%);
  pointer-events: none;
}

/* Layer 2: grid floor */
.v-hero-charged__grid {
  position: absolute; left: 0; right: 0; bottom: -10%; height: 60%; z-index: 2;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  transform: perspective(800px) rotateX(60deg) translateY(-10%);
  transform-origin: center top;
  pointer-events: none;
  mask-image: linear-gradient(to top, black 30%, transparent 100%);
}

/* Layer 3: vignette */
.v-hero-charged__vignette {
  position: absolute; inset: 0; z-index: 3;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%);
  pointer-events: none;
}

/* Layer 4: grain */
.v-hero-charged__grain {
  position: absolute; inset: 0; z-index: 4;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  opacity: 0.6;
  mix-blend-mode: overlay;
  pointer-events: none;
}

/* Layer 5: lightning bolts */
.v-hero-charged__bolts {
  position: absolute; inset: 0; z-index: 5;
  width: 100%; height: 100%;
  pointer-events: none;
}

/* Layer 6: sparks */
.v-hero-charged__sparks {
  position: absolute; inset: 0; z-index: 6;
  pointer-events: none;
}

/* Layer 7: mascot */
.v-hero-charged__mascot {
  position: absolute; right: 4vw; bottom: 8vh; z-index: 7;
  width: clamp(160px, 26vw, 420px);
}

/* Layer 8: corner brackets */
.v-hero-charged__bracket {
  position: absolute; width: 32px; height: 32px; z-index: 8;
  border: 2px solid rgba(255,255,255,0.3);
  pointer-events: none;
}
.v-hero-charged__bracket--tl { top: clamp(16px, 3vw, 32px); left: clamp(16px, 3vw, 32px); border-right: 0; border-bottom: 0; }
.v-hero-charged__bracket--tr { top: clamp(16px, 3vw, 32px); right: clamp(16px, 3vw, 32px); border-left: 0; border-bottom: 0; }
.v-hero-charged__bracket--bl { bottom: clamp(16px, 3vw, 32px); left: clamp(16px, 3vw, 32px); border-right: 0; border-top: 0; }
.v-hero-charged__bracket--br { bottom: clamp(16px, 3vw, 32px); right: clamp(16px, 3vw, 32px); border-left: 0; border-top: 0; }

/* Layer 9: chrome */
.v-hero-charged__logo {
  position: absolute; top: clamp(20px, 3vw, 36px); left: clamp(20px, 3vw, 36px);
  z-index: 9;
  display: inline-flex;
}
.v-hero-charged__logo img {
  width: clamp(96px, 10vw, 132px); height: auto; display: block;
  filter: invert(1); /* indigo bg requires white logo — invert the dark PNG */
}
.v-hero-charged__cart {
  position: absolute; top: clamp(20px, 3vw, 36px); right: clamp(20px, 3vw, 36px);
  z-index: 9;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 12px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 999px;
  color: #fff;
  text-decoration: none;
  transition: background 0.2s ease;
}
.v-hero-charged__cart:hover { background: rgba(255,255,255,0.14); }
.v-hero-charged__cart:focus-visible { outline: 2px solid var(--volta-yellow, #FBEE49); outline-offset: 2px; }
.v-hero-charged__cart-count { font-size: 13px; font-weight: 600; }

/* Layer 10: content (bottom-left) */
.v-hero-charged__content {
  position: absolute; left: clamp(24px, 5vw, 80px); bottom: clamp(64px, 12vh, 120px); right: clamp(160px, 30vw, 460px);
  z-index: 10;
  display: flex; flex-direction: column; gap: clamp(12px, 1.6vw, 20px);
}
.v-hero-charged__eyebrow {
  font-family: var(--font-body, system-ui); font-size: 11px;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: rgba(255,255,255,0.6); margin: 0;
}
.v-hero-charged__title {
  font-family: var(--font-display, 'dunbar-tall', sans-serif);
  font-style: italic; font-weight: 900;
  font-size: clamp(72px, 11vw, 180px);
  line-height: 0.88; letter-spacing: -0.04em;
  color: #fff; margin: 0;
}
.v-hero-charged__ticker {
  font-family: var(--font-body, system-ui); font-size: clamp(13px, 1.2vw, 15px);
  color: rgba(255,255,255,0.7); margin: 0; max-width: 36ch;
}
.v-hero-charged__form { margin-top: clamp(8px, 1vw, 12px); }
.v-hero-charged__cta {
  display: inline-flex; align-items: center; gap: 14px;
  padding: 14px 24px;
  background: var(--volta-yellow, #FBEE49);
  color: var(--volta-indigo, #12104b);
  border: none; border-radius: 999px;
  font-family: var(--font-body, system-ui); font-size: 13px; font-weight: 800;
  letter-spacing: 0.18em; text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s var(--ease-out-expo, cubic-bezier(.16,1,.3,1));
}
.v-hero-charged__cta:hover { transform: translateY(-2px); }
.v-hero-charged__cta:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
.v-hero-charged__cta-price { font-weight: 700; letter-spacing: 0.06em; }
.v-hero-charged__cta--disabled { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.6); cursor: not-allowed; }
.v-hero-charged__cta--disabled:hover { transform: none; }

/* Responsive: hide mascot on narrow screens; expand content full-width */
@media (max-width: 720px) {
  .v-hero-charged__mascot { display: none; }
  .v-hero-charged__content { right: clamp(20px, 6vw, 40px); }
  .v-hero-charged__bracket { width: 20px; height: 20px; }
}

/* Reduced motion: kill all transitions/animations */
@media (prefers-reduced-motion: reduce) {
  .v-hero-charged *,
  .v-hero-charged *::before,
  .v-hero-charged *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .v-hero-charged__bolts,
  .v-hero-charged__sparks { display: none; }
}
{% endstylesheet %}

<script src="{{ 'volta-lightning.js' | asset_url }}" defer></script>

{% schema %}
{
  "name": "t:sections.volta_hero.name",
  "tag": "section",
  "class": "v-hero-charged-wrapper",
  "settings": [
    {
      "type": "header",
      "content": "t:sections.volta_hero.content_header"
    },
    {
      "type": "text",
      "id": "eyebrow",
      "label": "t:sections.volta_hero.eyebrow_label",
      "info": "t:sections.volta_hero.eyebrow_info"
    },
    {
      "type": "text",
      "id": "title",
      "label": "t:sections.volta_hero.title_label",
      "info": "t:sections.volta_hero.title_info"
    },
    {
      "type": "textarea",
      "id": "ticker",
      "label": "t:sections.volta_hero.ticker_label",
      "info": "t:sections.volta_hero.ticker_info"
    },
    {
      "type": "header",
      "content": "t:sections.volta_hero.cta_header"
    },
    {
      "type": "product",
      "id": "featured_product",
      "label": "t:sections.volta_hero.featured_product_label",
      "info": "t:sections.volta_hero.featured_product_info"
    },
    {
      "type": "text",
      "id": "cta_label",
      "label": "t:sections.volta_hero.cta_label_label",
      "info": "t:sections.volta_hero.cta_label_info"
    }
  ],
  "presets": [
    { "name": "t:sections.volta_hero.name" }
  ]
}
{% endschema %}
```

- [ ] **Step 3: Verify with theme check**

```bash
npx shopify theme check 2>&1 | grep "volta-hero\.liquid" -B1 -A3 || echo "OK — no offenses on volta-hero.liquid"
```

Expected: `OK — no offenses on volta-hero.liquid`. If any offenses appear (e.g., missing locale key — those will be filled in Task 7, you can defer that warning), note them and continue.

- [ ] **Step 4: Commit**

```bash
git add sections/volta-hero.liquid
git commit -m "feat(hero-charged): full refactor of volta-hero.liquid for V1 Phase 1

- Z-stacked composition: indigo + radials + grid + vignette + grain +
  lightning + sparks + mascot + corner brackets + chrome + content + preloader
- Mascot via {% render 'volta-mascot' variant: 'hero', scroll: 'charge' %}
- Direct-to-checkout CTA with graceful 'BIENTÔT' fallback when no product set
- All decorative SVGs/divs aria-hidden; semantic h1; skip-link compatible
- Responsive: mascot hides <720px, content full-width
- Reduced-motion: all decoration disabled, transitions instant
- Schema: editable eyebrow / title / ticker / featured_product / CTA label"
```

---

### Task 7: Add Charged Hero locale keys (FR + EN + schema files)

**Files:**
- Modify: `locales/fr.default.json`, `locales/en.json`, `locales/fr.default.schema.json`, `locales/en.schema.json`

- [ ] **Step 1: Read the locale files to find the right insertion points**

```bash
grep -n "sections.volta_footer_legal" locales/fr.default.json | head -3
grep -n "accessibility" locales/fr.default.json | head -3
```

This shows you where existing `sections.*` keys live and what the indent/structure pattern is.

- [ ] **Step 2: Add keys to `locales/fr.default.json`**

Inside the `"sections"` block (find an existing section like `volta_footer_legal` and add a sibling), insert:

```json
    "volta_hero": {
      "name": "Hero — Charged",
      "eyebrow": "Pressé en France",
      "title": "VOLTA",
      "ticker": "Premier lot · Livraison juin 2026",
      "cta_label": "Acheter",
      "cta_pending": "Bientôt disponible"
    },
```

Also add to the `"accessibility"` block (find it; create if missing):

```json
    "preloader": "Chargement en cours",
    "cart_count": "Panier — {{ count }} article(s)",
    "cart_empty": "Panier vide"
```

(`accessibility.home` should already exist from the previous V1 footer work.)

- [ ] **Step 3: Add EN parity to `locales/en.json`**

Same structure, EN strings:

```json
    "volta_hero": {
      "name": "Hero — Charged",
      "eyebrow": "Pressed in France",
      "title": "VOLTA",
      "ticker": "First batch · Shipping June 2026",
      "cta_label": "Buy",
      "cta_pending": "Coming soon"
    },
```

```json
    "preloader": "Loading",
    "cart_count": "Cart — {{ count }} item(s)",
    "cart_empty": "Cart empty"
```

- [ ] **Step 4: Add schema labels to `locales/fr.default.schema.json`**

Inside `sections`, add:

```json
    "volta_hero": {
      "name": "Hero — Charged",
      "content_header": "Contenu",
      "eyebrow_label": "Eyebrow (texte court au-dessus du titre)",
      "eyebrow_info": "Laisser vide pour utiliser la traduction par défaut",
      "title_label": "Titre principal",
      "title_info": "Vide → 'VOLTA' (par défaut). Police Dunbar Tall.",
      "ticker_label": "Ticker (ligne sous le titre)",
      "ticker_info": "Phrase courte type 'Premier lot · Livraison juin 2026'",
      "cta_header": "Bouton d'achat",
      "featured_product_label": "Produit mis en avant",
      "featured_product_info": "Vide → bouton désactivé 'Bientôt disponible'",
      "cta_label_label": "Texte du bouton",
      "cta_label_info": "Ex: Acheter. Par défaut: 'Acheter'."
    },
```

- [ ] **Step 5: Mirror schema EN labels in `locales/en.schema.json`**

```json
    "volta_hero": {
      "name": "Hero — Charged",
      "content_header": "Content",
      "eyebrow_label": "Eyebrow (small text above headline)",
      "eyebrow_info": "Leave empty to use translation default",
      "title_label": "Headline",
      "title_info": "Empty → 'VOLTA' (default). Dunbar Tall typeface.",
      "ticker_label": "Ticker (line below headline)",
      "ticker_info": "Short phrase like 'First batch · Shipping June 2026'",
      "cta_header": "Buy button",
      "featured_product_label": "Featured product",
      "featured_product_info": "Empty → button shows 'Coming soon' disabled state",
      "cta_label_label": "Button text",
      "cta_label_info": "e.g., Buy. Defaults to 'Buy'."
    },
```

- [ ] **Step 6: Verify all 4 files parse as valid JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('locales/fr.default.json'))" && echo "fr OK"
node -e "JSON.parse(require('fs').readFileSync('locales/en.json'))" && echo "en OK"
node -e "JSON.parse(require('fs').readFileSync('locales/fr.default.schema.json'))" && echo "fr.schema OK"
node -e "JSON.parse(require('fs').readFileSync('locales/en.schema.json'))" && echo "en.schema OK"
```

Expected: 4 lines of `... OK`. If any throws, fix the JSON.

- [ ] **Step 7: Run theme check to validate all t: references in the section resolve**

```bash
npx shopify theme check 2>&1 | grep -E "MissingTemplate|UnknownTranslationKey|volta-hero" || echo "OK — locales complete"
```

- [ ] **Step 8: Commit**

```bash
git add locales/fr.default.json locales/en.json locales/fr.default.schema.json locales/en.schema.json
git commit -m "feat(locales): add Charged Hero strings (FR/EN runtime + schema)

- sections.volta_hero.{name,eyebrow,title,ticker,cta_label,cta_pending}
- accessibility.{preloader,cart_count,cart_empty}
- Schema labels for all volta_hero settings in fr/en schema files

All FR/EN keys at parity; schema-locale parity verified."
```

---

### Task 8: Swap templates/index.json + retire deprecated V1 files

**Files:**
- Modify: `templates/index.json`
- Delete: `sections/volta-hero-v1.liquid`
- Delete: `assets/volta-hero-v1.css`

- [ ] **Step 1: Read the current `templates/index.json`**

```bash
cat templates/index.json
```

It currently references `volta-hero-v1` + `volta-footer-legal`.

- [ ] **Step 2: Update `templates/index.json`**

Replace its full contents with:

```json
{
  "sections": {
    "hero": {
      "type": "volta-hero",
      "settings": {}
    },
    "footer": {
      "type": "volta-footer-legal",
      "settings": {}
    }
  },
  "order": ["hero", "footer"]
}
```

(`volta-footer-legal` stays for Phase 1 — Phase 2 swaps it for the full `volta-footer`.)

- [ ] **Step 3: Delete the retired V1 hero files**

```bash
git rm sections/volta-hero-v1.liquid assets/volta-hero-v1.css
```

- [ ] **Step 4: Verify theme check**

```bash
npx shopify theme check 2>&1 | grep -E "volta-hero|index\.json|UndefinedObject" | head -20
```

Expected: zero offenses on `volta-hero.liquid` and `templates/index.json` (legacy errors on `volta-products.liquid` and `volta-subscription-toggle.liquid` are OK — they're deferred to Phase 2).

- [ ] **Step 5: Commit**

```bash
git add templates/index.json
git commit -m "chore(templates): swap home from volta-hero-v1 to volta-hero; retire V1 files

Phase 1 of V1 Charged + Multisection. templates/index.json now points
at sections/volta-hero.liquid (Charged Hero). volta-footer-legal stays
until Phase 2 swaps in the full volta-footer.

Deleted:
- sections/volta-hero-v1.liquid (replaced by volta-hero)
- assets/volta-hero-v1.css (styles folded into volta-hero.liquid)"
```

---

### Task 9: Push Phase 1 to Shopify + verify acceptance

**Files:** none modified — this is the deployment + verification gate.

- [ ] **Step 1: Push to the existing Phase 1 theme (ID 199379681617)**

```bash
: > /tmp/push-phase1.log
npx shopify theme push --store=volta-drinks.myshopify.com --theme=199379681617 --nodelete --json 2>&1 | tee /tmp/push-phase1.log
```

This may take 1–2 min. The CLI is already authenticated (the device-code flow ran in the May 13 session and the token is cached at `~/.config/shopify/`).

- [ ] **Step 2: Inspect the result JSON for V1 errors**

```bash
tail -3 /tmp/push-phase1.log | grep -oE '"errors":\{[^}]*\}' || echo "No errors block — push clean"
```

Expected: either `No errors block — push clean`, OR an errors block that lists ONLY legacy files (`volta-subscription-toggle`, `volta-products`). Any error on a V1-Phase-1 file (`volta-hero.liquid`, `volta-tokens.css`, `theme.liquid`, `volta-lightning.js`, `volta-preloader.liquid`, locales, `index.json`) is a failure — fix and re-push.

- [ ] **Step 3: Open the preview URL in the controller's chat for the owner**

The preview URL is `https://volta-drinks.myshopify.com?preview_theme_id=199379681617`. Surface it to the controller (calling agent) so the owner can QA visually.

- [ ] **Step 4: Self-check the Phase 1 acceptance criteria (spec §4.7)**

Visually verify in a browser (controller will assist — your role here is to document what's expected):
1. Indigo background visible (not violet gradient)
2. Lightning bolts firing (1-3 per 8-12s)
3. Floating sparks drifting
4. Mascot rendered on the right (or hidden if <720px)
5. VOLTA wordmark in Dunbar Tall (italic, bold) — verify in browser DevTools: `document.fonts.check('1em "dunbar-tall"')` returns `true` after a moment
6. Eyebrow + ticker copy from locale (or merchant override if set)
7. CTA pill: yellow with indigo text. If no product set → "BIENTÔT DISPONIBLE" disabled state
8. Cream legal footer still at bottom (volta-footer-legal — Phase 2 swap pending)
9. Preloader briefly visible on load with Volta Courant, fades out
10. Reduced-motion (macOS System Preferences → Accessibility → Display → Reduce motion → reload preview): all decoration static, no lightning, no sparks, preloader skipped

- [ ] **Step 5: Push commits to origin**

```bash
git push origin main
```

- [ ] **Step 6: Final status report to controller**

Report:
- Phase 1 commits range (`git log --oneline {first}..HEAD` where `{first}` is the first Phase 1 commit)
- Push result (clean / legacy-only errors)
- Preview URL
- Any decisions needing owner input (e.g., Dunbar Tall didn't load — fallback engaged; need owner to verify Adobe Fonts kit is enabled for `volta-drinks.myshopify.com` domain)

No commit on this task (deployment only).

---

## What comes after Phase 1

After Phase 1 ships and the owner signs off on the preview, **Phase 2** will be planned at `docs/superpowers/plans/2026-05-15-volta-v1-phase2-multisection.md` (or similar date). Phase 2 covers:

- Activate `sections/volta-products.liquid` (4-flavor grid w/ Golden Kick buyable, others "Bientôt") — including fixing the Liquid syntax error on line 8 that the May 13 push surfaced
- Activate `sections/volta-shot-band.liquid` (60ml explainer)
- Activate `sections/volta-story.liquid` (manifesto)
- Activate `sections/volta-footer.liquid` (full footer w/ Klaviyo newsletter) — replaces `volta-footer-legal`
- Fix the legacy `snippets/volta-subscription-toggle.liquid` stylesheet-nested error (or remove the snippet entirely if not used in Phase 2)
- Update `templates/index.json` to include all 5 sections in order

Then **Phase 3** at `docs/superpowers/plans/2026-05-XX-volta-v1-phase3-polish.md` covers custom cursor, magnetic CTAs (apply `volta-motion.js` `magnetize` to all primary CTAs), comprehensive reduced-motion pass, Lighthouse audit, axe-core, browser QA matrix, cookie banner.

---

## Plan self-review

(Performed by the plan author before handoff. Issues found, fixed inline, no separate pass.)

**1. Spec coverage:**
- Spec §3 (Locked decisions) — palette migration ✅ Task 1 · Dunbar Tall ✅ Tasks 1+2 · motion stack ✅ Task 2 · mascot integration ✅ Task 6 · phasing/theme target ✅ Task 9
- Spec §4.1 (Files touched) — all files in the spec's "Modify/Create/Delete" lists have a task that touches them (Tasks 1–8)
- Spec §4.2 (Z-stack) — Task 6's section markup + CSS implements all 12 layers
- Spec §4.3 (Motion behaviors) — preloader ✅ Task 5 · letter-drop deferred to Phase 3 (acceptable per spec §4.3 footnote — Phase 3 polish) · mascot eye-tracking inherited from existing `snippets/volta-mascot.liquid` (no new work) · lightning + sparks ✅ Task 4 · CTA magnetic deferred to Phase 3 · IO/designMode/reduced-motion guards ✅ Task 4
- Spec §4.4 (CTA graceful degradation) — ✅ Task 6 markup branches on `featured != blank and featured.available`
- Spec §4.5 (Accessibility) — aria-hidden on decorative ✅ Task 6 · semantic h1 ✅ Task 6 · cart aria-label ✅ Task 6 · focus visible ✅ Task 6 CSS · reduced-motion ✅ Tasks 4, 5, 6
- Spec §4.6 (Perf budget) — Typekit preconnect ✅ Task 2 · CDN deferred scripts ✅ Task 2 · IO guard on lightning ✅ Task 4
- Spec §4.7 (Acceptance criteria) — ✅ Task 9 Step 4 walks all 10 items

**Gap noted + acceptable:** Letter-drop animation on the title is deferred to Phase 3 per spec §6 (polish). The Phase 1 hero ships with a static title; motion comes in Phase 3 when `volta-motion.js`'s `reveal` is wired to the `data-v-letters` attribute already present on the `<h1>`.

**2. Placeholder scan:**
- No "TBD", "TODO", "implement later" in any step
- Task 4 Step 4 says "Paste the … code here verbatim" with explicit line range — that's a port, not a placeholder
- Task 6 schema has concrete settings (not "add settings here")
- Task 7 locale strings are fully concrete
- All commands have expected output

**3. Type consistency:**
- DOM hooks: `#v-bolts-layer` and `#v-sparks-layer` referenced in both Task 4 (JS) and Task 6 (markup) — match ✅
- Locale keys: `sections.volta_hero.*` used in both Task 6 (Liquid `t:` calls) and Task 7 (JSON keys) — match ✅
- CSS class names: `.v-hero-charged__*` consistent across Task 6 markup + CSS ✅
- Section type: `volta-hero` consistent in Task 6 (schema name + filename) and Task 8 (templates/index.json) ✅
- Section setting IDs: `eyebrow`, `title`, `ticker`, `featured_product`, `cta_label` consistent between Task 6 Liquid + schema + Task 7 schema-locale labels ✅
- Asset filenames: `volta-courant.svg` (Task 3) matches reference in Task 5 (preloader) ✅; `volta-lightning.js` (Task 4) matches reference in Task 6 (script tag) ✅

No issues found.

---
