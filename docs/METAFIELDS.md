# Metafields Registry

Central documentation for custom metafields used by the Volta Drinks theme. Every metafield the theme reads must be listed here so the merchant knows what to configure in Shopify admin.

**Rule:** Themes can only READ metafields. Never write from Liquid or client-side JS.

**Access pattern:** `{{ product.metafields.[namespace].[key] }}`

**Always guard with `!= blank`** before outputting.

---

## Product metafields

### `custom.tagline`
- **Type:** Single line text
- **Used in:** Product cards, product page hero
- **Example:** "Gingembre. Citron. Éclair."
- **Required:** yes, for all products

### `custom.ingredient_list`
- **Type:** Rich text
- **Used in:** Product page accordion "Ingrédients complets"
- **Example:** "Jus d'ananas (60%), jus de citron (25%), gingembre frais (15%), acide ascorbique, glycérine végétale."
- **Required:** yes (regulatory)

### `custom.nutrition_per_100ml`
- **Type:** JSON
- **Used in:** Product page accordion "Valeurs nutritionnelles"
- **Example:**
  ```json
  {
    "energy_kcal": 42,
    "energy_kj": 176,
    "fat_g": 0.1,
    "fat_saturated_g": 0,
    "carbs_g": 9.8,
    "sugars_g": 8.2,
    "protein_g": 0.3,
    "salt_g": 0.01
  }
  ```
- **Required:** yes (regulatory)

### `custom.allergens`
- **Type:** List of single line text
- **Used in:** Product page, legally required allergen display
- **Example:** `["none"]` or `["celery", "mustard"]`
- **Required:** yes (regulatory)

### `custom.dominant_ingredient_image`
- **Type:** File (image)
- **Used in:** Product page "L'ingrédient héro" scroll-scrubbed section
- **Required:** yes

### `custom.process_steps`
- **Type:** JSON
- **Used in:** Product page "Comment on le fait" section
- **Example:**
  ```json
  [
    { "step": 1, "title": "Extraction à froid", "description": "..." },
    { "step": 2, "title": "Pasteurisation douce", "description": "..." }
  ]
  ```
- **Required:** no (falls back to generic copy if missing)

### `custom.subscription_only`
- **Type:** Boolean
- **Used in:** Product page — hides one-time purchase option if true
- **Example:** `true` for Mixed Pack, `false` for individual flavors
- **Required:** yes

### `custom.mascot_state_override`
- **Type:** Single line text
- **Used in:** Overrides default mascot state on this product page
- **Allowed values:** `idle`, `charging`, `sad`, `celebrate`
- **Required:** no (defaults to `idle`)

---

## Collection metafields

### `custom.hero_video_url`
- **Type:** URL
- **Used in:** Collection page hero background
- **Required:** no

### `custom.color_accent`
- **Type:** Color
- **Used in:** Collection page section accents (override of default green)
- **Required:** no

---

## Shop metafields

### `custom.shipping_free_threshold_cents`
- **Type:** Integer
- **Used in:** Cart drawer free shipping progress bar
- **Example:** `2500` (for €25.00)
- **Required:** yes

### `custom.trust_badges`
- **Type:** JSON
- **Used in:** Product page + footer trust bar
- **Example:**
  ```json
  [
    { "icon": "truck", "label_fr": "Livraison 48h", "label_en": "48h shipping" },
    { "icon": "leaf", "label_fr": "Sans sucre ajouté", "label_en": "No added sugar" },
    { "icon": "vegan", "label_fr": "Vegan", "label_en": "Vegan" },
    { "icon": "france", "label_fr": "Made in France", "label_en": "Made in France" }
  ]
  ```
- **Required:** yes

---

## How to add a new metafield

1. Add it to this registry FIRST (document before building).
2. Merchant (or Théo) creates the metafield definition in Shopify admin → Settings → Custom data.
3. Populate values for existing products/collections.
4. Only then consume it in Liquid.

## Metafield size limits

- **Per value cap:** 16 KB
- **If a value appears truncated,** the fix is on the admin side (shorter content), not in the theme.
- For rich text or long content, verify the rendered output matches the admin value.

## Deprecated metafields

None currently. When removing a metafield, move the entry here with a deprecation date and reason.
