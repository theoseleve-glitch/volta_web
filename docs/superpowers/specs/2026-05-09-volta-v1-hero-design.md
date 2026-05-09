# Volta V1 — Hero Design Spec

**Date:** 2026-05-09
**Status:** Draft (pending owner approval)
**Owner:** Théo Sélève
**Skill flow:** `superpowers:brainstorming` → next: `superpowers:writing-plans`

---

## 1. Overview

Single-page V1 launch site for Volta Drinks' first product, **Golden Kick** — functional energy shot, 60 ml, ginger 10% + pineapple + mango, pressed in France.

**Goal:** direct sale, single SKU at 30 € for a pack of 12 shots, zero-friction checkout flow.

**Scope:** intentionally minimal — one section (hero) + a single-line legal footer. The full multi-section site (4 flavors, subscription, story, FAQ, brand narrative) is deferred to V2.

---

## 2. Locked decisions (from brainstorming session)

| # | Decision | Choice |
|---|---|---|
| 1 | Goal of the page | C — Direct sale (Golden Kick in stock, ready to ship) |
| 2 | SKU | A — Single variant: pack of 12 at 30 € |
| 3 | Visual asset direction | A — Photo packshot (placeholder until owner provides photo) |
| 4 | Hero density | B — Standard (logo + photo + name + tagline + description + format + price + CTA) |
| 5 | Page structure | A — Hero + minimal footer (no separate header) |
| 6 | Layout composition | 4 — Full-bleed colored hero with overlay |
| 7 | Background | Video as hero background (file provided later by owner) |
| 8 | Composition layers | A — Video bg + photo bottle overlay + text overlay |
| 9 | UX approach | A — "Sniper" / conversion-pure (direct-to-checkout, qty locked at 1, no email capture) |
| 10 | Mobile video | Yes — video plays on mobile too (with < 3 MB compression budget) |

---

## 3. Architecture & files

### Created (V1)
- `sections/volta-hero-v1.liquid` — V1 hero section (video + photo overlay + text + buy form)
- `sections/volta-footer-legal.liquid` — minimal footer (5 inline links + copyright)
- `assets/volta-hero-v1.css` — section-specific styles

### Modified (V1)
- `templates/index.json` — references **only** `volta-hero-v1` and `volta-footer-legal`
- `locales/fr.default.json` — adds `sections.volta_hero_v1.*` and `sections.volta_footer_legal.*` keys
- `locales/en.json` — same keys with `[EN: TODO]` placeholders (FR is V1 default)

### Untouched (dormant — preserved for V2)
- 13 existing custom `volta-*` sections (`volta-hero.liquid`, `volta-products.liquid`, `volta-subscription.liquid`, `volta-story.liquid`, etc.)
- Design system files (`assets/volta-tokens.css`, Dunbar fonts, mascot SVG, brand assets)
- Snippets (`volta-mascot.liquid`, `volta-cursor.liquid`, etc.)

### Shopify CMS pages (created in admin, not in theme)
- `/pages/mentions-legales`
- `/pages/cgv`
- `/pages/confidentialite`
- `/pages/livraison-retour`
- `/pages/contact` (or `mailto:contact@voltadrinks.com` link only)

These pages use Dawn's default `templates/page.liquid` — no custom design for V1.

---

## 4. Components & content

### Hero structure (3 stacked layers + 2 floating elements)

```
┌───────────────────────────────────────────────────┐
│ [Logo Volta]                          [🛒 panier] │  ← floating top
│  ╔═════════════════════════════════════════════╗  │
│  ║ Layer 1 : VIDEO (full-bleed, autoplay loop) ║  │
│  ║   Layer 2 : photo packshot (right ~50%)  →  ║  │
│  ║                                              ║  │
│  ║   Layer 3 (bottom-left, on overlay scrim):  ║  │
│  ║     LE SHOT FONCTIONNEL                     ║  │
│  ║     GOLDEN KICK                             ║  │
│  ║     Le shot qui frappe.                     ║  │
│  ║     Gingembre 10%, ananas, mangue. 60 ml…   ║  │
│  ║     Pack de 12 · 30 €                       ║  │
│  ║     [ ACHETER — 30 € → ]                    ║  │
│  ╚═════════════════════════════════════════════╝  │
└───────────────────────────────────────────────────┘
```

