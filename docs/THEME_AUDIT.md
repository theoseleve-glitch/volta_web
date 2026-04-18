# Theme Audit

Orientation doc for the Dawn base as it arrived in this repo. Written before we wrote any Volta-specific section code, so this captures Dawn "as-is" and our strategy for modifying it.

**Dawn version at import:** 15.4.1 (from `config/settings_schema.json` `theme_info.theme_version`)
**Date:** 2026-04-17

---

## Top-level structure

```
.
├── assets/        — 185 files (Dawn's base CSS/JS/images)
├── config/
│   ├── settings_schema.json    — 500+ settings groups Dawn exposes to the merchant
│   └── settings_data.json      — merchant customizations (GITIGNORED)
├── layout/
│   ├── theme.liquid            — 376 lines: the main wrapper, loads 6 scripts + animation.js
│   └── password.liquid         — password-protected store page
├── locales/                    — 51 files: *.json (storefront) + *.schema.json (theme editor)
├── sections/                   — 54 sections
├── snippets/                   — 37 partials
└── templates/
    ├── index.json              — homepage: 6 default sections
    ├── product.json            — product page
    ├── cart.json, collection.json, search.json, blog.json, article.json
    ├── page.json, page.contact.json, 404.json, list-collections.json, password.json
    ├── gift_card.liquid
    └── customers/              — login, register, account, order, addresses
```

---

## Config: `settings_schema.json`

Dawn ships ~12 settings groups. Relevant for our rewrite:

| Group | Volta strategy |
|---|---|
| `theme_info` | Leave alone (Dawn metadata) |
| `logo` | **Reuse** — logo + favicon settings are fine |
| `colors` | **Replace** — Dawn uses `color_scheme_group` with 5 schemes. We'll strip this down to one scheme driven by our tokens. See Prompt 2. |
| `typography` | **Replace** — Dawn uses Shopify font_picker. We're loading Google Fonts directly. |
| `layout` | **Keep partially** — page_width is useful; others TBD |
| `animations` | **Replace entirely** — Dawn's `animations_reveal_on_scroll` is built on its own animations.js. We're using GSAP/Lenis via `volta-motion.js`. |
| `buttons`, `inputs`, `cards` | **Replace** — Dawn's baseline input shadows and button styling fight our design |
| `search` | Keep |
| `currency-format`, `social-media`, `favicon` | Keep |
| `cart` | **Replace** — we're building our own cart drawer (volta-cart-drawer) |
| `badges` | Keep |

We will add Volta-specific settings groups for: analytics (GTM ID, Meta Pixel ID, Klaviyo key), motion toggles (override reduced-motion behavior per-section for editor preview), and mascot placement.

---

## Templates

### `templates/index.json` (homepage — Dawn default)

Currently loads 6 sections in this order:
1. `image_banner` (image-banner.liquid) — hero with 2 buttons
2. `rich_text` (rich-text.liquid) — brand copy block
3. `featured_collection` (featured-collection.liquid) — 8-product grid
4. `collage` (collage.liquid) — asymmetric block
5. `video` (video.liquid) — YouTube embed
6. `multicolumn` (multicolumn.liquid) — 3-column feature list

**Volta strategy:** Replace all 6. New sections (from Prompt 5): `volta-hero`, `volta-shot-band`, `volta-products`, `volta-subscription`, `volta-story`, `volta-reviews`. Dawn's existing sections stay in the theme but aren't used on homepage — the merchant can still add them via the Theme Editor if they want.

### `templates/product.json`

Loads `main-product` + related sections. We replace the main section with our own product template (Prompt 6) while keeping related-products snippet.

### Other templates

- `cart.json` — we'll keep the JSON template but replace main-cart-items/main-cart-footer with our drawer-first flow.
- `404.json` — customize with sad mascot (Prompt 8).
- `customers/*` — leave mostly alone; style to match our tokens.

---

## Critical sections

### `sections/header.liquid` (638 lines)

Dawn's header is richly featured:
- Logo position configurable (left/center), mobile logo position separately
- Menu type: drawer (mobile-style hamburger) or dropdown
- Localization forms via `{%- form 'localization' %}` — country AND language selectors, separately toggleable. We'll keep the language selector, drop the country selector for the v1.
- Header icons: search, account, cart (via `cart-icon-bubble` snippet)
- Sticky header logic exists but drives via JS on scroll direction

**Volta strategy:** Replace with a simpler custom header section that:
- Uses our tokens for typography + spacing
- Keeps the `{%- form 'localization' -%}` pattern for the FR/EN toggle
- Uses our own cart-icon bubble wired to `volta-cart-drawer` open
- Hides on scroll-down, shows on scroll-up (via `window.VoltaMotion` helper or dedicated header.js)

### `sections/footer.liquid` (545 lines)

Dawn footer has blocks: links, text, image, newsletter, brand. Standard responsive grid.

**Volta strategy:** Replace. Newsletter block stays (wired to Klaviyo in Prompt 13). Keep the block-based pattern so the client can re-order footer content.

### `sections/main-product.liquid` (2,268 lines)

Dawn's product section is massive. Key internals:
- Media gallery via `{% render 'product-media-gallery' %}` snippet (assets/media-gallery.js web component)
- Variant picker via `product-form` web component (assets/product-form.js) + variant-selects custom element
- Add to Cart form posts to `/cart/add.js` via AJAX
- Quantity selector via `quantity-input` web component
- Pickup availability via `pickup-availability.liquid` section (rendered as app block)
- Supports multiple block types: text, vendor, price, title, description, quantity_selector, variant_picker, buy_buttons, accordion, share, rating, inventory, sku, liquid

