# Shopify Conventions

Hard rules for working inside a Shopify Liquid theme. Violations break the Theme Editor, the merchant admin experience, or production silently.

## Directory structure

Respect the Shopify theme structure. Do not invent new top-level directories.

```
/assets/          — CSS, JS, images, fonts (flat structure, no subdirs)
/config/          — settings_schema.json (dev-controlled), settings_data.json (merchant-controlled, gitignored)
/layout/          — theme.liquid (main wrapper), gift_card.liquid
/locales/         — fr.default.json, en.json, schema locales
/sections/        — reusable section blocks (have schema, appear in Theme Editor)
/snippets/        — partials rendered via {% render %} (no schema)
/templates/       — JSON templates for OS 2.0 pages, plus customer/* Liquid templates
```

## Liquid syntax hard rules

- **Use `{% render 'snippet' %}`, never `{% include 'snippet' %}`.** Include is deprecated and leaks parent scope.
- **Pass variables explicitly to render:** `{% render 'product-card' with product: product, variant: variant %}`. Render has a sandboxed scope.
- **Use `{% liquid %}` for multi-line logic** — cleaner than a wall of `{% %}` tags.
- **Always check existence before outputting:** `{% if product.metafields.custom.tagline != blank %}`.
- **Never construct dynamic metafield keys at runtime.** Shopify caches metafields by key; dynamic keys break caching.

## Schema rules

Section schema is validated by Shopify on push. Malformed schema breaks the Theme Editor silently.

- Every `type` value must match Shopify's supported input types: `text`, `richtext`, `image_picker`, `url`, `color`, `range`, `select`, `checkbox`, `radio`, `product`, `collection`, `page`, `blog`, `article`, `video_url`, `font_picker`, `header`, `paragraph`.
- `id` values must be snake_case and unique within the schema.
- `label` values should be translatable: use `"label": "t:sections.hero.headline.label"` and define in `/locales/*.schema.json`.
- Include `"blocks": [{ "type": "@app" }]` in sections that should support app blocks.
- `preset` is required for sections to appear in the "Add section" menu in the Theme Editor.

## Theme Editor compatibility

Every section you build must:
- Be addable from the Theme Editor (have a `preset`)
- Be removable without breaking the page
- Be reorderable (no hardcoded z-index or position-absolute chains that depend on DOM order)
- Re-render correctly when the merchant edits a setting (use Shopify's section events: `shopify:section:load`, `shopify:section:unload`, `shopify:section:select`)

## Asset loading

- Use `{{ 'filename.css' | asset_url | stylesheet_tag }}` for CSS.
- Use `{{ 'filename.js' | asset_url | script_tag }}` for JS with standard loading.
- For deferred JS: `<script src="{{ 'filename.js' | asset_url }}" defer></script>`.
- For preload: `<link rel="preload" href="{{ 'filename.woff2' | asset_url }}" as="font" type="font/woff2" crossorigin>`.
- **Never inline large CSS or JS in theme.liquid.** Keep layout lean.

## Metafields

- Themes can only READ metafields. Never attempt to write from Liquid or client-side JS.
- Access pattern: `product.metafields.{namespace}.{key}`.
- Metafield values have a 16 KB per-value cap. If a value looks truncated, flag it.
- Document every custom metafield namespace/key in `/docs/METAFIELDS.md` so the merchant knows what to configure.

## Translation rules

- Every user-facing string must be in `/locales/*.json`, accessed via `{{ 'key.path' | t }}`.
- Nest keys sensibly: `sections.hero.headline`, not `hero_headline`.
- Schema labels use `t:` prefix: `"label": "t:sections.hero.headline.label"`.
- When Claude Code encounters a hardcoded FR or EN string, it should:
  1. Propose a translation key
  2. Add the entry to both `fr.default.json` and `en.json` (with `[EN: TODO]` placeholder if EN copy is pending)
  3. Replace the hardcoded string with `{{ 'key' | t }}`

## Variants and cart

- Use Shopify's AJAX Cart API (`/cart/add.js`, `/cart/update.js`, `/cart/change.js`) for all cart interactions. Never do full-page form submits.
- Always include `id` (variant ID) and `quantity` on add-to-cart requests. Optional: `selling_plan` for subscriptions, `properties` for line item properties.
- After any cart mutation, fetch `/cart.js` to get the updated cart state — don't trust optimistic UI alone.

## Git hygiene

- **`config/settings_data.json` is gitignored.** It contains merchant customizations from the admin. Syncing it across team members overwrites each other's work.
- **Branch naming:** `feature/*`, `fix/*`, `chore/*`.
- **Commit messages:** imperative mood, reference the theme area.
  - Good: "Add sticky header scroll behavior"
  - Bad: "fixed stuff"

## Validation before commit

```bash
shopify theme check                  # Liquid linter + schema validator
shopify theme dev                    # Visual check in browser
```

`shopify theme check` must pass with zero errors. Warnings on files you touched must be resolved. Warnings on untouched Dawn files can be left alone.

## Deployment

- **Never push directly to the live/published theme.** Use `shopify theme push --unpublished` to push to an unpublished theme, QA it in the admin preview, then publish via the admin.
- **Tag every release** with a semantic version: `v0.1.0`, `v0.2.0`, etc. Push tags so the client has a rollback path.

---

## Common mistakes to avoid

1. Editing `settings_data.json` directly → breaks merchant customizations
2. Using `{% include %}` → deprecated, use `{% render %}`
3. Hardcoding strings → breaks translation
4. Dynamic metafield keys → breaks caching
5. Animating layout properties → kills performance
6. Forgetting to handle `shopify:section:load` → breaks Theme Editor live reload
7. Missing `preset` in section schema → section invisible in Theme Editor
8. Pushing `node_modules/` → blow up the theme upload limit
