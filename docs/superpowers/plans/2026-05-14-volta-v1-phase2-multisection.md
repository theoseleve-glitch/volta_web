# Volta V1 Multisection Home (Phase 2) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the single-page home from Phase 1's hero-only to a full single-page brand experience: hero → 4-flavor grid → 60 ml band → manifesto → full footer with newsletter. Reuse the dormant Part B sections, refactor where needed to match the confirmed palette + typography from Phase 1.

**Architecture:** Five Shopify sections rendered in order via `templates/index.json`. Each section uses the global tokens + motion stack Phase 1 wired (no per-section script/CDN load). Per-flavor accent colors flow via `--accent` CSS custom properties set in markup. Newsletter form posts to Klaviyo's public-key endpoint with a graceful empty-key placeholder.

**Tech Stack:** Shopify Liquid (Dawn-based), tokens + Typekit + GSAP/Lenis already wired globally from Phase 1, Klaviyo client subscription endpoint (no new SDK), existing `assets/volta-motion.js` `reveal` API for manifesto line stagger.

---

## Spec reference

This plan implements **Phase 2** of `docs/superpowers/specs/2026-05-14-volta-v1-charged-multisection-design.md` — Section 5. Phase 1 (Charged Hero) shipped at commit `69e8458` on `feature/v1-phase1-charged-hero`. Phase 3 (polish) gets its own plan after this one ships.

**Branching decision:** Branch off Phase 1 (NOT main) — call it `feature/v1-phase2-multisection`. Phase 2 builds on Phase 1's foundation (tokens, motion stack, hero section). When merging, either bundle both phases or merge Phase 1 first then Phase 2.

---

## File structure (Phase 2)

| File | Action | Responsibility |
|---|---|---|
| `sections/volta-products.liquid` | Modify (full refactor) | 4-flavor grid: 4 cards (Maxi Focus, Golden Kick, Green Flag, Fire Fighter), Golden Kick buyable, others "Bientôt", per-flavor accent colors |
| `sections/volta-shot-band.liquid` | Modify (refresh) | 60 ml explainer band with locale-driven headline + body, indigo gradient surface |
| `sections/volta-story.liquid` | Modify (refresh) | Manifesto "Pas un soda. Pas un supplément. Un rituel." with scroll-reveal line stagger via `volta-motion.js` |
| `sections/volta-footer.liquid` | Modify (full refactor) | Full footer with Volta Courant corner mark + Klaviyo newsletter form + 5 legal links + copyright |
| `snippets/volta-subscription-toggle.liquid` | Delete | Pre-existing legacy with `{% stylesheet %}` nesting bug; subscriptions stay out of V1 (Seal integration is V2 scope) |
| `sections/volta-footer-legal.liquid` | Delete | Replaced by `volta-footer.liquid` |
| `templates/index.json` | Modify | Expand to 5 sections in order: hero → flavors → shot_band → story → footer |
| `locales/fr.default.json` | Modify | Runtime FR strings for the 4 new sections |
| `locales/en.json` | Modify | EN parity |
| `locales/fr.default.schema.json` | Modify | Schema labels FR |
| `locales/en.schema.json` | Modify | Schema labels EN |

---

## Phase 2 task list

### Task 1: Branch + delete legacy subscription-toggle snippet

**Why first:** Eliminates the `'stylesheet' tag must not be nested inside other tags` error from `snippets/volta-subscription-toggle.liquid:87` that has been polluting every theme push since session start. Also clears Part B's coupling between the footer and the subscription widget so Task 5 can refactor the footer cleanly.

**Files:**
- Delete: `snippets/volta-subscription-toggle.liquid`

- [ ] **Step 1: Create the Phase 2 feature branch**

```bash
git checkout -b feature/v1-phase2-multisection
git status --short
git log --oneline -3
```

Expected: HEAD is `69e8458` (latest Phase 1 commit), branch name shows `feature/v1-phase2-multisection`.

- [ ] **Step 2: Confirm nothing in V1 templates references the snippet**

```bash
grep -rn "volta-subscription-toggle" --include="*.liquid" --include="*.json" . 2>/dev/null | grep -v "^./preview/" | grep -v "^./mockup/" | grep -v "^./docs/"
```

Expected: results may include references from `sections/volta-footer.liquid` (Part B) and possibly `sections/volta-subscription.liquid`. Those references will be REMOVED in Task 5 when the footer is refactored. The snippet itself is safe to delete first.

- [ ] **Step 3: Delete the snippet**

```bash
git rm snippets/volta-subscription-toggle.liquid
```

- [ ] **Step 4: Verify theme check no longer reports the nested-stylesheet error**

```bash
npx shopify theme check 2>&1 | grep "volta-subscription-toggle" || echo "OK — no offenses"
```

Expected: `OK — no offenses`. (Theme check will still flag `volta-footer.liquid` if it `{% render 'volta-subscription-toggle' %}`s — that's a deferred error fixed in Task 5.)

- [ ] **Step 5: Commit**

```bash
git commit -m "chore(snippets): delete legacy volta-subscription-toggle (V2 scope)

The Part B subscription toggle snippet had a {% stylesheet %} nested
inside other tags (line 87) which produced a Liquid syntax error on
every theme push. V1 has no subscription flow — Seal integration is
V2 scope per docs/superpowers/specs/2026-05-14-...-design.md.

Removed reference from footer happens in Task 5 footer refactor."
```

---

### Task 2: Refactor sections/volta-products.liquid for 4-flavor grid

**Files:**
- Modify (full refactor — use Write tool): `sections/volta-products.liquid`
- Read for reference: existing Part B `sections/volta-products.liquid`; `preview/index.html` (flavor grid around lines 60-135); `preview/v1.css` (flavor card styles + per-flavor accents)

- [ ] **Step 1: Read the four inputs**

```bash
cat sections/volta-products.liquid             # Part B (has the broken Liquid)
sed -n '50,150p' preview/index.html            # prototype flavor grid HTML
grep -n "flavor-\|--accent\|--maxi\|--golden\|--green\|--fire" preview/v1.css | head -30
```

Capture:
- Part B's schema (likely has a `collection` picker — we're replacing with explicit flavor cards)
- Prototype's per-flavor accent colors (look for `--accent:` declarations or `[data-flavor]` selectors)
- Prototype's card layout pattern (eyebrow number, name, format line, price, CTA)

If you can't find clear per-flavor accent values in the prototype, use these defaults:
- Maxi Focus → cyan `#5BD0FF`
- Golden Kick → yellow `#FBEE49` (from tokens)
- Green Flag → neon green `#78ff88` (from tokens)
- Fire Fighter → red-orange `#FF6B3D`

- [ ] **Step 2: Full rewrite of `sections/volta-products.liquid`**

