# Volta V1 Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Volta V1 single-page launch site — a full-bleed hero with video bg + photo overlay + direct-to-checkout buy form, plus a minimal legal footer.

**Architecture:** Two new Shopify Liquid sections (`volta-hero-v1`, `volta-footer-legal`) wired into a stripped-down `templates/index.json`. Existing V2 sections stay in `sections/` but are unreferenced (dormant). Uses Shopify-native form POST for the buy flow (no JS dependency for purchase). Video and photo are owner-uploaded via Theme Editor.

**Tech Stack:** Shopify Liquid (Online Store 2.0), JSON templates, Dawn base theme conventions, vanilla CSS with brand design tokens, optional minimal inline JS for Theme Editor design-mode handling.

**Spec reference:** `docs/superpowers/specs/2026-05-09-volta-v1-hero-design.md`

**Pre-flight:**
- Confirm you're on a feature branch (not `main`): `git checkout -b feature/v1-hero` if not already
- Confirm Shopify CLI installed: `shopify --version` — install via `npm install -g @shopify/cli @shopify/theme` if missing
- Owner pre-requisite (NOT blocking dev, but blocking *purchase tests*): create the Golden Kick product in Shopify admin (single variant, 30 €, inventory > 0)

---

## Task 1: Bootstrap — locale keys + section skeletons + CSS file + V1 index.json

**Goal:** Get a V1 wireframe rendering. After this task, the home shows two empty placeholder sections that pass `shopify theme check`.

**Files:**
- Modify: `locales/fr.default.json` (add `sections.volta_hero_v1.*` and `sections.volta_footer_legal.*` blocks)
- Modify: `locales/en.json` (same keys with `[EN: TODO]` placeholders)
- Create: `sections/volta-hero-v1.liquid`
- Create: `sections/volta-footer-legal.liquid`
- Create: `assets/volta-hero-v1.css`
- Modify: `templates/index.json` (replace contents with V1-only sections)

- [ ] **Step 1:** Add the FR locale block. Open `locales/fr.default.json`, find the existing top-level `"sections"` object (or add it if missing), and merge in:

```json
"volta_hero_v1": {
  "name": "Hero V1 — Golden Kick",
  "eyebrow": "Le shot fonctionnel",
  "title_default": "Golden Kick",
  "tagline_default": "Le shot qui frappe.",
  "description_default": "<p>Gingembre 10%, ananas, mangue. 60 ml. Pressé en France, sans sucre ajouté.</p>",
  "format": "Pack de 12",
  "cta_default": "Acheter",
  "cta_unavailable": "Bientôt de retour"
},
"volta_footer_legal": {
  "name": "Footer V1 — Légal",
  "mentions": "Mentions légales",
  "cgv": "CGV",
  "confidentialite": "Confidentialité",
  "livraison": "Livraison & retour",
  "contact_email_label": "Email contact",
  "contact_email_info": "Adresse affichée comme lien mailto dans le footer"
}
```

- [ ] **Step 2:** Mirror the same keys in `locales/en.json` with `[EN: TODO] …` placeholder values:

```json
"volta_hero_v1": {
  "name": "[EN: TODO] Hero V1 — Golden Kick",
  "eyebrow": "[EN: TODO] The functional shot",
  "title_default": "Golden Kick",
  "tagline_default": "[EN: TODO] The shot that hits.",
  "description_default": "<p>[EN: TODO] Ginger 10%, pineapple, mango. 60 ml. Pressed in France, no added sugar.</p>",
  "format": "[EN: TODO] Pack of 12",
  "cta_default": "[EN: TODO] Buy",
  "cta_unavailable": "[EN: TODO] Back soon"
},
"volta_footer_legal": {
  "name": "[EN: TODO] Footer V1 — Legal",
  "mentions": "[EN: TODO] Legal notices",
  "cgv": "[EN: TODO] Terms",
  "confidentialite": "[EN: TODO] Privacy",
  "livraison": "[EN: TODO] Shipping & returns",
  "contact_email_label": "[EN: TODO] Contact email",
  "contact_email_info": "[EN: TODO] Address shown as a mailto link in the footer"
}
```

- [ ] **Step 3:** Create `sections/volta-hero-v1.liquid` with this minimal skeleton (will grow in later tasks):

```liquid
{%- comment -%}
  volta-hero-v1.liquid — V1 hero (full-bleed video + photo + text overlay)
  Spec: docs/superpowers/specs/2026-05-09-volta-v1-hero-design.md
{%- endcomment -%}

{{ 'volta-hero-v1.css' | asset_url | stylesheet_tag }}

<section class="v-hero-v1" aria-labelledby="hero-v1-heading-{{ section.id }}">
  <h1 id="hero-v1-heading-{{ section.id }}" class="v-hero-v1__title">
    {{ 'sections.volta_hero_v1.title_default' | t }}
  </h1>
</section>

{% schema %}
{
  "name": "t:sections.volta_hero_v1.name",
  "tag": "section",
  "class": "v-hero-v1-section",
  "settings": [],
  "presets": [
    { "name": "t:sections.volta_hero_v1.name" }
  ]
}
{% endschema %}
```

- [ ] **Step 4:** Create `sections/volta-footer-legal.liquid` with minimal skeleton:

