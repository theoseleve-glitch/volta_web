# Volta V1 Charged + Multisection — Design Spec

**Date:** 2026-05-14
**Supersedes:** `docs/superpowers/specs/2026-05-09-volta-v1-hero-design.md` (the "Sniper" V1)
**Status:** Awaiting owner review

---

## 1. Why this spec exists

The deployed V1 ("Sniper" hero, theme `199379681617`) ships a minimal gradient placeholder with no brand expression — wrong palette (violet/old-yellow), wrong typeface (`system-ui` fallback), no mascot, no motion, no scroll narrative. The owner reviewed it and (correctly) flagged it as below the floor of what the repo already contains.

**This spec rebuilds the V1 launch experience as a brand-true single-page port of `preview/index.html`, grounded in the confirmed design language at `docs/volta-design-extract/`.** Three phases, three Shopify pushes, eyes-on progress between each.

The strategic decision behind the rebuild: the prototype, the design-extract bundle, and the 13 dormant Part B sections together already constitute a near-complete V1. The work is **port + ground**, not invent.

---

## 2. Locked references (where the design actually lives)

| Layer | Source-of-truth file | Notes |
|---|---|---|
| **Confirmed palette + typography** | `docs/volta-design-extract/waitlist/project/assets/colors_and_type.css` | Indigo / neon green / yellow + Dunbar Tall — **overrides** the older `assets/volta-tokens.css` |
| **Hero visual vocabulary** | `docs/volta-design-extract/waitlist/project/index.html` | Indigo deep-space + radial gradients + grid floor + vignette + grain + lightning + sparks + corner brackets |
| **Lightning + sparks animator** | `docs/volta-design-extract/waitlist/project/index.html:511-604` (JS) | Port verbatim, wrap in reduced-motion + IntersectionObserver guard |
| **Page structure** | `preview/index.html` | Single-page IA: hero → 4-flavor grid → 60 ml band → manifesto → footer w/ newsletter |
| **Existing Liquid sections to activate** | `sections/volta-hero.liquid`, `volta-products.liquid`, `volta-shot-band.liquid`, `volta-story.liquid`, `volta-footer.liquid` | All built during Part B (2026-04-17), all dormant. Reuse + extend, don't rewrite. |
| **Mascot** | `snippets/volta-mascot.liquid` + `assets/volta-mascot.js` + `assets/volta-logo-v2.png` | 6 animation states already defined (idle/charging/discharge/punch/celebrate/sad) |
| **Motion API** | `assets/volta-motion.js` (Lenis + GSAP + reveal/magnetize/parallax/pin) | Currently NOT loaded by V1. Wire into `layout/theme.liquid`. |
| **Typeface** | Adobe Fonts kit `gjt3qnf` (Dunbar Tall — Ultra Italic + Extra Bold). Owner-confirmed licensed for `volta-drinks.myshopify.com`. | `<link rel="stylesheet" href="https://use.typekit.net/gjt3qnf.css">` in `<head>` |
| **Brand assets (raw)** | `New folder/` at repo root | Logos (7 variants), `.glb` 3D bottle (deferred), Volta Courant SVG, motion screen-recording (reference), `awwwards-upgrade-prompt.md` |

---

## 3. Locked decisions