Use Write tool. Full content:

```liquid
{%- comment -%}
  volta-products.liquid — 4-flavor grid (V1 Phase 2)
  Spec: docs/superpowers/specs/2026-05-14-volta-v1-charged-multisection-design.md §5.2
  - 4 hardcoded flavor cards (Maxi Focus, Golden Kick, Green Flag, Fire Fighter)
  - Per-flavor accent via inline --accent CSS custom property
  - Golden Kick: direct-to-checkout CTA from section.settings.featured_product
  - Others: "Bientôt" disabled pill, no link
{%- endcomment -%}

{%- liquid
  assign featured = section.settings.featured_product
  assign accent_maxi = section.settings.accent_maxi | default: '#5BD0FF'
  assign accent_golden = section.settings.accent_golden | default: '#FBEE49'
  assign accent_green = section.settings.accent_green | default: '#78ff88'
  assign accent_fire = section.settings.accent_fire | default: '#FF6B3D'
-%}

<section class="v-products" aria-labelledby="v-products-heading-{{ section.id }}">
  <div class="v-products__intro">
    <p class="v-products__eyebrow">{{ 'sections.volta_products.eyebrow' | t }}</p>
    <h2 id="v-products-heading-{{ section.id }}" class="v-products__heading">
      {%- if section.settings.heading != blank -%}{{ section.settings.heading }}{%- else -%}{{ 'sections.volta_products.heading' | t }}{%- endif -%}
    </h2>
  </div>

  <ol class="v-products__grid" role="list">
    {%- comment -%} Card 1: Maxi Focus (Bientôt) {%- endcomment -%}
    <li class="v-products__card" style="--accent: {{ accent_maxi }};">
      <p class="v-products__card-eyebrow">01</p>
      <h3 class="v-products__card-name">{{ 'sections.volta_products.maxi_name' | t }}</h3>
      <p class="v-products__card-desc">{{ 'sections.volta_products.maxi_desc' | t }}</p>
      <p class="v-products__card-format">{{ 'sections.volta_products.format' | t }}</p>
      <p class="v-products__card-price">{{ 'sections.volta_products.coming_soon' | t }}</p>
      <button type="button" class="v-products__cta v-products__cta--disabled" aria-disabled="true" disabled>{{ 'sections.volta_products.cta_pending' | t }}</button>
    </li>

    {%- comment -%} Card 2: Golden Kick (buyable) {%- endcomment -%}
    <li class="v-products__card v-products__card--featured" style="--accent: {{ accent_golden }};">
      <p class="v-products__card-eyebrow">02</p>
      <h3 class="v-products__card-name">{{ 'sections.volta_products.golden_name' | t }}</h3>
      <p class="v-products__card-desc">{{ 'sections.volta_products.golden_desc' | t }}</p>
      <p class="v-products__card-format">{{ 'sections.volta_products.format' | t }}</p>
      {%- if featured != blank and featured.available -%}
        <p class="v-products__card-price">{{ featured.price | money }}</p>
        <form action="{{ routes.cart_add_url }}" method="post" class="v-products__form" enctype="multipart/form-data">
          <input type="hidden" name="id" value="{{ featured.variants.first.id }}">
          <input type="hidden" name="quantity" value="1">
          <input type="hidden" name="return_to" value="/checkout">
          <button type="submit" class="v-products__cta" data-v-magnet>{{ 'sections.volta_products.cta_buy' | t }}</button>
        </form>
      {%- else -%}
        <p class="v-products__card-price">{{ 'sections.volta_products.price_placeholder' | t }}</p>
        <button type="button" class="v-products__cta v-products__cta--disabled" aria-disabled="true" disabled>{{ 'sections.volta_products.cta_pending' | t }}</button>
      {%- endif -%}
    </li>

    {%- comment -%} Card 3: Green Flag (Bientôt) {%- endcomment -%}
    <li class="v-products__card" style="--accent: {{ accent_green }};">
      <p class="v-products__card-eyebrow">03</p>
      <h3 class="v-products__card-name">{{ 'sections.volta_products.green_name' | t }}</h3>
      <p class="v-products__card-desc">{{ 'sections.volta_products.green_desc' | t }}</p>
      <p class="v-products__card-format">{{ 'sections.volta_products.format' | t }}</p>
      <p class="v-products__card-price">{{ 'sections.volta_products.coming_soon' | t }}</p>
      <button type="button" class="v-products__cta v-products__cta--disabled" aria-disabled="true" disabled>{{ 'sections.volta_products.cta_pending' | t }}</button>
    </li>

    {%- comment -%} Card 4: Fire Fighter (Bientôt) {%- endcomment -%}
    <li class="v-products__card" style="--accent: {{ accent_fire }};">
      <p class="v-products__card-eyebrow">04</p>
      <h3 class="v-products__card-name">{{ 'sections.volta_products.fire_name' | t }}</h3>
      <p class="v-products__card-desc">{{ 'sections.volta_products.fire_desc' | t }}</p>
      <p class="v-products__card-format">{{ 'sections.volta_products.format' | t }}</p>
      <p class="v-products__card-price">{{ 'sections.volta_products.coming_soon' | t }}</p>
      <button type="button" class="v-products__cta v-products__cta--disabled" aria-disabled="true" disabled>{{ 'sections.volta_products.cta_pending' | t }}</button>
    </li>
  </ol>
</section>

{% stylesheet %}
.v-products {
  background: var(--volta-indigo, #12104b);
  color: #fff;
  padding: clamp(64px, 10vw, 140px) clamp(24px, 5vw, 80px);
  font-family: var(--font-body, system-ui);
}
.v-products__intro {
  max-width: 720px;
  margin: 0 auto clamp(40px, 6vw, 80px);
  text-align: center;
}
.v-products__eyebrow {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.6);
  margin: 0 0 12px;
}
.v-products__heading {
  font-family: var(--font-display, 'dunbar-tall', sans-serif);
  font-style: italic;
  font-weight: 900;
  font-size: clamp(40px, 6vw, 88px);
  line-height: 0.92;
  letter-spacing: -0.03em;
  margin: 0;
}
.v-products__grid {
  list-style: none;
  margin: 0; padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: clamp(16px, 2vw, 28px);
  max-width: 1280px;
  margin-inline: auto;
}
.v-products__card {
  position: relative;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 18px;
  padding: clamp(24px, 3vw, 36px);
  display: flex; flex-direction: column;
  gap: 10px;
  transition: transform 0.4s var(--ease-out-expo, cubic-bezier(.16,1,.3,1)), border-color 0.4s ease;
  isolation: isolate;
}
.v-products__card::before {
  content: '';
  position: absolute; inset: 0;
  border-radius: inherit;
  background: radial-gradient(60% 80% at 50% 0%, var(--accent, transparent), transparent 70%);
  opacity: 0.08;
  pointer-events: none;
  z-index: -1;
  transition: opacity 0.4s ease;
}
.v-products__card:hover {
  transform: translateY(-4px);
  border-color: var(--accent, rgba(255,255,255,0.2));
}
.v-products__card:hover::before { opacity: 0.18; }
.v-products__card-eyebrow {
  font-family: var(--font-display, 'dunbar-tall', sans-serif);
  font-size: 14px;
  letter-spacing: 0.12em;
  color: var(--accent, #fff);
  margin: 0;
}
.v-products__card-name {
  font-family: var(--font-display, 'dunbar-tall', sans-serif);
  font-style: italic; font-weight: 900;
  font-size: clamp(24px, 2.6vw, 36px);
  line-height: 1;
  letter-spacing: -0.02em;
  margin: 0;
}
.v-products__card-desc {
  font-size: 14px;
  line-height: 1.45;
  color: rgba(255,255,255,0.75);
  margin: 0;
  flex-grow: 1;
}
.v-products__card-format {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  margin: 0;
}
.v-products__card-price {
  font-family: var(--font-display, 'dunbar-tall', sans-serif);
  font-weight: 700;
  font-size: 22px;
  color: #fff;
  margin: 0;
}
.v-products__form { margin: 0; }
.v-products__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  background: var(--accent, var(--volta-yellow, #FBEE49));
  color: var(--volta-indigo, #12104b);
  border: none;
  border-radius: 999px;
  font-family: var(--font-body, system-ui);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s var(--ease-out-expo, cubic-bezier(.16,1,.3,1));
  align-self: flex-start;
  width: 100%;
}
.v-products__cta:hover { transform: translateY(-2px); }
.v-products__cta:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
.v-products__cta--disabled {
  background: rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.5);
  cursor: not-allowed;
}
.v-products__cta--disabled:hover { transform: none; }

@media (prefers-reduced-motion: reduce) {
  .v-products__card,
  .v-products__card::before,
  .v-products__cta { transition: none; }
}
{% endstylesheet %}

{% schema %}
{
  "name": "t:sections.volta_products.name",
  "tag": "section",
  "class": "v-products-wrapper",
  "settings": [
    {
      "type": "header",
      "content": "t:sections.volta_products.content_header"
    },
    {
      "type": "text",
      "id": "heading",
      "label": "t:sections.volta_products.heading_label",
      "info": "t:sections.volta_products.heading_info"
    },
    {
      "type": "product",
      "id": "featured_product",
      "label": "t:sections.volta_products.featured_product_label",
      "info": "t:sections.volta_products.featured_product_info"
    },
    {
      "type": "header",
      "content": "t:sections.volta_products.accents_header"
    },
    {
      "type": "color",
      "id": "accent_maxi",
      "label": "t:sections.volta_products.accent_maxi_label",
      "default": "#5BD0FF"
    },
    {
      "type": "color",
      "id": "accent_golden",
      "label": "t:sections.volta_products.accent_golden_label",
      "default": "#FBEE49"
    },
    {
      "type": "color",
      "id": "accent_green",
      "label": "t:sections.volta_products.accent_green_label",
      "default": "#78ff88"
    },
    {
      "type": "color",
      "id": "accent_fire",
      "label": "t:sections.volta_products.accent_fire_label",
      "default": "#FF6B3D"
    }
  ],
  "presets": [
    { "name": "t:sections.volta_products.name" }
  ]
}
{% endschema %}
```