```liquid
{%- comment -%}
  volta-footer-legal.liquid — Single-line legal footer
  Spec: docs/superpowers/specs/2026-05-09-volta-v1-hero-design.md
{%- endcomment -%}

<footer class="v-footer-legal" role="contentinfo">
  <p>© {{ 'now' | date: '%Y' }} {{ shop.name }}</p>
</footer>

{% schema %}
{
  "name": "t:sections.volta_footer_legal.name",
  "tag": "footer",
  "settings": [
    {
      "type": "email",
      "id": "contact_email",
      "label": "t:sections.volta_footer_legal.contact_email_label",
      "info": "t:sections.volta_footer_legal.contact_email_info",
      "default": "contact@voltadrinks.com"
    }
  ],
  "presets": [
    { "name": "t:sections.volta_footer_legal.name" }
  ]
}
{% endschema %}
```

- [ ] **Step 5:** Create `assets/volta-hero-v1.css` with the layout scaffolding (layers will be styled in later tasks):

```css
/* assets/volta-hero-v1.css — V1 hero layout */

.v-hero-v1 {
  position: relative;
  width: 100%;
  min-height: 100svh;
  overflow: hidden;
  /* Brand gradient — fallback when no video/poster uploaded */
  background: linear-gradient(135deg, #7b3dd4 0%, #fbee49 100%);
}

.v-hero-v1__title {
  /* Placeholder centering for skeleton — will be repositioned in Task 2 */
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display, system-ui);
  font-style: italic;
  font-weight: 900;
  font-size: var(--text-hero, clamp(48px, 9vw, 144px));
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: #fff;
  margin: 0;
  text-align: center;
  z-index: 5;
}
```

- [ ] **Step 6:** Replace `templates/index.json` contents with the V1-only template (existing V2 contents are preserved in git history — no manual backup needed):

```json
{
  "sections": {
    "hero": {
      "type": "volta-hero-v1",
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

- [ ] **Step 7:** Run `shopify theme check`. Expected: zero errors, zero warnings on the new files.

```bash
shopify theme check
```

If errors appear, read the message — the most common issue is malformed `t:` references in schema or missing locale keys. Verify steps 1, 2, 3, 4 are saved.

- [ ] **Step 8:** Start the dev preview to visually verify:

```bash
shopify theme dev --store=<your-store>.myshopify.com
```

Open the URL the CLI prints. You should see a purple→yellow gradient page with "GOLDEN KICK" centered, and a tiny copyright line at the bottom. No errors in browser console.

- [ ] **Step 9:** Commit:

```bash
git add locales/fr.default.json locales/en.json sections/volta-hero-v1.liquid sections/volta-footer-legal.liquid assets/volta-hero-v1.css templates/index.json
git commit -m "feat(v1): bootstrap hero-v1 + footer-legal skeletons; switch index.json to V1 scope"
```

---

## Task 2: Hero — text overlay layer

**Note:** All settings-with-locale-fallback use `{%- if X != blank -%}{{ X }}{%- else -%}{{ 'key' | t }}{%- endif -%}` — never `| default: 'key' | t` (Liquid pipes any non-blank value through `| t` and produces 'translation missing').

**Goal:** Replace the centered placeholder title with the full text content (eyebrow, title, tagline, description, format) positioned bottom-left, with proper schema settings for owner editing.

**Files:**
- Modify: `sections/volta-hero-v1.liquid` (markup + schema)
- Modify: `assets/volta-hero-v1.css` (text overlay styles)

- [ ] **Step 1:** Replace the section markup in `sections/volta-hero-v1.liquid` (between `{{ ... | stylesheet_tag }}` and `{% schema %}`) with the locale-driven version below. *This step also requires adding schema-label keys to both locales — see Step 1a below.*

```liquid
<section class="v-hero-v1" aria-labelledby="hero-v1-heading-{{ section.id }}">
  <div class="v-hero-v1__overlay">
    <p class="v-hero-v1__eyebrow">{{ 'sections.volta_hero_v1.eyebrow' | t }}</p>
    <h1 id="hero-v1-heading-{{ section.id }}" class="v-hero-v1__title">
      {%- if section.settings.title != blank -%}
        {{ section.settings.title }}
      {%- else -%}
        {{ 'sections.volta_hero_v1.title_default' | t }}
      {%- endif -%}
    </h1>
    <p class="v-hero-v1__tagline">
      {%- if section.settings.tagline != blank -%}
        {{ section.settings.tagline }}
      {%- else -%}
        {{ 'sections.volta_hero_v1.tagline_default' | t }}
      {%- endif -%}
    </p>
    <div class="v-hero-v1__description">
      {%- if section.settings.description != blank -%}
        {{ section.settings.description }}
      {%- else -%}
        <p>{{ 'sections.volta_hero_v1.description_default' | t }}</p>
      {%- endif -%}
    </div>
    <p class="v-hero-v1__format">
      {{ 'sections.volta_hero_v1.format' | t }}
    </p>
  </div>