### Schema settings (Theme Editor)

| Setting | Type | Default | Purpose |
|---|---|---|---|
| `hero_video` | `video` | (empty) | Background video; falls back to poster if absent |
| `hero_poster` | `image_picker` | (empty) | Still image: video poster + LCP candidate |
| `hero_photo` | `image_picker` | (empty) | Bottle packshot overlay; element skipped if null |
| `hero_product` | `product` | (manual: Golden Kick) | Source of variant ID + price |
| `tagline` | `text` | "Le shot qui frappe." | Editable in admin |
| `description` | `richtext` | "Gingembre 10%, ananas, mangue. 60 ml. Pressé en France, sans sucre ajouté." | Editable in admin |
| `cta_label` | `text` | "ACHETER" | Price interpolated dynamically as suffix |

### Copy (FR — V1 launch)

- **Eyebrow:** `LE SHOT FONCTIONNEL`
- **Title:** `GOLDEN KICK` (Dunbar Tall, italic, display)
- **Tagline:** "Le shot qui frappe."
- **Description:** "Gingembre 10%, ananas, mangue. 60 ml. Pressé en France, sans sucre ajouté."
- **Format / price:** "Pack de 12 · 30 €"
- **CTA:** "ACHETER — 30 € →"

### Footer (single-line, mono type)

```
Mentions légales · CGV · Confidentialité · Livraison & retour · contact@voltadrinks.com    © 2026 Volta Drinks
```

Each link is an `<a href="/pages/X">`. Email is `<a href="mailto:contact@voltadrinks.com">`.

---

## 5. Data flow

### Server-side render (Liquid)

- Reads section settings + product data
- Computes variant ID and price dynamically (no hardcoded values)
- Outputs HTML with explicit `width`/`height` on `<img>` and `<video>` (CLS prevention)
- Inlines critical CSS for above-the-fold; defers the rest

### Buy CTA flow (Approach A — direct-to-checkout)

```html
<form action="/cart/add" method="post">
  <input type="hidden" name="id" value="{{ variant_id }}">
  <input type="hidden" name="quantity" value="1">
  <input type="hidden" name="return_to" value="/checkout">
  <button type="submit" class="hero__cta">
    ACHETER — {{ product.price | money }} →
  </button>
</form>
```

→ POST adds variant to cart server-side; `return_to=/checkout` redirects past the cart page directly to Shopify Checkout. Zero JS required, works with JS disabled.

### Cart icon (top-right)

- `<a href="/cart">` with `cart.item_count` badge
- Renders muted (no badge) when cart is empty
- `/cart` page uses Dawn default template (no V1 customization)

### Video element

```html
<video class="hero__video"
       autoplay muted loop playsinline
       poster="{{ poster_url }}"
       preload="metadata"
       aria-hidden="true">
  <source src="{{ video_mp4_url }}" type="video/mp4">
</video>
```

- `preload="metadata"` defers actual video bytes until needed
- `poster` is the LCP candidate (loads before video, stays if video fails)
- `playsinline` mandatory for iOS autoplay
- `muted` mandatory for autoplay across all browsers (anti-ad-blocker policy)

### Photo packshot (responsive)

```liquid
<img src="{{ section.settings.hero_photo | image_url: width: 1200 }}"
     srcset="{{ section.settings.hero_photo | image_url: width: 600 }} 600w,
             {{ section.settings.hero_photo | image_url: width: 1200 }} 1200w,
             {{ section.settings.hero_photo | image_url: width: 2000 }} 2000w"
     sizes="(min-width: 768px) 50vw, 100vw"
     width="1200" height="1500"
     loading="eager"
     fetchpriority="high"
     alt="Bouteille Golden Kick — pack de 12 shots">
```

Shopify CDN handles WebP conversion + resizing automatically.

---