| Decision | Value | Why |
|---|---|---|
| **Palette** | Indigo `#12104b` (surface) · neon green `#78ff88` (accent) · yellow `#FBEE49` (Golden-Kick accent) · cream `#F7F7F2` (footer surface) | Design-extract `colors_and_type.css` is the canonical source; supersedes the older placeholder palette in `assets/volta-tokens.css` |
| **Display typeface** | Dunbar Tall — Ultra Italic for headlines (e.g. "VOLTA"), Extra Bold for sub-headlines, mono for `.v-label` eyebrows | Design-extract locked it; Adobe Fonts kit `gjt3qnf` proven |
| **Body typeface** | Inherit from design-extract (likely Inter or system stack fallback — confirm during Phase 1 from `colors_and_type.css`) | Same source |
| **Motion stack** | Lenis 1.1.18 + GSAP 3.12.5 + ScrollTrigger via CDN, orchestrated by `assets/volta-motion.js` | Per `.claude/rules/stack-decisions.md` and `motion-and-perf.md` |
| **Mascot role** | The hero's **right-side focal point** — reactive (cursor-tracking eyes), idle breathing, charges on scroll. Part A signature moment. | Locked Part A decision; the asset already exists |
| **Hero copy (Phase 1)** | `VOLTA` wordmark (Dunbar Tall Ultra Italic, huge) + a calm eyebrow ticker ("Pressé en France · Livraison 06.2026" or similar) + Golden Kick CTA pill. No marketing slogan. | Honors the "no slogan" client lock while still being a real brand surface |
| **Home structure (Phase 2)** | Hero → 4-flavor grid → 60 ml band → manifesto → footer-with-newsletter. Order matches prototype. | Prototype IA is already validated |
| **Header / nav** | None for V1. Single page, single CTA. | Same constraint as original V1 spec — keeps focus on purchase |
| **Phasing** | Three Shopify pushes, one per phase. Each phase ends in a working preview before the next begins. | Owner approved 2026-05-14 |
| **Theme target** | Same unpublished theme `199379681617` ("Volta V1 Hero - 2026-05-13") — overwrite, don't create new each push | Per CLI gotcha memory |

---

## 4. Phase 1 — Charged Hero (1–2 days, 1 push)

### 4.1 Files touched

**Create:**
- *(none — reuse `sections/volta-hero.liquid` from Part B)*

**Modify:**
- `assets/volta-tokens.css` → overwrite with design-extract's confirmed palette + typography variables (single source of truth)
- `layout/theme.liquid` → inject Typekit `<link>` in `<head>` (preconnect + stylesheet) AND wire GSAP/ScrollTrigger/Lenis CDN scripts + `volta-motion.js` before `</body>`
- `sections/volta-hero.liquid` → refactor: keep mascot integration; add lightning/sparks JS; restructure z-stack to match design-extract; remove any Part-B-era assumptions that don't fit V1 (e.g., depend on other sections)
- `templates/index.json` → replace `volta-hero-v1` with `volta-hero`, keep `volta-footer-legal` for now (Phase 2 swaps it)