</section>
```

Notes on the fallback pattern:
- `title`, `tagline`, and (later) `cta_label` are plain text settings. Use the explicit `{%- if X != blank -%}{{ X }}{%- else -%}{{ 'key' | t }}{%- endif -%}` form. **Do NOT** use `{{ X | default: 'key' | t }}` — Liquid pipes the merchant's literal text through `| t`, producing `"translation missing: <text>"` whenever the setting is filled.
- `description` is a richtext setting whose default we want to render as HTML. We branch explicitly so the locale fallback gets wrapped in `<p>` and the merchant's richtext (which is already HTML) is output untouched.
- Because we rely on locale fallbacks, the schema settings have NO `default:` values — at install time settings start empty, render-time fallback fires, content still appears.

- [ ] **Step 1a:** Add the schema-label locale keys before touching the schema. Open `locales/fr.default.json`, find the existing `sections.volta_hero_v1` block (added in Task 1), remove the `<p>...</p>` wrapping from `description_default` (markup now provides the wrapper), and add a nested `settings` block:

```json
"volta_hero_v1": {
  "name": "Hero V1 — Golden Kick",
  "eyebrow": "Le shot fonctionnel",
  "title_default": "Golden Kick",
  "tagline_default": "Le shot qui frappe.",
  "description_default": "Gingembre 10%, ananas, mangue. 60 ml. Pressé en France, sans sucre ajouté.",
  "format": "Pack de 12",
  "cta_default": "Acheter",
  "cta_unavailable": "Bientôt de retour",
  "settings": {
    "text_header": "Texte du hero",
    "title_label": "Titre",
    "title_info": "Affiché en grand. Laisser vide pour utiliser la valeur par défaut.",
    "tagline_label": "Tagline",
    "description_label": "Description",
    "description_info": "Court paragraphe sous le titre. Texte simple ou HTML. Laisser vide pour la valeur par défaut."
  }
},
```

Mirror the same change in `locales/en.json` — strip the `<p>...</p>` from `description_default` and add the `settings` block with `[EN: TODO]` prefixes:

```json
"volta_hero_v1": {
  "name": "[EN: TODO] Hero V1 — Golden Kick",
  "eyebrow": "[EN: TODO] The functional shot",
  "title_default": "Golden Kick",
  "tagline_default": "[EN: TODO] The shot that hits.",
  "description_default": "[EN: TODO] Ginger 10%, pineapple, mango. 60 ml. Pressed in France, no added sugar.",
  "format": "[EN: TODO] Pack of 12",
  "cta_default": "[EN: TODO] Buy",
  "cta_unavailable": "[EN: TODO] Back soon",
  "settings": {
    "text_header": "[EN: TODO] Hero text",
    "title_label": "[EN: TODO] Title",
    "title_info": "[EN: TODO] Displayed large. Leave empty to use the default value.",
    "tagline_label": "[EN: TODO] Tagline",
    "description_label": "[EN: TODO] Description",
    "description_info": "[EN: TODO] Short paragraph below the title. Plain text or HTML. Leave empty for the default value."
  }
},
```

- [ ] **Step 2:** In `sections/volta-hero-v1.liquid`, replace the `"settings": []` line in the schema with these four settings (note: NO `default:` values — locale-driven fallback handles all defaults):

```json
"settings": [
  { "type": "header", "content": "t:sections.volta_hero_v1.settings.text_header" },
  {
    "type": "text",
    "id": "title",
    "label": "t:sections.volta_hero_v1.settings.title_label",
    "info": "t:sections.volta_hero_v1.settings.title_info"
  },
  {
    "type": "text",
    "id": "tagline",
    "label": "t:sections.volta_hero_v1.settings.tagline_label"
  },
  {
    "type": "richtext",
    "id": "description",
    "label": "t:sections.volta_hero_v1.settings.description_label",
    "info": "t:sections.volta_hero_v1.settings.description_info"
  }
],
```

- [ ] **Step 3:** Replace the `.v-hero-v1__title` block in `assets/volta-hero-v1.css` and append these new rules:

```css
/* Replace the placeholder .v-hero-v1__title rule with this overlay block */

.v-hero-v1__overlay {
  position: absolute;
  left: clamp(20px, 4vw, 64px);
  bottom: clamp(48px, 10vh, 120px);
  max-width: min(560px, 60vw);
  z-index: 5;
  color: #fff;
}

.v-hero-v1__eyebrow {
  font-family: var(--font-body, system-ui);
  font-size: clamp(10px, 1vw, 12px);
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin: 0 0 16px;
  opacity: 0.9;
}

.v-hero-v1__title {
  font-family: var(--font-display, system-ui);
  font-style: italic;
  font-weight: 900;
  font-size: var(--text-hero, clamp(48px, 9vw, 144px));
  line-height: 0.85;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  margin: 0 0 16px;
}

.v-hero-v1__tagline {
  font-family: var(--font-display, system-ui);
  font-style: italic;
  font-size: clamp(20px, 2.5vw, 32px);
  line-height: 1.1;
  margin: 0 0 12px;
}

.v-hero-v1__description {
  font-family: var(--font-body, system-ui);
  font-size: clamp(14px, 1.4vw, 18px);
  line-height: 1.4;
  margin: 0 0 16px;
  opacity: 0.95;
}

.v-hero-v1__description p { margin: 0; }