## 6. Fallbacks & accessibility

### Failure modes

| Scenario | Fallback |
|---|---|
| Video missing (file not uploaded yet) | Poster image displays. If poster also empty, gradient `#7b3dd4 → #fbee49` shows |
| Photo packshot missing | Photo overlay element skipped via Liquid conditional — composition still valid |
| `prefers-reduced-motion: reduce` | Video hidden via CSS, poster shown statically; text fade-in disabled |
| JavaScript disabled | Buy form still works (HTML POST). Animations skipped. Page fully functional |
| Product out of stock | CTA replaced with "Bientôt de retour", form disabled (no POST allowed) |
| Theme Editor design mode (`window.Shopify.designMode`) | Video paused programmatically (iframe lag) |
| Mobile / 3G | Video still loads (per decision #10), but compressed to < 3 MB MP4 |

### Accessibility (WCAG 2.1 AA, RGAA-compatible)

| Element | A11y treatment |
|---|---|
| Video | `aria-hidden="true"`, no audio (decorative) |
| Photo | `alt="Bouteille Golden Kick — pack de 12 shots"` |
| Logo | `<a href="/" aria-label="Volta Drinks — accueil">` |
| Cart icon | `aria-label="Voir le panier (X article)"` (count interpolated) |
| Buy button | Real `<button type="submit">`, focus-visible style |
| Footer links | Tab-navigable, `:focus-visible` 2px solid `var(--yellow)` with 2px offset |
| Color contrast | Bottom-left text overlay sits on a 15-25% dark scrim to guarantee WCAG AA contrast on bright video frames |
| Skip-to-content link | Standard, hidden until focused |

---

## 7. Tests & validation

### Pre-commit (every change)
- `shopify theme check` — zero errors, zero warnings on new files
- All user-facing strings via `{{ 'key' | t }}` (no hardcoded FR/EN text)

### Pre-launch (ship-blockers, non-negotiable)
- **Lighthouse mobile:** Performance ≥ 90, Accessibility ≥ 95, CLS < 0.1, LCP < 2.5 s, Best Practices ≥ 90
- **axe-core:** zero violations on the home + each legal page
- **Manual purchase flow** on Chrome desktop, iOS Safari (real device), Android Chrome (real device)
- **JS-disabled purchase test** (DevTools → Disable JS → still buyable)
- **Reduced-motion test** (macOS Reduce Motion ON → video hidden, page still works)
- **Theme Editor compatibility:** add / remove / reorder section without JS errors, change every setting

### French legal compliance (non-negotiable before live sale)
- 4 legal pages exist with content reviewed by counsel (or competent template)
- Cookie banner active (Shopify admin → Settings → Customer Privacy)
- VAT correctly applied at checkout (20 % on functional beverages — to validate with accountant)
- "Droit de rétractation" + perishable goods exception clause displayed at checkout

### Bilingual readiness
- FR: 100 % at launch
- EN: keys exist with `[EN: TODO]` placeholders; full translation target = V1.5

---

## 8. Out of scope (V1)

- Multi-flavor product grid
- Subscription / Seal Subscriptions integration
- Cart drawer (cart page is Dawn default)
- Email capture / newsletter signup
- Story / brand narrative section
- FAQ
- Reviews / social proof
- Mascot animations (snippet preserved, not used)
- Lenis smooth scroll
- GSAP scroll-triggered animations
- A/B testing
- Analytics integrations: Klaviyo / Meta Pixel / GTM (V1.5)

---

## 9. Open dependencies (owner action items)

| Item | Owner | Blocking? |
|---|---|---|
| Hero video file (MP4 H.264, < 3 MB, 720p, ~10–15 s loop, no audio) | Théo | **Soft** — placeholder works for dev/QA |
| Golden Kick packshot photo (high-res, neutral background, ~2000 px) | Théo | **Soft** — placeholder works for dev/QA |
| Legal page content (mentions / CGV / confidentialité / livraison-retour) | Théo or legal counsel | **HARD** — required before live sale in France |
| Shopify product creation (Golden Kick SKU, single variant, price 30 €, inventory > 0) | Théo (admin) | **HARD** — required for purchase test |
| VAT validation with accountant | Théo / accountant | **HARD** — required before live sale |
| EN translations for `locales/en.json` | Théo or translator | Soft — V1.5 |
| Cart drawer behaviour for `/cart` page | (deferred to V2) | None — Dawn default fine for V1 |

---

## 10. Next steps

1. Owner reviews this spec → approves or requests revisions
2. Invoke `superpowers:writing-plans` skill → produces detailed step-by-step implementation plan
3. Implement per plan (estimated: 1 day for Liquid section + footer + index.json wiring + locales)
4. QA + Lighthouse + manual purchase flow tests
5. `shopify theme push --unpublished` to staging theme
6. Owner: create legal pages + product in Shopify admin
7. Owner: upload video + photo via Theme Editor (or commit to `/assets/`)
8. Final QA on staging URL
9. Publish (admin → Themes → Publish)

---

## 11. Pre-launch owner punch list

Closing Task 9 in the implementation plan revealed that several gates from spec section 7 cannot be verified statically on the dev box: Shopify CLI is not installed, no live store is connected, and the Golden Kick product does not yet exist in the merchant admin. Static review of the 14 commits on `feature/v1-hero` is green; the items below MUST happen on the owner side before the theme can ship to production.

### A. Tooling install (dev machine)
- [ ] Install Shopify CLI: `npm install -g @shopify/cli @shopify/theme`
- [ ] Run `shopify theme check` from the repo root — must report **zero errors and zero warnings on new files** (`sections/volta-hero-v1.liquid`, `sections/volta-footer-legal.liquid`, `assets/volta-hero-v1.css`, `templates/index.json`, the four locale files)
- [ ] Install `jq` if you want the Claude-Flow hooks to run in non-degraded mode (optional; reference: `reference_env_gaps.md` memory entry)

### B. Shopify admin — content
- [ ] **Create the Golden Kick product** in Shopify admin: Products → Add product
  - Title: `Golden Kick`
  - Single variant, price `30.00 EUR`, inventory ≥ 1
  - Status: `Active`
  - Without this, the buy form falls back to the disabled "Bientôt de retour" branch
- [ ] **Create the 4 legal pages** in Shopify admin: Online Store → Pages
  - Handle `mentions-legales` — content reviewed by counsel (or French ecommerce template)
  - Handle `cgv` — General terms of sale, French consumer law compliant
  - Handle `confidentialite` — RGPD-compliant privacy policy
  - Handle `livraison-retour` — Shipping + the perishable-goods exception to the 14-day right of withdrawal
  - Until these exist, the footer links 404
- [ ] Verify `mailto:contact@voltadrinks.com` resolves to a monitored inbox (or change the section's `contact_email` setting)

### C. Shopify admin — settings
- [ ] **Enable Customer Privacy / cookie banner**: Settings → Customer Privacy → enable cookie banner with FR text
- [ ] **Validate VAT** with accountant — likely 20 % on functional beverages; configure under Settings → Taxes & Duties
- [ ] Confirm shipping zones (France first, EU later if relevant) and payment methods (Shopify Payments / SEPA / cards)
- [ ] Confirm Right of Withdrawal language is surfaced at checkout (Shopify Checkout templates have a built-in slot for legal copy)

### D. Theme Editor — media uploads (do via admin Theme Editor, not committed to `/assets/`)
- [ ] **Upload Golden Kick packshot photo** (`hero_photo` setting in the V1 hero section). Recommended ≥ 1200 × 1500 px, neutral background. Verify alt text in the image picker is descriptive ("Bouteille Volta Golden Kick — pack de 12 shots de 60 ml") — falls back to locale `photo_alt_default` if blank.
- [ ] **Upload hero video** (`hero_video` setting). MP4 H.264, ≤ 3 MB, 720p, ~10–15 s loop, no audio. The schema `video_info` text surfaces this 3 MB budget directly to the merchant.
- [ ] **Upload poster image** (`hero_poster` setting). 1920 × 1080 landscape; this is the LCP candidate while the video buffers and the reduced-motion fallback.
- [ ] After upload, verify in the Theme Editor that all three media settings render without console errors (Theme Editor dispatches `shopify:section:load` on each change — the inline `applyMotionPolicy` script must keep up).

### E. Deploy + audit (after B/C/D)
- [ ] **Push theme to unpublished**: `shopify theme push --unpublished --json` (or `--theme-id <id>` to keep iterating on the same staging theme — see `gotchas.md` "1,000 file limit")
- [ ] **Run Lighthouse mobile** against the unpublished theme URL: `npx lighthouse <staging-url> --form-factor=mobile --preset=perf --view`
  - Performance ≥ 90
  - Accessibility ≥ 95
  - CLS < 0.1
  - LCP < 2.5 s
  - Best Practices ≥ 90
- [ ] **Run axe-core**: `npx @axe-core/cli <staging-url>` — zero violations
- [ ] **Manual purchase flow** with Shopify test mode (card `4242 4242 4242 4242`, any future expiry, any CVV):
  - Chrome desktop
  - iOS Safari (real device)
  - Android Chrome (real device)
  - Verify: ACHETER → POST `/cart/add` → redirect `/checkout` → checkout shows "Golden Kick × 1, 30 €"
- [ ] **JS-disabled purchase test** (Chrome DevTools → ⚙️ → Debugger → Disable JavaScript → reload → click ACHETER) — must POST and reach checkout
- [ ] **Reduced-motion test** (macOS: System Settings → Accessibility → Display → Reduce Motion ON → reload) — video hidden, poster shown, CTA hover does not transform, page fully functional
- [ ] **Theme Editor compatibility**: in the editor, add / remove / reorder the V1 hero section, edit each setting (title, tagline, description, cta_label, video, poster, photo, product, contact_email) — no JS console errors
- [ ] **Dormant V2 sections sanity check**: in the Theme Editor "Add section" picker, verify that adding any of the 13 dormant `volta-*` V2 sections (`volta-hero`, `volta-products`, `volta-subscription`, etc.) does not crash the page — they may render with placeholder content but must not error
- [ ] **Lenis / design mode**: confirm video pauses in the Theme Editor preview (the inline IIFE checks `window.Shopify?.designMode`)

### F. Bilingual (V1.5)
- [ ] Replace every `[EN: TODO]` placeholder in `locales/en.json` and `locales/en.schema.json` with the final translation
- [ ] Activate EN locale via Shopify Markets only after both files are clean
- [ ] Verify `/en/` URLs render the EN strings without "translation missing" warnings

### G. Schema-locale gap (FIXED in Task 9)
- The original Task 1–8 implementation added the user-facing strings to `locales/fr.default.json` and `locales/en.json`, but the section schemas reference these labels via `t:` — Shopify resolves schema `t:` references from `*.schema.json`, NOT the runtime locale files. Without the schema-locale entries, Theme Editor would have rendered "translation missing" labels next to every setting.
- Fixed in Task 9 by adding the corresponding `volta_hero_v1.*` and `volta_footer_legal.*` blocks to both `locales/fr.default.schema.json` and `locales/en.schema.json` (flat string values, matching Dawn's convention).
- No re-validation needed beyond the standard `shopify theme check` step in section A above.

### H. Static review verdict
The static review of the 14 commits on `feature/v1-hero` found no other code defects. Tokens are uniform (`var(--volta-yellow,…)`, `var(--volta-ink,…)`, `var(--volta-cream,…)`, no `--ff-*` / raw `--yellow` / raw `--ink` leakage). Locale keys all resolve. CLS-safe `<img>` and `<video>` declarations everywhere. `fetchpriority` coordination is correctly conditional (`auto` when poster present, else `high`). All user-facing strings are routed through `{{ 'key' | t }}`. Reduced-motion handled both via CSS (`display: none` on video) and JS (`pause()` + `removeAttribute('autoplay')`). Theme Editor design-mode pause registered on `shopify:section:load`.