- [ ] **Step 3: Theme check**

```bash
npx shopify theme check 2>&1 | grep "volta-products" -A 4 | head -30
```

Expected: zero offenses. The `t:sections.volta_products.*` references will be missing keys (Task 6 adds them). If theme check warns about missing locale keys, that's expected and acceptable.

- [ ] **Step 4: Commit**

```bash
git add sections/volta-products.liquid
git commit -m "feat(products): 4-flavor grid with per-card accent colors

Replaces Part B volta-products.liquid (had a broken Liquid expression
on line 8). New structure: 4 hardcoded flavor cards (Maxi Focus /
Golden Kick / Green Flag / Fire Fighter), Golden Kick is the only
buyable SKU via section.settings.featured_product, others show
'Bientôt' disabled pill. Per-flavor accent color flows via inline
--accent CSS custom property; merchant can override defaults in the
Theme Editor color pickers."
```

---

### Task 3: Refactor sections/volta-shot-band.liquid (60 ml band)

**Files:**
- Modify: `sections/volta-shot-band.liquid`
- Read for reference: existing Part B; `preview/index.html` (60ml band — look for "60 ml" string)

- [ ] **Step 1: Read inputs**

```bash
cat sections/volta-shot-band.liquid
grep -n "60 ml\|shot" preview/index.html | head -10
```

- [ ] **Step 2: Replace `sections/volta-shot-band.liquid` content**

Use Write tool:

```liquid
{%- comment -%}
  volta-shot-band.liquid — 60 ml shot explainer band (V1 Phase 2)
  Spec §5.3: brief explainer between the flavor grid and the manifesto.
{%- endcomment -%}

<section class="v-shot-band" aria-labelledby="v-shot-band-heading-{{ section.id }}">
  <div class="v-shot-band__inner">
    <p class="v-shot-band__volume">{{ 'sections.volta_shot_band.volume' | t }}</p>
    <h2 id="v-shot-band-heading-{{ section.id }}" class="v-shot-band__heading">
      {%- if section.settings.heading != blank -%}{{ section.settings.heading }}{%- else -%}{{ 'sections.volta_shot_band.heading' | t }}{%- endif -%}
    </h2>
    <p class="v-shot-band__body">
      {%- if section.settings.body != blank -%}{{ section.settings.body }}{%- else -%}{{ 'sections.volta_shot_band.body' | t }}{%- endif -%}
    </p>
  </div>
</section>

{% stylesheet %}
.v-shot-band {
  background: linear-gradient(180deg, var(--volta-indigo, #12104b) 0%, var(--volta-indigo-deep, #0a0930) 100%);
  color: #fff;
  padding: clamp(80px, 14vw, 180px) clamp(24px, 5vw, 80px);
  font-family: var(--font-body, system-ui);
  text-align: center;
}
.v-shot-band__inner {
  max-width: 720px;
  margin: 0 auto;
  display: flex; flex-direction: column;
  gap: clamp(16px, 2vw, 28px);
}
.v-shot-band__volume {
  font-family: var(--font-display, 'dunbar-tall', sans-serif);
  font-style: italic; font-weight: 900;
  font-size: clamp(80px, 14vw, 200px);
  line-height: 0.86;
  letter-spacing: -0.04em;
  color: var(--volta-yellow, #FBEE49);
  margin: 0;
}
.v-shot-band__heading {
  font-family: var(--font-display, 'dunbar-tall', sans-serif);
  font-style: italic; font-weight: 900;
  font-size: clamp(28px, 4vw, 56px);
  line-height: 1;
  letter-spacing: -0.02em;
  margin: 0;
}
.v-shot-band__body {
  font-size: clamp(15px, 1.4vw, 18px);
  line-height: 1.55;
  color: rgba(255,255,255,0.75);
  margin: 0;
}
{% endstylesheet %}

{% schema %}
{
  "name": "t:sections.volta_shot_band.name",
  "tag": "section",
  "class": "v-shot-band-wrapper",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "t:sections.volta_shot_band.heading_label",
      "info": "t:sections.volta_shot_band.heading_info"
    },
    {
      "type": "textarea",
      "id": "body",
      "label": "t:sections.volta_shot_band.body_label",
      "info": "t:sections.volta_shot_band.body_info"
    }
  ],
  "presets": [
    { "name": "t:sections.volta_shot_band.name" }
  ]
}
{% endschema %}
```