.v-hero-v1__format {
  font-family: var(--font-body, system-ui);
  font-size: clamp(11px, 1vw, 13px);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin: 0;
  opacity: 0.85;
}
```

- [ ] **Step 4:** Run `shopify theme check`. Expected: zero errors.

- [ ] **Step 5:** Reload the dev preview. Verify:
  - Bottom-left of hero shows: small eyebrow → big italic title → tagline → description → format
  - No layout shift on load
  - Text is white, readable on the gradient

- [ ] **Step 6:** Open the Theme Editor (admin → Customize the active theme). Verify the section settings appear under "Texte" header and editing them updates the preview live.

- [ ] **Step 7:** Commit:

```bash
git add locales/fr.default.json locales/en.json sections/volta-hero-v1.liquid assets/volta-hero-v1.css
git commit -m "feat(hero-v1): add text overlay layer with editable copy"
```

---

## Task 3: Hero — direct-to-checkout buy form

**Goal:** Add the buy form so clicking the CTA POSTs to `/cart/add` and redirects to `/checkout`, bypassing the cart page.

**Files:**
- Modify: `sections/volta-hero-v1.liquid` (add product setting, buy form markup)
- Modify: `assets/volta-hero-v1.css` (CTA button styles)

**Owner action prerequisite:** Create the "Golden Kick" product in Shopify admin (Products → Add product). Single variant, price 30 €, inventory ≥ 1, status "Active". Without this, Step 6 (purchase test) cannot pass — but Steps 1-5 (code) can land first.

- [ ] **Step 1:** In `sections/volta-hero-v1.liquid`, add the product reference at the top of the section, right after the opening `<section>` tag's data computation. Place this BEFORE the `<div class="v-hero-v1__overlay">`:

```liquid
{%- assign hero_product = section.settings.hero_product -%}
{%- assign variant = hero_product.first_available_variant -%}
```

- [ ] **Step 2:** In the same file, inside `<div class="v-hero-v1__overlay">`, replace the existing `<p class="v-hero-v1__format">` block with this version that includes price + the buy form:

```liquid
<p class="v-hero-v1__format">
  {{ 'sections.volta_hero_v1.format' | t }}
  {%- if variant -%} · <strong>{{ variant.price | money }}</strong>{%- endif -%}
</p>

{%- if variant and variant.available -%}
  <form action="{{ routes.cart_add_url }}" method="post" class="v-hero-v1__buy-form">
    <input type="hidden" name="id" value="{{ variant.id }}">
    <input type="hidden" name="quantity" value="1">
    <input type="hidden" name="return_to" value="/checkout">
    <button type="submit" class="v-hero-v1__cta">
      {%- if section.settings.cta_label != blank -%}
        {{ section.settings.cta_label }}
      {%- else -%}
        {{ 'sections.volta_hero_v1.cta_default' | t }}
      {%- endif -%}
      — {{ variant.price | money }} →
    </button>
  </form>
{%- else -%}
  <button type="button" class="v-hero-v1__cta v-hero-v1__cta--disabled" disabled>
    {{ 'sections.volta_hero_v1.cta_unavailable' | t }}
  </button>
{%- endif -%}
```

- [ ] **Step 3:** In the schema settings array, add a new "Produit" header and the product setting + cta_label setting. Insert after the existing "Texte" block:

```json
{ "type": "header", "content": "Produit" },
{
  "type": "product",
  "id": "hero_product",
  "label": "Produit principal",
  "info": "Sélectionner Golden Kick"
},
{
  "type": "text",
  "id": "cta_label",
  "label": "Label du bouton",
  "default": "Acheter"
},
```

(Comma at end matters — make sure the previous setting line also ends with `,`.)

- [ ] **Step 4:** Append CTA styles to `assets/volta-hero-v1.css`:

```css
.v-hero-v1__buy-form {
  margin-top: 24px;
}

.v-hero-v1__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--volta-yellow, #FDE047);
  color: var(--volta-ink, #0E0E10);
  font-family: var(--font-body, system-ui);
  font-size: clamp(13px, 1.2vw, 16px);
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 16px 32px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.2s var(--ease-out-expo, ease-out),
              box-shadow 0.2s var(--ease-out-expo, ease-out);
}

.v-hero-v1__cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
}

.v-hero-v1__cta:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 4px;
}

.v-hero-v1__cta--disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

@media (prefers-reduced-motion: reduce) {
  .v-hero-v1__cta { transition: none; }
  .v-hero-v1__cta:hover { transform: none; }
}
```

- [ ] **Step 5:** Run `shopify theme check`. Expected: zero errors.

- [ ] **Step 6:** **Purchase test** (requires owner action prerequisite — Golden Kick product exists in admin). In the Theme Editor, set the section's "Produit principal" to Golden Kick. Reload the preview. Click the "ACHETER" button. Expected:
  - Browser POSTs to `/cart/add`
  - Shopify redirects to `/checkout`
  - The Shopify Checkout page shows "Golden Kick × 1, 30 €"

If the product isn't created yet, you'll see a placeholder "Bientôt de retour" disabled button — that's the unavailable branch and confirms the conditional works. Test the buy flow once the product is live.

- [ ] **Step 7:** Test the JS-disabled path. In Chrome DevTools → Settings → Disable JavaScript → reload preview → click ACHETER. Expected: identical behavior (form is HTML-only, no JS dependency).

- [ ] **Step 8:** Commit:

```bash
git add sections/volta-hero-v1.liquid assets/volta-hero-v1.css
git commit -m "feat(hero-v1): add direct-to-checkout buy form"
```

---

## Task 4: Hero — floating logo + cart icon

**Goal:** Add the Volta logo top-left (clickable, links to `/`) and a cart icon top-right with item count badge (links to `/cart`).

**Files:**
- Modify: `sections/volta-hero-v1.liquid` (add markup before `.v-hero-v1__overlay`)
- Modify: `assets/volta-hero-v1.css` (logo + cart styles)

- [ ] **Step 1:** In `sections/volta-hero-v1.liquid`, INSIDE `<section class="v-hero-v1">` and BEFORE `<div class="v-hero-v1__overlay">`, add:

```liquid
<a href="{{ routes.root_url }}" class="v-hero-v1__logo" aria-label="{{ shop.name }} — accueil">
  <img src="{{ 'volta-logo-v1.png' | asset_url }}"
       alt="{{ shop.name }}"
       width="120" height="40"
       loading="eager">