**Delete:**
- `sections/volta-hero-v1.liquid` — retired (was the minimal V1 hero we're replacing)
- `assets/volta-hero-v1.css` — retired (styles move into the new hero's `{% stylesheet %}` block or a renamed asset)

### 4.2 Hero composition (z-stack)

```
z=0  Indigo base color (#12104b)
z=1  Deep-space radial gradients (two soft glows: green-ish top-left, yellow-ish bottom-right)
z=2  Grid floor (CSS linear gradients, perspective-tilted, subtle electrical hum)
z=3  Vignette (radial darken to corners)
z=4  Grain (PNG noise overlay, mix-blend-mode: overlay, ~6% opacity)
z=5  Lightning bolts SVG layer (JS-scheduled, 1-3 per 8-12s, glow filter)
z=6  Floating sparks layer (18 elements, individual CSS animations, drifting)
z=7  Mascot (right ~30% of hero, reactive to cursor, idle breathing)
z=8  Corner brackets (4 SVG L-shapes, brand chrome)
z=9  VOLTA logo top-left, cart icon top-right (floating chrome — same as current V1)
z=10 Hero text (VOLTA wordmark, eyebrow ticker) + CTA pill — bottom-left, matching original V1 spec composition; mascot occupies right ~30% of viewport
z=11 Preloader (covers all on first paint, fades out after content ready)
```

### 4.3 Motion behaviors (Phase 1)

| Element | Behavior | Reduced-motion fallback |
|---|---|---|
| Preloader | Volta Courant SVG runs `courantRun` keyframe, ~1.2s, then fades out | Skip entirely — content shows immediately |
| Hero title letter-drop | "VOLTA" letters animate from y:80, opacity:0 → y:0, opacity:1, stagger 0.05s | Title appears instant |
| Mascot eyes | Track cursor position within hero bounds | Static eyes, center pupils |
| Mascot body | Subtle 2° lean toward cursor | No lean |
| Lightning bolts | Randomized scheduler (1-3 bolts per 8-12s), branching SVG paths, glow filter | Disabled — static decorative line/none |
| Sparks | Drift slowly upward, fade in/out | Disabled — static |
| CTA pill | Magnetic effect within 80px radius | No magnetism, standard hover |
| Off-screen | Lightning + sparks pause via IntersectionObserver | N/A |
| Theme Editor | Lightning + sparks + preloader disabled when `window.Shopify.designMode === true` | N/A |

### 4.4 Hero CTA (Phase 1)

Phase 1 is single-section. The Golden Kick CTA must still work because it's the only purchase path until Phase 2 adds the flavor grid.

CTA HTML: same direct-to-checkout form pattern as original V1 spec (POST to `/cart/add` with `return_to=/checkout`). Settings panel reads `featured_product` (which the merchant binds to the Golden Kick product in admin).

**Graceful degradation if product not yet created:** if `section.settings.featured_product` is blank, render the CTA as a disabled pill labeled "BIENTÔT DISPONIBLE" with `aria-disabled="true"` and no form submission. Same fallback pattern as the original V1 spec — keeps the hero visually whole even before owner creates the Golden Kick product.

CTA visual: yellow pill button on dark surface — "ACHETER · 30 €" — magnetic + subtle bolt glyph (matches design-extract's "Je charge" CTA aesthetic).

### 4.5 Accessibility (Phase 1)

- All decorative SVGs (`lightning`, `sparks`, `corner-brackets`, `grain`) marked `aria-hidden="true"`
- Mascot already `aria-hidden` (per existing snippet)
- Preloader has `role="status"` with `aria-busy="true"` while active
- Skip-to-content link continues to work
- Cart icon retains aria-label (count-aware)
- Focus visible on CTA + cart link (yellow `var(--volta-yellow)` outline)
- `prefers-reduced-motion: reduce` honored across ALL motion (preloader, letter-drop, lightning, sparks, mascot reactivity, magnetic CTA)

### 4.6 Performance budget (Phase 1)

| Metric | Target |
|---|---|
| LCP | < 2.5s on mobile 4G (likely candidate: hero title text, with Dunbar Tall preloaded) |
| CLS | < 0.1 |
| Total JS shipped | < 80 KB (GSAP+ScrollTrigger ~60 KB + Lenis ~10 KB + volta-motion.js ~10 KB) — all via CDN, cached |
| Lightning + sparks 60fps | yes, on mid-range laptop |
| Typekit FOIT | preload critical weight, `font-display: swap` |
| Reduced-motion bundle | does NOT load lightning JS — gate at script-tag time via `matchMedia` |

### 4.7 Phase 1 acceptance criteria

1. `shopify theme push --theme=199379681617` produces zero new errors (existing legacy errors OK)
2. Owner opens preview URL and sees: indigo background, lightning bolts firing, mascot in place with reactive eyes, "VOLTA" headline in Dunbar Tall, Golden Kick CTA, cream legal footer (still old V1 footer-legal until Phase 2)
3. Reduced-motion check: macOS Reduce Motion → reload → all animations static
4. Theme Editor compatibility: section can be added/removed/edited without JS errors
5. `shopify theme check` clean on the modified files
6. Lighthouse mobile Performance ≥ 90 (or owner sign-off if marginally below)
7. axe-core: zero violations on the hero

---

## 5. Phase 2 — Multi-section home (2–3 days, 1 push)

### 5.1 Files touched

**Modify (activate dormant Part B sections):**
- `sections/volta-products.liquid` → fix Liquid syntax error (theme push surfaced one at line 8); adapt for 4-flavor display with Golden Kick buyable + others "Bientôt"
- `sections/volta-shot-band.liquid` → activate as-is, verify renders cleanly
- `sections/volta-story.liquid` → activate as-is, verify renders cleanly
- `sections/volta-footer.liquid` → activate, replace `volta-footer-legal` reference; integrate newsletter form (Klaviyo via `settings.volta_klaviyo_public_key`)
- `snippets/volta-subscription-toggle.liquid` → fix the nested-stylesheet error surfaced during theme push (move `{% stylesheet %}` to top-level of the snippet, not inside other tags) — NEEDED because Part B's `volta-footer.liquid` may reference it for the subscription pitch, OR delete the snippet if subscriptions stay out of V1
- `templates/index.json` → expand to 5 sections in order: `volta-hero`, `volta-products`, `volta-shot-band`, `volta-story`, `volta-footer`
- `locales/fr.default.json` + `locales/en.json` → add any new strings for the 4 sections (audit during implementation; many keys probably already exist from Part B)

**Delete:**
- `sections/volta-footer-legal.liquid` — superseded by `volta-footer`

### 5.2 4-flavor grid (volta-products)

Each card:
- Eyebrow: `01` / `02` / `03` / `04` (Dunbar Mono, tracked)
- Product name: Maxi Focus / Golden Kick / Green Flag / Fire Fighter (Dunbar Extra Bold)
- Format line: "60 ml shot — pack de 12" / "12 × 60 ml" (mono small)
- Price: `30 €` (only on Golden Kick) / `Bientôt` (others)
- Per-flavor accent color (per-card `--accent` CSS variable):
  - Maxi Focus → cyan/violet (TBD — from design-extract or prototype)
  - Golden Kick → yellow `#FBEE49`
  - Green Flag → neon green `#78ff88`
  - Fire Fighter → red/orange (TBD)
- CTA: Golden Kick → magnetic "ACHETER" button (same direct-to-checkout). Others → disabled "BIENTÔT" pill, no link.
- Optional bottle silhouette / illustration (deferred — owner asset)

### 5.3 60 ml shot band (volta-shot-band)

Activate Part B section as-is. Brief explainer: "60 ml — un shot, un rituel" + supporting copy. Subtle indigo→indigo-darker gradient. No interaction.

### 5.4 Manifesto (volta-story)

Activate Part B section as-is. The "Pas un soda. Pas un supplément. Un rituel." block. Scroll-revealed line-by-line via `volta-motion.js` `reveal`.

### 5.5 Footer with newsletter (volta-footer)

Activate Part B section. Layout:
- Top: Volta Courant SVG (animated subtle hover/idle)
- Newsletter capture: email input + "Je charge" submit → posts to Klaviyo's `/client/subscriptions` endpoint with the configured `volta_klaviyo_public_key`
- 5 legal links (same as Phase 1 footer)
- Copyright
- Social icons (deferred — owner asset, Phase 3 if any)

Klaviyo fallback: if `volta_klaviyo_public_key` is empty (until owner sets it), the newsletter form shows a "Newsletter bientôt disponible" placeholder instead of submitting.

### 5.6 Phase 2 acceptance criteria

1. Five sections render in the deployed theme, in the agreed order
2. Golden Kick card is buyable (form posts to /cart/add → /checkout); other cards show "Bientôt" with no link
3. Newsletter form posts to Klaviyo (or shows placeholder if key not set)
4. All sections work in Theme Editor (add/remove/reorder without errors)
5. `shopify theme push` has zero V1-related errors
6. Lighthouse mobile Performance ≥ 90, Accessibility ≥ 95 on full page
7. axe-core: zero violations
8. CLS < 0.1 on full scroll
9. 60fps on scroll-bound animations

---

## 6. Phase 3 — Polish (1–3 days, 1 push)

### 6.1 Scope

- **Custom cursor:** activate `snippets/volta-cursor.liquid` + `assets/volta-cursor.js`. Disabled on touch devices. Disabled in design mode. Disabled with reduced-motion.
- **Magnetic CTAs:** Apply `volta-motion.js` `magnetize` to all primary CTAs (hero buy, flavor-grid Golden Kick buy, newsletter submit).
- **Letter-drop / reveal:** Apply `volta-motion.js` `reveal` to manifesto lines and product card eyebrows.
- **Reduced-motion comprehensive pass:** verify every animation has a `prefers-reduced-motion: reduce` branch.
- **Lighthouse audit:** push Performance to ≥ 90 (mobile), Accessibility to ≥ 95.
- **axe-core scan:** target zero violations on the rendered home page.
- **Browser QA matrix:** Chrome desktop, iOS Safari, Android Chrome.
- **Cookie banner:** wire Shopify's native consent API OR install Consentmo per `.claude/rules/stack-decisions.md`.

### 6.2 Phase 3 acceptance criteria

1. All hard targets met: Lighthouse Perf ≥ 90, A11y ≥ 95, CLS < 0.1, LCP < 2.5s mobile 4G
2. axe-core: zero violations
3. Reduced-motion: every animation has a static fallback that's been visually verified
4. Theme Editor: every section editable without JS errors
5. Cross-browser QA: golden purchase path works on Chrome desktop + iOS Safari + Android Chrome
6. Keyboard-only flow: skip link → hero CTA → flavor card → newsletter → footer link, all reachable + visible focus
7. Screen reader spot-check: hero CTA announces, cart count announces on update, newsletter success announces
8. Cookie banner present, configurable, doesn't block LCP

---

## 7. What's retired vs. preserved

**Retired (deleted from theme):**
- `sections/volta-hero-v1.liquid` (replaced by `volta-hero`)
- `sections/volta-footer-legal.liquid` (replaced by `volta-footer`)
- `assets/volta-hero-v1.css` (styles fold into the new hero or are removed)

**Preserved as-is (no scope change in this spec):**
- `sections/volta-hero-banner.liquid` (alternate variant, kept for V2 options)
- `sections/volta-hero-3d.liquid` + `assets/volta-hero-3d.js` (the abandoned 3D experiment — kept for future revisit)
- `sections/volta-product-benefits.liquid` (trust block — V2 candidate)
- `sections/volta-reviews.liquid` (testimonials marquee — needs review content first)
- `sections/volta-header.liquid` (sticky nav — V2 once we have multiple pages)
- `sections/volta-subscription.liquid` (subscription band — V2 with Seal)

**Reused unchanged:**
- All `snippets/volta-*.liquid` that haven't been called out for changes
- `assets/volta-tokens.css` (overwritten with confirmed values, then reused everywhere)
- `assets/volta-motion.js`, `volta-cursor.js`, `volta-mascot.js`, `volta-preloader.js`
- Locale files (`locales/*.json`, `locales/*.schema.json`) — additions only

---

## 8. Open decisions for owner review

Mark **APPROVE** or **CHANGE** on each before I write the plan.

| # | Decision | My recommendation | Alt |
|---|---|---|---|
| 1 | Hero copy: "VOLTA" wordmark + eyebrow ticker, no slogan | APPROVE | Add a single sentence below the wordmark (e.g., "Charge ton jus") |
| 2 | Newsletter form provider in footer (Phase 2) | Klaviyo (uses existing `volta_klaviyo_public_key` setting; shows placeholder if empty) | Native Shopify email signup, or skip newsletter for V1 |
| 3 | Other-flavor CTA wording (Phase 2) | "BIENTÔT" disabled pill | "ME PRÉVENIR" w/ email capture, or no CTA |
| 4 | Per-flavor accent colors for Maxi Focus + Fire Fighter | I'll pull from design-extract or prototype `preview/v1.css`; if not defined I'll propose | Owner provides |
| 5 | Cookie banner provider (Phase 3) | Shopify's native consent mode if available; else Consentmo free tier | Other (paid) |
| 6 | Custom cursor on/off (Phase 3) | ON (desktop only, off on touch + reduced-motion + design mode) | Off entirely — "feels too gimmicky" risk |
| 7 | Mascot scroll states (Phase 3) | Idle (hero) → discharge (when product grid appears) → celebrate (when cart updates) | Only idle for V1 |
| 8 | Header/nav for V1 | None — single page | Sticky header w/ logo + FR/EN toggle (would be Phase 3 or V1.5) |

---

## 9. Owner punch list (carried forward from prior spec, updated)

Items the owner still needs to do that no amount of code can complete:

| Item | Required for | Status |
|---|---|---|
| Create **Golden Kick product** in Shopify admin (price 30 €, variant "pack-of-12", inventory) | Phase 1 hero CTA + Phase 2 flavor card | ⏳ |
| Create 3 placeholder products (Maxi Focus, Green Flag, Fire Fighter) — marked "draft" or "out of stock" | Phase 2 flavor grid (for "Bientôt" cards) | ⏳ Optional — grid can hard-code placeholders if products don't exist |
| Create 4 legal pages (`mentions-legales`, `cgv`, `confidentialite`, `livraison-retour`) | Phase 2 footer links | ⏳ |
| Set `volta_klaviyo_public_key` in Theme Editor → Settings | Phase 2 newsletter | ⏳ Optional — fallback placeholder works without it |
| Upload **Volta hero video** (≤ 3 MB MP4) — optional, design works without it | Phase 1 hero (or V2 polish) | ⏳ Optional in this design — indigo + lightning carries the hero on its own |
| Upload **Golden Kick product photo** | Phase 2 flavor card | ⏳ Optional — can ship without imagery initially |
| Validate **TVA / VAT rate** with accountant | Pre-launch | ⏳ |
| Disable **"Coming soon" password page** when going live | Launch day | ⏳ |
| Confirm **Adobe Fonts kit `gjt3qnf`** is licensed for the live domain (not just dev) | Phase 1 + everything after | ✅ Confirmed by owner 2026-05-14 |
| Cookie banner content/copy decisions | Phase 3 | ⏳ |

---

## 10. Risks + mitigations

| Risk | Mitigation |
|---|---|
| Typekit kit not yet loaded for `volta-drinks.myshopify.com` despite license | Phase 1 first task verifies Typekit loads in browser preview before locking the hero design to Dunbar Tall. Fallback: a self-hosted free condensed-italic display font that approximates Dunbar Tall's geometric voice (specific font chosen at fallback time — not the existing Bricolage Grotesque, which has a different feel). |
| Lightning JS performance regression on lower-end devices | IntersectionObserver pauses when off-screen + frame-rate guard + reduced-motion bypass. Test on a 5-year-old laptop early in Phase 1. |
| Part B dormant sections may not match V1 design — they were built before the confirmed palette was locked | Audit each section in Phase 2 implementation; refactor inline as needed (it's expected, not a regression). |
| Klaviyo newsletter integration brittle if key not set yet | Section logic: if key is empty, show placeholder text instead of form. No JS errors. |
| Schema validation errors cascade (each push reveals next) | Phase 1 first push will reveal them all at once because so many dormant sections are still in the theme. Plan a "schema cleanup" task as part of Phase 2 prep. |
| Mascot eye-tracking on phones (no cursor) | Mascot eye-tracking is desktop-only (`pointer: fine` media query); on touch devices, mascot just idles. |

---

## 11. What success looks like at the end of Phase 3

Open the preview URL on a fresh device → see indigo deep-space hero with lightning firing + mascot watching the cursor + Dunbar Tall "VOLTA" wordmark + scroll smoothly past a 4-flavor grid (Golden Kick buyable, others teased) past the 60 ml band past the manifesto into a full footer with newsletter. Click "ACHETER" → land on Shopify checkout with Golden Kick × 1 in cart. Reduced-motion preview works. Lighthouse mobile ≥ 90 / 95 / 90 / 90. axe-core clean. Cross-browser clean.

A **brand experience**, not a CSS skeleton.

---