- [ ] **Step 3: Theme check + commit**

```bash
npx shopify theme check 2>&1 | grep "volta-shot-band" || echo "OK"
git add sections/volta-shot-band.liquid
git commit -m "feat(shot-band): refresh 60ml explainer band with token-driven indigo gradient

Replaces Part B section. Locale-driven volume / heading / body, merchant
can override heading + body via Theme Editor."
```

---

### Task 4: Refactor sections/volta-story.liquid (manifesto)

**Files:**
- Modify: `sections/volta-story.liquid`
- Read for reference: existing Part B; `preview/index.html` (manifesto: "Pas un soda. Pas un supplément. Un rituel.")

- [ ] **Step 1: Read inputs**

```bash
cat sections/volta-story.liquid
grep -n "Pas un soda\|rituel\|manifeste" preview/index.html | head -5
```

- [ ] **Step 2: Replace `sections/volta-story.liquid` content**

Use Write tool:

```liquid
{%- comment -%}
  volta-story.liquid — Manifesto (V1 Phase 2)
  Spec §5.4: 3-line manifesto, scroll-revealed via volta-motion.js reveal.
{%- endcomment -%}

<section class="v-story" aria-labelledby="v-story-heading-{{ section.id }}">
  <div class="v-story__inner">
    <p class="v-story__eyebrow">{{ 'sections.volta_story.eyebrow' | t }}</p>
    <h2 id="v-story-heading-{{ section.id }}" class="v-story__lines">
      <span class="v-story__line" data-v-reveal>{{ 'sections.volta_story.line_1' | t }}</span>
      <span class="v-story__line" data-v-reveal>{{ 'sections.volta_story.line_2' | t }}</span>
      <span class="v-story__line v-story__line--accent" data-v-reveal>{{ 'sections.volta_story.line_3' | t }}</span>
    </h2>
    {%- if section.settings.caption != blank -%}
      <p class="v-story__caption">{{ section.settings.caption }}</p>
    {%- endif -%}
  </div>
</section>

{% stylesheet %}
.v-story {
  background: var(--volta-cream, #F7F7F2);
  color: var(--volta-indigo, #12104b);
  padding: clamp(80px, 14vw, 180px) clamp(24px, 5vw, 80px);
  font-family: var(--font-body, system-ui);
}
.v-story__inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex; flex-direction: column;
  gap: clamp(20px, 3vw, 40px);
}
.v-story__eyebrow {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(18,16,75,0.5);
  margin: 0;
}
.v-story__lines {
  font-family: var(--font-display, 'dunbar-tall', sans-serif);
  font-style: italic; font-weight: 900;
  font-size: clamp(40px, 7vw, 112px);
  line-height: 0.92;
  letter-spacing: -0.03em;
  margin: 0;
  display: flex; flex-direction: column;
  gap: 8px;
}
.v-story__line {
  display: block;
  opacity: 1;
}
.v-story__line[data-v-reveal] {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s var(--ease-out-expo, cubic-bezier(.16,1,.3,1)), transform 0.8s var(--ease-out-expo, cubic-bezier(.16,1,.3,1));
}
.v-story__line.is-revealed {
  opacity: 1;
  transform: translateY(0);
}
.v-story__line--accent {
  color: var(--volta-green, #78ff88);
  text-shadow: 0 1px 0 var(--volta-indigo, #12104b);
}
.v-story__caption {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(18,16,75,0.65);
  max-width: 540px;
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  .v-story__line[data-v-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
{% endstylesheet %}

<script>
  (function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.v-story__line[data-v-reveal]').forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    const observe = () => {
      const lines = document.querySelectorAll('.v-story__line[data-v-reveal]');
      if (lines.length === 0) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry, idx) => {
          if (entry.isIntersecting) {
            const target = entry.target;
            const order = [...target.parentElement.children].indexOf(target);
            setTimeout(() => target.classList.add('is-revealed'), order * 150);
            io.unobserve(target);
          }
        });
      }, { threshold: 0.2 });
      lines.forEach((el) => io.observe(el));
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', observe, { once: true });
    } else {
      observe();
    }
  })();
</script>

{% schema %}
{
  "name": "t:sections.volta_story.name",
  "tag": "section",
  "class": "v-story-wrapper",
  "settings": [
    {
      "type": "textarea",
      "id": "caption",
      "label": "t:sections.volta_story.caption_label",
      "info": "t:sections.volta_story.caption_info"
    }
  ],
  "presets": [
    { "name": "t:sections.volta_story.name" }
  ]
}
{% endschema %}
```

- [ ] **Step 3: Theme check + commit**

```bash
npx shopify theme check 2>&1 | grep "volta-story" || echo "OK"
git add sections/volta-story.liquid
git commit -m "feat(story): manifesto with 3-line scroll-revealed type stagger

Replaces Part B section. Cream surface for contrast against indigo
neighbors. Three locale-driven lines staggered by IntersectionObserver
with reduced-motion bypass. Third line accents in --volta-green."
```

---

### Task 5: Refactor sections/volta-footer.liquid (full footer with newsletter)

**Files:**
- Modify (full refactor): `sections/volta-footer.liquid`
- Read for reference: existing Part B `sections/volta-footer.liquid`; `preview/index.html` (footer + newsletter); `sections/volta-footer-legal.liquid` (Phase 1 footer, for the 5 legal links pattern)

- [ ] **Step 1: Read inputs**

```bash
cat sections/volta-footer.liquid
cat sections/volta-footer-legal.liquid
grep -n "newsletter\|Klaviyo\|Rejoins" preview/index.html | head -10
```