</a>

<a href="{{ routes.cart_url }}"
   class="v-hero-v1__cart{% if cart.item_count == 0 %} v-hero-v1__cart--empty{% endif %}"
   aria-label="{{ 'general.cart.view' | t: count: cart.item_count }}">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
       width="22" height="22" aria-hidden="true">
    <path d="M6 7h12l-1.5 11h-9z"/>
    <path d="M9 7V5a3 3 0 0 1 6 0v2"/>
  </svg>
  {%- if cart.item_count > 0 -%}
    <span class="v-hero-v1__cart-count">{{ cart.item_count }}</span>
  {%- endif -%}
</a>
```

- [ ] **Step 2:** Append to `assets/volta-hero-v1.css`:

```css
.v-hero-v1__logo {
  position: absolute;
  top: clamp(16px, 2vw, 32px);
  left: clamp(16px, 2vw, 32px);
  z-index: 10;
  display: block;
}

.v-hero-v1__logo img {
  width: clamp(80px, 8vw, 120px);
  height: auto;
  display: block;
}

.v-hero-v1__logo:focus-visible {
  outline: 2px solid var(--volta-yellow, #FDE047);
  outline-offset: 4px;
  border-radius: 4px;
}

.v-hero-v1__cart {
  position: absolute;
  top: clamp(16px, 2vw, 32px);
  right: clamp(16px, 2vw, 32px);
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  text-decoration: none;
  transition: background 0.2s var(--ease-out-expo, ease-out);
}

.v-hero-v1__cart:hover {
  background: rgba(255, 255, 255, 0.32);
}

.v-hero-v1__cart:focus-visible {
  outline: 2px solid var(--volta-yellow, #FDE047);
  outline-offset: 4px;
}

.v-hero-v1__cart-count {
  font-family: var(--font-body, system-ui);
  font-size: 11px;
  font-weight: 800;
  background: var(--volta-yellow, #FDE047);
  color: var(--volta-ink, #0E0E10);
  padding: 2px 7px;
  border-radius: 999px;
  min-width: 18px;
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .v-hero-v1__cart { transition: none; }
}
```

- [ ] **Step 3:** Run `shopify theme check`. Expected: zero errors.

- [ ] **Step 4:** Reload the dev preview. Verify:
  - Logo appears top-left, links to `/` (click and check URL)
  - Cart icon appears top-right with no badge (cart is empty)
  - After clicking ACHETER from a previous task and going through checkout (if you have a test cart) the badge appears with the count
  - Tab through the page — focus rings appear on logo and cart icon (yellow outline)

- [ ] **Step 5:** Commit:

```bash
git add sections/volta-hero-v1.liquid assets/volta-hero-v1.css
git commit -m "feat(hero-v1): add floating logo and cart icon"
```

---

## Task 5: Hero — photo packshot overlay layer

**Goal:** Add the bottle photo on the right side of the hero, responsive with srcset, with explicit dimensions to prevent CLS.

**Files:**
- Modify: `sections/volta-hero-v1.liquid` (markup + schema)
- Modify: `assets/volta-hero-v1.css` (photo positioning)

- [ ] **Step 1:** In `sections/volta-hero-v1.liquid`, INSIDE `<section class="v-hero-v1">`, BETWEEN the cart icon block and `<div class="v-hero-v1__overlay">`, add:

```liquid
{%- if section.settings.hero_photo != blank -%}
  <img class="v-hero-v1__photo"
       src="{{ section.settings.hero_photo | image_url: width: 1200 }}"
       srcset="{{ section.settings.hero_photo | image_url: width: 600 }} 600w,
               {{ section.settings.hero_photo | image_url: width: 1200 }} 1200w,
               {{ section.settings.hero_photo | image_url: width: 2000 }} 2000w"
       sizes="(min-width: 768px) 50vw, 100vw"
       width="1200" height="1500"
       loading="eager"
       fetchpriority="high"
       alt="{{ section.settings.hero_photo.alt | default: hero_product.title | default: 'Bouteille Golden Kick' }}">
{%- endif -%}
```

- [ ] **Step 2:** Add a new schema settings group "Médias" with the photo picker. Insert in the schema settings array after the "Produit" group:

```json
{ "type": "header", "content": "Médias" },
{
  "type": "image_picker",
  "id": "hero_photo",
  "label": "Photo packshot bouteille",
  "info": "Recommandé : 1200×1500px ou plus, fond neutre"
},
```

- [ ] **Step 3:** Append photo positioning to `assets/volta-hero-v1.css`:

```css
.v-hero-v1__photo {
  position: absolute;
  right: clamp(16px, 5vw, 64px);
  top: 50%;
  transform: translateY(-50%);
  width: auto;
  height: auto;
  max-width: clamp(180px, 35vw, 480px);
  max-height: 75vh;
  object-fit: contain;
  z-index: 2;
  filter: drop-shadow(0 30px 50px rgba(0, 0, 0, 0.3));
}

@media (max-width: 768px) {
  .v-hero-v1__photo {
    right: 50%;
    transform: translate(50%, 0);
    top: clamp(80px, 12vh, 140px);
    max-width: clamp(140px, 50vw, 240px);
    max-height: 40vh;
  }
}
```

- [ ] **Step 4:** Run `shopify theme check`. Expected: zero errors.

- [ ] **Step 5:** Visual test with a placeholder. In Theme Editor, upload any vertical image as "Photo packshot bouteille" (use a Golden Kick mockup or any tall image for now). Reload preview. Verify:
  - Image appears on the right ~50% of the screen height
  - Image scales responsively when you resize the window
  - No layout shift on load (the explicit `width`/`height` reserves space)
  - Mobile view (DevTools mobile preview): image moves to top-center

- [ ] **Step 6:** Commit:

```bash
git add sections/volta-hero-v1.liquid assets/volta-hero-v1.css
git commit -m "feat(hero-v1): add photo packshot overlay with responsive srcset"
```

---

## Task 6: Hero — video background + poster + reduced-motion + designMode pause

**Goal:** Add the video background layer with all required attributes (autoplay, muted, loop, playsinline), poster image fallback, reduced-motion CSS, and a 5-line script that pauses the video in Theme Editor design mode (per CLAUDE.md gotcha).

**Files:**
- Modify: `sections/volta-hero-v1.liquid`
- Modify: `assets/volta-hero-v1.css`

- [ ] **Step 1:** In `sections/volta-hero-v1.liquid`, INSIDE `<section class="v-hero-v1">`, AT THE VERY TOP (before logo/cart/photo/overlay), add:

```liquid
{%- if section.settings.hero_video != blank -%}
  <video class="v-hero-v1__video"
         autoplay muted loop playsinline
         preload="metadata"
         aria-hidden="true"
         {%- if section.settings.hero_poster != blank -%}
           poster="{{ section.settings.hero_poster | image_url: width: 1920 }}"
         {%- endif -%}>
    {%- for source in section.settings.hero_video.sources -%}
      <source src="{{ source.url }}" type="{{ source.mime_type }}">
    {%- endfor -%}
  </video>
{%- elsif section.settings.hero_poster != blank -%}
  <img class="v-hero-v1__poster"
       src="{{ section.settings.hero_poster | image_url: width: 1920 }}"
       alt=""
       width="1920" height="1080"
       loading="eager"
       fetchpriority="high"
       aria-hidden="true">
{%- endif -%}
```

- [ ] **Step 2:** In the schema settings, INSIDE the "Médias" header block (after `hero_photo`), add the video and poster pickers BEFORE `hero_photo`:

```json
{
  "type": "video",
  "id": "hero_video",
  "label": "Vidéo de fond"
},
{
  "type": "image_picker",
  "id": "hero_poster",
  "label": "Image poster",
  "info": "Affichée pendant le chargement et en fallback mobile / reduced-motion"
},
```

(Place them so the schema "Médias" group reads: header → hero_video → hero_poster → hero_photo.)

- [ ] **Step 3:** Append to `assets/volta-hero-v1.css`:

```css
.v-hero-v1__video,
.v-hero-v1__poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

@media (prefers-reduced-motion: reduce) {
  .v-hero-v1__video {
    display: none;
  }
}
```

- [ ] **Step 4:** Add the design-mode pause script. At the BOTTOM of `sections/volta-hero-v1.liquid`, BEFORE `{% schema %}`, add:

```liquid
{%- if section.settings.hero_video != blank -%}
  <script>
    if (window.Shopify && window.Shopify.designMode) {
      var v = document.querySelector('.v-hero-v1__video');
      if (v) v.pause();
    }
  </script>
{%- endif -%}
```

- [ ] **Step 5:** Run `shopify theme check`. Expected: zero errors.

- [ ] **Step 6:** Visual test. In Theme Editor:
  - Upload any short MP4 as "Vidéo de fond" (or skip — verify the elsif branch shows the poster)
  - Upload an image as "Image poster"
  - Reload preview. Verify:
    - Video autoplays muted, loops
    - Poster shows briefly while video loads
    - In DevTools, set `prefers-reduced-motion: reduce` (Rendering tab → Emulate CSS media features) → reload → video is hidden, poster shown statically
    - In Theme Editor design mode, video should be paused (script kicks in)

- [ ] **Step 7:** Test mobile real-device behavior (or use Safari iOS Simulator if no real iPhone available). Verify autoplay works (the `playsinline` + `muted` combo is critical for iOS).

- [ ] **Step 8:** Commit:

```bash
git add sections/volta-hero-v1.liquid assets/volta-hero-v1.css
git commit -m "feat(hero-v1): add video background with poster and reduced-motion fallback"
```

---

## Task 7: Hero — gradient fallback + dark scrim for text contrast

**Goal:** Ensure the hero looks intentional even with no media uploaded (use the brand gradient), and add a dark scrim over the bottom-left zone so text passes WCAG AA contrast against any video frame.

**Files:**
- Modify: `assets/volta-hero-v1.css`
- Modify: `sections/volta-hero-v1.liquid` (add `--no-media` modifier class conditionally)

- [ ] **Step 1:** In `sections/volta-hero-v1.liquid`, modify the opening `<section>` tag to conditionally add a `--no-media` class:

```liquid
<section class="v-hero-v1
                {%- if section.settings.hero_video == blank and section.settings.hero_poster == blank %} v-hero-v1--no-media{% endif -%}"
         aria-labelledby="hero-v1-heading-{{ section.id }}">
```

- [ ] **Step 2:** In `assets/volta-hero-v1.css`, the existing `.v-hero-v1` rule already has `background: linear-gradient(...)` — leave it as-is, it's the no-media fallback.

Append the scrim using a `::before` pseudo-element on `.v-hero-v1`. Add at the top of the file, right after the `.v-hero-v1` rule:

```css
/* Dark scrim over bottom-left for text contrast on bright video frames */
.v-hero-v1::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.55) 0%,
    rgba(0, 0, 0, 0.35) 30%,
    transparent 60%
  );
  z-index: 1;
  pointer-events: none;
}

/* When no media is uploaded, gradient is already vivid — soften the scrim */
.v-hero-v1--no-media::before {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.25) 0%,
    transparent 50%
  );
}
```

- [ ] **Step 3:** Run `shopify theme check`. Expected: zero errors.

- [ ] **Step 4:** Visual test:
  - With NO video and NO poster uploaded: verify gradient `#7b3dd4 → #fbee49` shows, text is readable, scrim is subtle
  - With a bright video uploaded: verify the bottom-left text remains legible (the scrim darkens that zone)
  - Use Lighthouse or axe to check color contrast on the text — should pass WCAG AA (4.5:1 minimum for body text)