**Volta strategy:** We **replace** the section with our own `sections/main-volta-product.liquid` driven by `templates/product.json`. We **reuse**:
- The `product-form` custom element (`assets/product-form.js`) — stable, well-tested AJAX logic
- The `quantity-input` custom element — clean, accessible
- The `/cart/add.js` + `/cart/change.js` API (obviously — it's Shopify's)

We **do not reuse**:
- The gallery (we want scroll-scrubbed sticky media)
- The variant picker UI (our pack-size selector is visually different)
- The accordion styling

---

## Assets inventory (abridged)

Dawn's `assets/` has 185 files. Categorization:

- **CSS (~45 files):** `base.css` (global), `section-*.css` (per-section), `component-*.css` (component-scoped). We **keep** them all loading for Dawn sections we haven't replaced yet, and we **add** our own `volta-tokens.css` + section-specific CSS files on top.
- **JS (~35 files):** web components (product-form, cart-drawer, quantity-input, variant-selects, etc.) + utility scripts (pubsub, global, constants). We **keep** what we use (product-form, quantity-input, pubsub for cart events) and **add** our motion/cursor/mascot/cart scripts.
- **SVG icons (~80 files):** Dawn provides `icon-*.svg` snippet partials rendered via `{%- render 'icon-arrow' -%}`. We **keep** these — they're accessible and well-named.
- **Images:** Dawn placeholder images. We'll replace with Volta product photography.

---

## Modify vs Replace vs Leave alone — summary table

| Path | Disposition | Why |
|---|---|---|
| `layout/theme.liquid` | **Modify lightly** | Inject our CSS/JS, preconnect fonts, add Lenis/GSAP CDN. Keep Dawn's core primitives. |
| `layout/password.liquid` | Leave alone | Rarely touched |
| `sections/main-product.liquid` | **Replace** with `sections/main-volta-product.liquid` | Our product page is fundamentally different |
| `sections/header.liquid` | **Replace** with `sections/volta-header.liquid` | Different visual + motion |
| `sections/footer.liquid` | **Replace** with `sections/volta-footer.liquid` | Different layout, Klaviyo-wired newsletter |
| `sections/cart-drawer.liquid` | **Remove from use** (keep file for reference) — we build `volta-cart-drawer.liquid` | Whole new design |
| `sections/featured-*`, `collage`, `multicolumn`, `rich-text`, `image-banner`, `slideshow`, `video` | Leave in theme | Client can add via Theme Editor, not default on our pages |
| `sections/main-cart-items.liquid`, `main-cart-footer.liquid` | Keep; style to match tokens | Full-page cart at `/cart` still needs to render |
| `sections/main-404.liquid` | **Replace** | Sad mascot moment |
| `sections/newsletter.liquid` | Keep; restyle | Reused in footer |
| `snippets/product-form.liquid`, `product-variant-picker.liquid` | **Reuse the logic, replace the markup** | We want a different variant UI but same AJAX flow |
| `snippets/icon-*.liquid` | Keep all | Accessible, well-named SVG icons |
| `snippets/cart-drawer.liquid` | **Remove from use** | Replaced by volta-cart-drawer |
| `assets/base.css` | Keep loading | Dawn sections we're keeping depend on it |
| `assets/product-form.js` | Keep loading | We reuse this web component |
| `assets/cart-drawer.js` | **Remove from load order** | We replace with `volta-cart.js` |
| `assets/animations.js` | Leave loaded only when `animations_reveal_on_scroll` theme setting is on | Dawn's reveal animations — superseded by our GSAP |
| `assets/*.svg` (icons) | Keep all | Reused |
| `config/settings_schema.json` | **Modify heavily** | Add Volta settings groups, strip Dawn color/type settings |
| `config/settings_data.json` | **Never touch** | Merchant-controlled, gitignored |
| `locales/en.default.json` + `fr.json` | **Modify** — add Volta namespaces | Extend, don't replace |
| `locales/*.schema.json` | **Modify lightly** | We already patched `en.default.schema.json` and `fr.schema.json` for Dawn's own missing-key bug |
| `locales/bg, cs, da, de, ...` (40 other locales) | Leave alone | Not launching with those. If the client later enables them, they can be cleaned up then. |
| `templates/index.json` | **Replace contents** | Volta's homepage sections |
| `templates/product.json` | **Modify** — reference volta-product | Different section |
| `templates/404.json` | **Modify** | Sad mascot |
| `templates/customers/*` | Leave structurally, style to tokens | Low-traffic, high-polish-cost |

---

## Recommended modification sequence

(Matches Phase 1 of `BUILD_PLAN.md` and Prompts 1-4 of `VOLTA_PART_B_Claude_Code_Prompts.md`.)

1. ✅ Theme audit (this doc) — Prompt 1
2. Design tokens CSS + Google Fonts — Prompt 2
3. Motion foundation (Lenis + GSAP) — Prompt 3
4. Custom cursor — Prompt 4

Then structure (Prompts 5–6) → commerce (Prompts 7–9) → polish (Prompts 10–12) → launch (Prompts 13–14).

---

## Deviations from Part B noted during audit

1. **Prompt 11 says WebP/AVIF.** Dawn's `image_url` filter does not support AVIF (confirmed in `.claude/rules/gotchas.md`). We serve WebP only.
2. **Dawn's color scheme system is elaborate** (color_scheme_group, multiple schemes). Rather than fight it, we'll define one scheme ("volta") that all our sections use, and strip the merchant's ability to create more schemes from the settings schema. Simpler, less editor confusion.
3. **Dawn already has `featured-product.liquid`** (not homepage default but available). We'll ignore it — our `volta-products` section is purpose-built for our 4-SKU grid.