- [ ] **Step 2: Replace `sections/volta-footer.liquid` content**

Use Write tool:

```liquid
{%- comment -%}
  volta-footer.liquid — Full footer with newsletter (V1 Phase 2)
  Spec §5.5. Replaces sections/volta-footer-legal.liquid.

  Newsletter posts to Klaviyo's public-key endpoint if settings.volta_klaviyo_public_key
  is set; otherwise shows a "Newsletter bientôt disponible" placeholder.
{%- endcomment -%}

{%- liquid
  assign klaviyo_key = settings.volta_klaviyo_public_key
  assign contact = section.settings.contact_email | default: 'contact@voltadrinks.com'
-%}

<footer class="v-footer" role="contentinfo">
  <div class="v-footer__top">
    <div class="v-footer__brand">
      <img
        class="v-footer__courant"
        src="{{ 'volta-courant.svg' | asset_url }}"
        alt=""
        width="180"
        height="40"
        loading="lazy"
        decoding="async"
      >
    </div>

    <div class="v-footer__newsletter">
      <p class="v-footer__newsletter-eyebrow">{{ 'sections.volta_footer.newsletter_eyebrow' | t }}</p>
      <h2 class="v-footer__newsletter-heading">
        {%- if section.settings.newsletter_heading != blank -%}{{ section.settings.newsletter_heading }}{%- else -%}{{ 'sections.volta_footer.newsletter_heading' | t }}{%- endif -%}
      </h2>
      {%- if klaviyo_key != blank -%}
        <form class="v-footer__newsletter-form" data-v-klaviyo-form action="https://manage.kmail-lists.com/subscriptions/subscribe" method="POST" target="_blank">
          <input type="hidden" name="g" value="">
          <input type="hidden" name="$fields" value="email">
          <input type="hidden" name="email_source" value="volta_footer">
          <label class="v-footer__newsletter-label" for="v-footer-email-{{ section.id }}">{{ 'sections.volta_footer.newsletter_email_label' | t }}</label>
          <div class="v-footer__newsletter-row">
            <input
              id="v-footer-email-{{ section.id }}"
              class="v-footer__newsletter-input"
              type="email"
              name="email"
              required
              autocomplete="email"
              placeholder="{{ 'sections.volta_footer.newsletter_email_placeholder' | t }}"
            >
            <button type="submit" class="v-footer__newsletter-submit" data-v-magnet>{{ 'sections.volta_footer.newsletter_submit' | t }}</button>
          </div>
          <p class="v-footer__newsletter-note">{{ 'sections.volta_footer.newsletter_note' | t }}</p>
        </form>
      {%- else -%}
        <p class="v-footer__newsletter-placeholder">{{ 'sections.volta_footer.newsletter_placeholder' | t }}</p>
      {%- endif -%}
    </div>
  </div>

  <div class="v-footer__bottom">
    <ul class="v-footer__links" role="list">
      <li><a href="/pages/mentions-legales">{{ 'sections.volta_footer.mentions' | t }}</a></li>
      <li><a href="/pages/cgv">{{ 'sections.volta_footer.cgv' | t }}</a></li>
      <li><a href="/pages/confidentialite">{{ 'sections.volta_footer.confidentialite' | t }}</a></li>
      <li><a href="/pages/livraison-retour">{{ 'sections.volta_footer.livraison' | t }}</a></li>
      <li><a href="mailto:{{ contact }}">{{ contact }}</a></li>
    </ul>
    <p class="v-footer__copyright">© {{ 'now' | date: '%Y' }} {{ shop.name }}</p>
  </div>
</footer>

{% stylesheet %}
.v-footer {
  background: var(--volta-indigo-deep, #0a0930);
  color: #fff;
  font-family: var(--font-body, system-ui);
}
.v-footer__top {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: clamp(40px, 6vw, 96px);
  padding: clamp(64px, 10vw, 120px) clamp(24px, 5vw, 80px) clamp(48px, 6vw, 80px);
  max-width: 1280px;
  margin-inline: auto;
  align-items: center;
}
.v-footer__courant {
  width: clamp(140px, 18vw, 220px);
  height: auto;
  filter: invert(1);
  opacity: 0.9;
}
.v-footer__newsletter-eyebrow {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.6);
  margin: 0 0 10px;
}
.v-footer__newsletter-heading {
  font-family: var(--font-display, 'dunbar-tall', sans-serif);
  font-style: italic; font-weight: 900;
  font-size: clamp(32px, 4vw, 56px);
  line-height: 0.96;
  letter-spacing: -0.02em;
  margin: 0 0 clamp(16px, 2vw, 24px);
}
.v-footer__newsletter-label {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
.v-footer__newsletter-row {
  display: flex;
  gap: 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 999px;
  padding: 4px;
  max-width: 520px;
  transition: border-color 0.2s ease;
}
.v-footer__newsletter-row:focus-within {
  border-color: var(--volta-yellow, #FBEE49);
}
.v-footer__newsletter-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 12px 18px;
  color: #fff;
  font: inherit;
  outline: none;
}
.v-footer__newsletter-input::placeholder { color: rgba(255,255,255,0.4); }
.v-footer__newsletter-submit {
  background: var(--volta-yellow, #FBEE49);
  color: var(--volta-indigo, #12104b);
  border: none;
  border-radius: 999px;
  padding: 12px 22px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s var(--ease-out-expo, cubic-bezier(.16,1,.3,1));
}
.v-footer__newsletter-submit:hover { transform: translateY(-1px); }
.v-footer__newsletter-submit:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
.v-footer__newsletter-note {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin: 12px 0 0;
  max-width: 520px;
  line-height: 1.5;
}
.v-footer__newsletter-placeholder {
  font-size: 14px;
  color: rgba(255,255,255,0.6);
  margin: 0;
  font-style: italic;
}
.v-footer__bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px 24px;
  padding: clamp(24px, 3vw, 36px) clamp(24px, 5vw, 80px);
  border-top: 1px solid rgba(255,255,255,0.10);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.v-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(12px, 1.5vw, 24px);
  margin: 0; padding: 0;
  list-style: none;
}
.v-footer__links a {
  color: inherit;
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}
.v-footer__links a:hover { opacity: 1; }
.v-footer__links a:focus-visible {
  outline: 2px solid var(--volta-yellow, #FBEE49);
  outline-offset: 3px;
}
.v-footer__copyright {
  margin: 0;
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 720px) {
  .v-footer__top { grid-template-columns: 1fr; text-align: left; }
}

@media (prefers-reduced-motion: reduce) {
  .v-footer__newsletter-row,
  .v-footer__newsletter-submit,
  .v-footer__links a { transition: none; }
}
{% endstylesheet %}

{% schema %}
{
  "name": "t:sections.volta_footer.name",
  "tag": "footer",
  "class": "v-footer-wrapper",
  "settings": [
    {
      "type": "header",
      "content": "t:sections.volta_footer.newsletter_header"
    },
    {
      "type": "text",
      "id": "newsletter_heading",
      "label": "t:sections.volta_footer.newsletter_heading_label",
      "info": "t:sections.volta_footer.newsletter_heading_info"
    },
    {
      "type": "header",
      "content": "t:sections.volta_footer.contact_header"
    },
    {
      "type": "text",
      "id": "contact_email",
      "label": "t:sections.volta_footer.contact_email_label",
      "info": "t:sections.volta_footer.contact_email_info",
      "default": "contact@voltadrinks.com"
    }
  ],
  "presets": [
    { "name": "t:sections.volta_footer.name" }
  ]
}
{% endschema %}
```