- [ ] **Step 5:** Commit:

```bash
git add sections/volta-hero-v1.liquid assets/volta-hero-v1.css
git commit -m "feat(hero-v1): add gradient fallback and contrast scrim"
```

---

## Task 8: Footer — legal links + copyright

**Goal:** Build the single-line footer with 4 legal page links + contact email + copyright. Owner-facing setting for contact email.

**Files:**
- Modify: `sections/volta-footer-legal.liquid` (replace skeleton with full markup)

- [ ] **Step 1:** Replace the contents of `sections/volta-footer-legal.liquid` (between the `{% comment %}` block and `{% schema %}`) with:

```liquid
<footer class="v-footer-legal" role="contentinfo">
  <div class="v-footer-legal__inner">
    <ul class="v-footer-legal__links" role="list">
      <li><a href="/pages/mentions-legales">{{ 'sections.volta_footer_legal.mentions' | t }}</a></li>
      <li><a href="/pages/cgv">{{ 'sections.volta_footer_legal.cgv' | t }}</a></li>
      <li><a href="/pages/confidentialite">{{ 'sections.volta_footer_legal.confidentialite' | t }}</a></li>
      <li><a href="/pages/livraison-retour">{{ 'sections.volta_footer_legal.livraison' | t }}</a></li>
      {%- assign contact = section.settings.contact_email | default: 'contact@voltadrinks.com' -%}
      <li><a href="mailto:{{ contact }}">{{ contact }}</a></li>
    </ul>
    <p class="v-footer-legal__copyright">© {{ 'now' | date: '%Y' }} {{ shop.name }}</p>
  </div>
</footer>

{% stylesheet %}
.v-footer-legal {
  background: #fff;
  color: var(--volta-ink, #0E0E10);
  padding: clamp(16px, 2vw, 24px) clamp(16px, 4vw, 64px);
  border-top: 1px solid rgba(18, 16, 75, 0.1);
}

.v-footer-legal__inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px 24px;
  font-family: var(--font-body, system-ui);
  font-size: clamp(11px, 1vw, 12px);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.v-footer-legal__links {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(12px, 1.5vw, 24px);
  margin: 0;
  padding: 0;
  list-style: none;
}

.v-footer-legal__links a {
  color: inherit;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.v-footer-legal__links a:hover {
  opacity: 0.6;
}

.v-footer-legal__links a:focus-visible {
  outline: 2px solid var(--volta-yellow, #FDE047);
  outline-offset: 3px;
}

.v-footer-legal__copyright {
  margin: 0;
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 600px) {
  .v-footer-legal__inner {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .v-footer-legal__links a { transition: none; }
}
{% endstylesheet %}
```