**Klaviyo integration note:** The form action `https://manage.kmail-lists.com/subscriptions/subscribe` is Klaviyo's public list-subscribe endpoint. The hidden `g` input must be set to the merchant's Klaviyo LIST ID (not their public API key — those are different). Phase 2 ships with `g=""` (empty); proper list-ID configuration is V1.5 polish via a new settings schema field. For now, when the merchant DOES set `volta_klaviyo_public_key`, the form RENDERS but won't actually subscribe anyone until `g` (list ID) is also set. Note in owner punch list.

- [ ] **Step 3: Theme check + commit**

```bash
npx shopify theme check 2>&1 | grep "volta-footer\.liquid" -A 2 | head -20
git add sections/volta-footer.liquid
git commit -m "feat(footer): full footer with Klaviyo newsletter + Volta Courant + 5 legal links

Replaces sections/volta-footer-legal.liquid (which Task 8 will delete).
- Volta Courant SVG corner mark (lazy-loaded, inverted for indigo bg)
- Newsletter form posts to Klaviyo's public subscribe endpoint when
  settings.volta_klaviyo_public_key is set; placeholder text otherwise
- 5 legal links (mentions, cgv, confidentialité, livraison-retour,
  mailto contact_email) + copyright
- Responsive: stacks on narrow viewports
- Reduced-motion + focus-visible accessible"
```

---

### Task 6: Add Phase 2 locale keys (FR + EN + schema)

**Files:**
- Modify: `locales/fr.default.json`, `locales/en.json`, `locales/fr.default.schema.json`, `locales/en.schema.json`

- [ ] **Step 1: Confirm insertion points in each file**

```bash
grep -n "sections.volta_hero\|sections.volta_footer_legal" locales/fr.default.json | head -5
grep -n "\"sections\":" locales/fr.default.schema.json | head -3
```

- [ ] **Step 2: Add runtime keys to `locales/fr.default.json`**

Inside the `"sections"` block, add as siblings (preserve trailing commas as appropriate):

```json
    "volta_products": {
      "name": "Saveurs — Grille",
      "eyebrow": "Quatre rituels",
      "heading": "Chaque saveur, un courant",
      "format": "60 ml · pack de 12",
      "coming_soon": "Bientôt",
      "price_placeholder": "30 €",
      "cta_buy": "Acheter",
      "cta_pending": "Bientôt disponible",
      "maxi_name": "Maxi Focus",
      "maxi_desc": "Le coup de jus pour la concentration prolongée.",
      "golden_name": "Golden Kick",
      "golden_desc": "Le shot signature : gingembre, curcuma, citron.",
      "green_name": "Green Flag",
      "green_desc": "Vert intense, vitalité claire.",
      "fire_name": "Fire Fighter",
      "fire_desc": "Piquant, défensif, immunité renforcée."
    },
    "volta_shot_band": {
      "name": "Shot Band — 60 ml",
      "volume": "60 ml",
      "heading": "Un shot, un rituel",
      "body": "Pressé à froid, dosé pour un effet immédiat. Une bouchée, dix secondes, la journée change."
    },
    "volta_story": {
      "name": "Story — Manifeste",
      "eyebrow": "Manifeste",
      "line_1": "Pas un soda.",
      "line_2": "Pas un supplément.",
      "line_3": "Un rituel."
    },
    "volta_footer": {
      "name": "Footer — Complet",
      "newsletter_eyebrow": "Volta List",
      "newsletter_heading": "Rejoins le courant",
      "newsletter_email_label": "Adresse email",
      "newsletter_email_placeholder": "ton@email.com",
      "newsletter_submit": "Je charge",
      "newsletter_note": "Pas de spam. Des nouvelles fraîches une fois par mois.",
      "newsletter_placeholder": "Newsletter bientôt disponible.",
      "mentions": "Mentions légales",
      "cgv": "CGV",
      "confidentialite": "Confidentialité",
      "livraison": "Livraison & retours"
    },
```

- [ ] **Step 3: Add EN parity to `locales/en.json`**

Same structure, EN strings (use these EN values; tag any visible French text with `[EN: TODO]` only if no equivalent — none expected for this set):

```json
    "volta_products": {
      "name": "Flavors — Grid",
      "eyebrow": "Four rituals",
      "heading": "Each flavor, a current",
      "format": "60 ml · 12-pack",
      "coming_soon": "Soon",
      "price_placeholder": "€30",
      "cta_buy": "Buy",
      "cta_pending": "Coming soon",
      "maxi_name": "Maxi Focus",
      "maxi_desc": "Sustained concentration in a shot.",
      "golden_name": "Golden Kick",
      "golden_desc": "Our signature: ginger, turmeric, lemon.",
      "green_name": "Green Flag",
      "green_desc": "Bright green, clear vitality.",
      "fire_name": "Fire Fighter",
      "fire_desc": "Sharp, defensive, immune-supporting."
    },
    "volta_shot_band": {
      "name": "Shot Band — 60 ml",
      "volume": "60 ml",
      "heading": "One shot, one ritual",
      "body": "Cold-pressed, dosed for instant effect. One bite, ten seconds, the day shifts."
    },
    "volta_story": {
      "name": "Story — Manifesto",
      "eyebrow": "Manifesto",
      "line_1": "Not a soda.",
      "line_2": "Not a supplement.",
      "line_3": "A ritual."
    },
    "volta_footer": {
      "name": "Footer — Full",
      "newsletter_eyebrow": "Volta List",
      "newsletter_heading": "Join the current",
      "newsletter_email_label": "Email address",
      "newsletter_email_placeholder": "you@email.com",
      "newsletter_submit": "Charge me up",
      "newsletter_note": "No spam. Fresh news once a month.",
      "newsletter_placeholder": "Newsletter coming soon.",
      "mentions": "Legal notice",
      "cgv": "Terms of sale",
      "confidentialite": "Privacy",
      "livraison": "Shipping & returns"
    },
```