- [ ] **Step 2:** Run `shopify theme check`. Expected: zero errors.

- [ ] **Step 3:** Reload preview. Verify:
  - Footer appears beneath the hero
  - Five inline links: Mentions légales · CGV · Confidentialité · Livraison & retour · contact@voltadrinks.com
  - Copyright on the right side: © 2026 Volta Drinks
  - At <600px width: links stack on top, copyright below
  - Tab through — focus rings appear on each link

- [ ] **Step 4:** Click each legal link. They will 404 until the owner creates the corresponding Shopify pages. **Owner action required** (does not block this task):
  - In Shopify admin: Online Store → Pages → Add page
  - Create 4 pages with handles `mentions-legales`, `cgv`, `confidentialite`, `livraison-retour`
  - Content can come from a legal counsel or a French ecommerce template

- [ ] **Step 5:** Click the email link. Expected: email client opens with `contact@voltadrinks.com` as recipient.

- [ ] **Step 6:** Commit:

```bash
git add sections/volta-footer-legal.liquid
git commit -m "feat(footer-legal): add legal links and contact email"
```

---

## Task 9: Validation pass — theme check, Lighthouse, axe-core, manual flow

**Goal:** Run all the ship-blocker validations from the spec section 7. Fix any issues found.

**Files:** None modified unless validation reveals issues.