- [ ] **Step 4: Add schema labels to `locales/fr.default.schema.json`**

Inside the `"sections"` block:

```json
    "volta_products": {
      "name": "Saveurs — Grille",
      "content_header": "Contenu",
      "heading_label": "Titre de la grille",
      "heading_info": "Vide → traduction par défaut",
      "featured_product_label": "Produit Golden Kick",
      "featured_product_info": "Bind au produit Shopify; vide → CTA désactivé 'Bientôt'",
      "accents_header": "Couleurs d'accent (par saveur)",
      "accent_maxi_label": "Maxi Focus",
      "accent_golden_label": "Golden Kick",
      "accent_green_label": "Green Flag",
      "accent_fire_label": "Fire Fighter"
    },
    "volta_shot_band": {
      "name": "Shot Band — 60 ml",
      "heading_label": "Titre",
      "heading_info": "Vide → traduction par défaut",
      "body_label": "Texte d'accompagnement",
      "body_info": "Vide → traduction par défaut"
    },
    "volta_story": {
      "name": "Story — Manifeste",
      "caption_label": "Légende sous le manifeste (optionnelle)",
      "caption_info": "Si renseigné, apparaît en petit sous les 3 lignes du manifeste"
    },
    "volta_footer": {
      "name": "Footer — Complet",
      "newsletter_header": "Newsletter",
      "newsletter_heading_label": "Titre du bloc newsletter",
      "newsletter_heading_info": "Vide → 'Rejoins le courant'",
      "contact_header": "Contact",
      "contact_email_label": "Email de contact",
      "contact_email_info": "Affiché dans la barre de bas du footer"
    },
```

- [ ] **Step 5: Mirror schema EN labels in `locales/en.schema.json`**

```json
    "volta_products": {
      "name": "Flavors — Grid",
      "content_header": "Content",
      "heading_label": "Grid heading",
      "heading_info": "Empty → default translation",
      "featured_product_label": "Golden Kick product",
      "featured_product_info": "Bind to Shopify product; empty → CTA shows 'Coming soon'",
      "accents_header": "Per-flavor accent colors",
      "accent_maxi_label": "Maxi Focus",
      "accent_golden_label": "Golden Kick",
      "accent_green_label": "Green Flag",
      "accent_fire_label": "Fire Fighter"
    },
    "volta_shot_band": {
      "name": "Shot Band — 60 ml",
      "heading_label": "Heading",
      "heading_info": "Empty → default translation",
      "body_label": "Supporting body",
      "body_info": "Empty → default translation"
    },
    "volta_story": {
      "name": "Story — Manifesto",
      "caption_label": "Caption below the manifesto (optional)",
      "caption_info": "If set, appears in small text below the 3 manifesto lines"
    },
    "volta_footer": {
      "name": "Footer — Full",
      "newsletter_header": "Newsletter",
      "newsletter_heading_label": "Newsletter block heading",
      "newsletter_heading_info": "Empty → 'Join the current'",
      "contact_header": "Contact",
      "contact_email_label": "Contact email",
      "contact_email_info": "Shown in the footer bottom bar"
    },
```

- [ ] **Step 6: Verify JSON validity**

```bash
node -e "JSON.parse(require('fs').readFileSync('locales/fr.default.json'))" && echo "fr OK"
node -e "JSON.parse(require('fs').readFileSync('locales/en.json'))" && echo "en OK"
node -e "JSON.parse(require('fs').readFileSync('locales/fr.default.schema.json'))" && echo "fr.schema OK"
node -e "JSON.parse(require('fs').readFileSync('locales/en.schema.json'))" && echo "en.schema OK"
```

Expected: 4 lines of `... OK`.

- [ ] **Step 7: Theme check**

```bash
npx shopify theme check 2>&1 | grep -E "UnknownTranslationKey|MissingTranslation|ValidSchemaTranslation" | head -10
```

Expected: zero new offenses (any remaining are pre-existing).

- [ ] **Step 8: Commit**

```bash
git add locales/fr.default.json locales/en.json locales/fr.default.schema.json locales/en.schema.json
git commit -m "feat(locales): add Phase 2 strings for products, shot-band, story, footer

Runtime FR/EN:
- sections.volta_products (4 flavor names + descriptions + CTA labels)
- sections.volta_shot_band (60 ml + heading + body)
- sections.volta_story (3-line manifesto + eyebrow)
- sections.volta_footer (newsletter + 5 legal links + placeholder)

Schema FR/EN: all 4 sections' Theme Editor labels.

FR/EN parity verified."
```

---

### Task 7: Update templates/index.json to render 5 sections

**Files:**
- Modify: `templates/index.json`

- [ ] **Step 1: Read current state**

```bash
cat templates/index.json
```

Currently: 2 sections (hero + footer-legal).

- [ ] **Step 2: Replace with 5-section structure**

Use Write tool. Full content:

```json
{
  "sections": {
    "hero": {
      "type": "volta-hero",
      "settings": {}
    },
    "flavors": {
      "type": "volta-products",
      "settings": {}
    },
    "shot_band": {
      "type": "volta-shot-band",
      "settings": {}
    },
    "story": {
      "type": "volta-story",
      "settings": {}
    },
    "footer": {
      "type": "volta-footer",
      "settings": {}
    }
  },
  "order": ["hero", "flavors", "shot_band", "story", "footer"]
}
```

(Removes `volta-footer-legal` reference. Task 8 deletes the file.)

- [ ] **Step 3: Theme check**

```bash
npx shopify theme check 2>&1 | grep "index\.json" -A 2 | head -10
```

Expected: no `MissingTemplate` errors. Should resolve `volta-hero`, `volta-products`, `volta-shot-band`, `volta-story`, `volta-footer` — all of which now exist in `sections/`.

- [ ] **Step 4: Commit**

```bash
git add templates/index.json
git commit -m "chore(templates): expand home from 2 sections to 5 for Phase 2

Order: volta-hero → volta-products → volta-shot-band → volta-story → volta-footer.
Removes volta-footer-legal reference (file deleted in Task 8)."
```

---

### Task 8: Delete sections/volta-footer-legal.liquid

**Files:**
- Delete: `sections/volta-footer-legal.liquid`

- [ ] **Step 1: Verify nothing else references it**

```bash
grep -rn "volta-footer-legal" --include="*.liquid" --include="*.json" . 2>/dev/null | grep -v "^./preview/" | grep -v "^./mockup/" | grep -v "^./docs/"
```

Expected: zero matches (the only reference WAS in `templates/index.json`, removed in Task 7).

- [ ] **Step 2: Delete**

```bash
git rm sections/volta-footer-legal.liquid
```

- [ ] **Step 3: Theme check + commit**

```bash
npx shopify theme check 2>&1 | grep "volta-footer-legal" || echo "OK — no references"
git commit -m "chore(sections): delete volta-footer-legal (replaced by volta-footer)

Phase 2 footer (sections/volta-footer.liquid) is now the canonical
footer with newsletter capture + Volta Courant + 5 legal links.
volta-footer-legal was the Phase 1 minimal placeholder."
```

---

### Task 9: Push Phase 2 to Shopify + verify acceptance

**Files:** none modified — deploy + verify gate.

- [ ] **Step 1: Push to the existing theme**

```bash
: > /tmp/push-phase2.log
npx shopify theme push --store=volta-drinks.myshopify.com --theme=199379681617 --nodelete --json 2>&1 | tee /tmp/push-phase2.log
```

Wait for completion (~1-2 min).

- [ ] **Step 2: Inspect errors block**

```bash
tail -40 /tmp/push-phase2.log
```

The final JSON line has an `errors` object. Expected: ZERO errors (Phase 1's legacy errors should be GONE since we deleted volta-subscription-toggle in Task 1 and refactored volta-products in Task 2).

If ANY error remains on a Phase 1 or Phase 2 file, that's a failure — fix and re-push.

- [ ] **Step 3: Push commits to origin**

```bash
git push -u origin feature/v1-phase2-multisection
```

- [ ] **Step 4: Phase 2 acceptance self-check (spec §5.6)**

Verify (or note as needing owner browser QA):

1. **Five sections render in order** ✅ Code-verified by `templates/index.json` (Task 7)
2. **Golden Kick card is buyable** — form posts to /cart/add with `featured.variants.first.id`; verified in Task 2 markup. NEEDS OWNER QA in browser once Golden Kick product is created
3. **Other cards show "Bientôt" disabled pill** — code-verified in Task 2
4. **Newsletter form** posts to Klaviyo OR shows placeholder when `volta_klaviyo_public_key` is empty — code-verified branching in Task 5
5. **Theme Editor compatibility** — every section has a preset and uses `t:` references; merchant should be able to add/remove/reorder
6. **`shopify theme push` zero V1+P2 errors** — verified in Step 2
7. **Lighthouse mobile Performance ≥ 90, A11y ≥ 95** — UNVERIFIABLE without live Lighthouse run (owner punch list)
8. **axe-core zero violations** — UNVERIFIABLE without live axe run (owner punch list)
9. **CLS < 0.1 on full scroll** — VERIFIED via explicit `width`/`height` on every `<img>`, no animated layout properties; LIKELY clean
10. **60fps on scroll-bound animations** — story line reveal uses only `transform`/`opacity`, IntersectionObserver triggered; LIKELY clean

- [ ] **Step 5: Final status report**

Report to controller:
- Phase 2 commit range
- Push result (clean / any errors)
- Preview URL (same as Phase 1: `https://volta-drinks.myshopify.com?preview_theme_id=199379681617`)
- Owner punch list deltas: Klaviyo list ID (separate from public key), legal page content, accept/customize per-flavor accent colors

No commit on this task.

---

## What comes after Phase 2

After Phase 2 ships and the owner signs off on the preview, **Phase 3** (polish) gets its own plan. Phase 3 covers:

- Activate custom cursor (`snippets/volta-cursor.liquid` + `assets/volta-cursor.js`)
- Wire magnetic CTAs (`data-v-magnet` attribute → `assets/volta-motion.js` `magnetize` API) for hero CTA, product card CTAs, newsletter submit
- Add letter-drop reveal to hero title (using the `data-v-letters` attribute already on the hero h1)
- Reduced-motion comprehensive pass across all animations
- Lighthouse audit (target Perf ≥ 90, A11y ≥ 95)
- axe-core scan (target zero violations)
- Browser QA matrix: Chrome desktop, iOS Safari, Android Chrome
- Cookie banner (Shopify native consent or Consentmo)

---

## Plan self-review

(Performed by plan author before handoff.)

**1. Spec coverage:**
- Spec §5.1 (Files touched) — all listed files have a task: `volta-products` ✅ Task 2 · `volta-shot-band` ✅ Task 3 · `volta-story` ✅ Task 4 · `volta-footer` ✅ Task 5 · `volta-subscription-toggle` ✅ Task 1 (delete) · `templates/index.json` ✅ Task 7 · locales ✅ Task 6 · `volta-footer-legal` deletion ✅ Task 8
- Spec §5.2 (4-flavor grid) — Task 2's markup has 4 hardcoded cards with per-flavor accents; Golden Kick branches on featured_product
- Spec §5.3 (60ml shot band) — Task 3 implements
- Spec §5.4 (manifesto) — Task 4 implements 3-line scroll-reveal
- Spec §5.5 (footer with newsletter) — Task 5 implements, including Klaviyo branching
- Spec §5.6 (acceptance criteria) — Task 9 walks each

**Gap noted + acceptable:** Klaviyo integration needs a LIST ID (different from public key). The plan acknowledges this in Task 5's prose; owner punch list captures it. The form will RENDER when public key is set but won't actually subscribe until list ID is also configured. Phase 3 or V1.5 polish can add the list ID setting.

**2. Placeholder scan:**
- No "TBD", "TODO", "implement later" in any step
- Task 6 locale values are concrete French + English copy
- Task 2's schema has concrete color picker defaults
- Task 7's `templates/index.json` is the full final content

**3. Type consistency:**
- Locale keys: `sections.volta_products.*` used in Task 2 (Liquid `t:` calls) and Task 6 (JSON keys) — match ✅
- `sections.volta_shot_band.*` — Tasks 3 + 6 match ✅
- `sections.volta_story.*` — Tasks 4 + 6 match ✅
- `sections.volta_footer.*` — Tasks 5 + 6 match ✅
- Section types: `volta-products`, `volta-shot-band`, `volta-story`, `volta-footer` consistent between section file names and `templates/index.json` (Task 7) ✅
- Schema setting IDs: `featured_product`, `accent_*`, `heading`, `body`, `caption`, `newsletter_heading`, `contact_email` — consistent between Task 2-5 Liquid + schema and Task 6 schema-locale labels ✅
- CSS class namespaces: `.v-products__*`, `.v-shot-band__*`, `.v-story__*`, `.v-footer__*` — each section uses its own namespace, no leakage ✅
- The hero already uses `.v-hero-charged__*` — no collision ✅
- `data-v-reveal` and `data-v-magnet` attributes referenced — Phase 3 wires the JS handlers; for Phase 2 they're inert (no JS binds them yet). Acceptable as long as the markup is in place.

No issues found.

---