- [ ] **Step 1:** `shopify theme check` — must be zero errors AND zero warnings on new files (`volta-hero-v1.liquid`, `volta-footer-legal.liquid`, locale additions, index.json):

```bash
shopify theme check
```

If warnings appear on the new files, fix them. Warnings on Dawn's stock files can be ignored.

- [ ] **Step 2:** Lighthouse mobile audit. From a fresh terminal with the dev preview running:

```bash
npx lighthouse http://localhost:9292 --form-factor=mobile --preset=perf --view
```

(Replace port if dev preview uses a different one — check the URL `shopify theme dev` printed.)

Expected:
- Performance ≥ 90
- Accessibility ≥ 95
- CLS < 0.1
- LCP < 2.5 s
- Best Practices ≥ 90

If LCP is too high: verify the poster image has `fetchpriority="high"` and `loading="eager"`. If CLS is too high: verify all `<img>` and `<video>` have explicit `width`/`height`.

- [ ] **Step 3:** axe-core accessibility check:

```bash
npx @axe-core/cli http://localhost:9292
```

Expected: zero violations on the home page.

- [ ] **Step 4:** Manual purchase flow on Chrome desktop:
  - Open the home page
  - Click ACHETER
  - Verify redirect to `/checkout`
  - Verify Shopify Checkout shows "Golden Kick × 1, 30 €"
  - Cancel — don't actually pay (or use Shopify test mode with card `4242 4242 4242 4242`)

- [ ] **Step 5:** Manual purchase flow on iOS Safari (real device):
  - Same flow as Step 4
  - Verify video autoplays muted (no user interaction needed)
  - Verify ACHETER button is at least 44×44 px tappable
  - Verify checkout page is mobile-friendly

- [ ] **Step 6:** Manual purchase flow on Android Chrome (real device):
  - Same as Step 5

- [ ] **Step 7:** Reduced-motion test. macOS: System Preferences → Accessibility → Display → Reduce Motion ON. Reload home. Verify:
  - Video is hidden (poster shown statically)
  - CTA hover doesn't translate (no transform)
  - Page is fully functional

- [ ] **Step 8:** JS-disabled test. Chrome DevTools → Settings (⚙️) → Debugger → Disable JavaScript. Reload home. Verify:
  - ACHETER form still works (POST to /cart/add → /checkout)
  - No errors in console

- [ ] **Step 9:** Theme Editor compatibility test. In admin → Customize:
  - Add a section: verify "Hero V1 — Golden Kick" appears in the picker
  - Remove the hero section: verify page doesn't crash (just shows the footer)
  - Re-add it
  - Edit each setting (title, tagline, description, cta_label, video, poster, photo, product, contact_email) and verify the preview updates without console errors

- [ ] **Step 10:** Commit any fixes from this validation pass:

```bash
git add <files-touched>
git commit -m "fix(v1): address validation findings (lighthouse / axe / manual)"
```

If no fixes needed:

```bash
git commit --allow-empty -m "chore: V1 hero validation pass — all gates green"
```

---

## Out of scope for this plan

These are NOT covered by this plan and will be separate work:

- Creating the 4 Shopify CMS pages (`/pages/mentions-legales`, etc.) — owner action in admin
- Writing the actual legal content (mentions, CGV, etc.) — owner or legal counsel
- Creating the Golden Kick product in Shopify admin — owner action
- Configuring VAT rates and shipping zones — owner with accountant
- Cookie banner activation — owner in Shopify admin → Settings → Customer Privacy
- Analytics integration (Klaviyo, Meta Pixel, GTM) — V1.5
- Real video and photo files — owner provides, uploads via Theme Editor
- Full EN translations — V1.5
- Pushing the theme to production via `shopify theme push --unpublished` and publishing — final step after this plan completes

## Self-review

Spec coverage: each spec section maps to tasks above:
- Spec §3 (architecture) → Task 1
- Spec §4 (components & content) → Tasks 2, 3, 4, 5, 6, 7, 8
- Spec §5 (data flow) → Task 3 (buy form), Task 6 (video), Task 5 (photo srcset)
- Spec §6 (fallbacks & a11y) → Tasks 6 (reduced-motion, designMode), 7 (gradient + scrim), 9 (axe-core)
- Spec §7 (tests & validation) → Task 9
- Spec §8 (out of scope) → "Out of scope" section above
- Spec §9 (open dependencies) → noted as owner actions in relevant tasks

No placeholders ("TBD", "TODO", "implement later") in any task — every step has either a code block or a precise command with expected output.

Type/name consistency: section type strings match between `templates/index.json` (`volta-hero-v1`, `volta-footer-legal`) and section file names. CSS class names (`.v-hero-v1__*`, `.v-footer-legal__*`) consistent across Liquid markup and CSS files. Locale keys (`sections.volta_hero_v1.*`) match between the locale files and the `t:` references.
