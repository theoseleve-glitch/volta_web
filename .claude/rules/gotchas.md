# Gotchas

Things that bit us. Living document — append new discoveries here so they don't bite twice.

## Theme Editor conflicts

- **Lenis breaks the Theme Editor preview.** When a merchant drags a section or updates a setting, the editor live-reloads that section; Lenis's transform on `<body>` scrambles the reload positioning. **Fix:** disable Lenis when `window.Shopify?.designMode === true`.

- **Custom cursor doesn't work in Theme Editor.** The editor's iframe mouse events are rebased, so the cursor position lags. **Fix:** don't initialize cursor in design mode.

- **`shopify:section:unload` event fires when sections are removed.** If you registered ScrollTriggers for that section, they keep firing on ghost elements. **Fix:** always store ScrollTrigger references scoped to the section ID, and kill them in the unload handler.

## Liquid quirks

- **`{% include %}` is deprecated.** Use `{% render %}`. Old Dawn snippets may still use include — update them when you touch them.

- **`render` has sandboxed scope.** Parent variables are NOT available unless explicitly passed:
  ```liquid
  {% render 'product-card' with product: product %}
  ```

- **Metafield access returns empty string, not nil, when missing.** Always check with `!= blank`, not `!= nil`.

- **`{{ 'asset.css' | asset_url }}` cache-busts automatically.** Don't manually add `?v=123` — Shopify handles it.

## Seal Subscriptions

- **Seal injects a default widget regardless of theme customization.** The selector is `.seal-subscriptions-widget`. Hide with `display: none !important;` in our CSS, build our own.

- **Seal requires specific line item properties for subscriptions.** When building a custom add-to-cart, include `selling_plan` in the POST body:
  ```js
  {
    items: [{ id: variantId, quantity: 1, selling_plan: sealSellingPlanId }]
  }
  ```

- **Seal's "mixed subscription" requires all items to be subscription items in the cart.** Mixing one-time and subscription items in one cart can work but Seal throws warnings. Test this before assuming.

## GSAP + ScrollTrigger

- **ScrollTrigger.refresh() is needed after dynamic content loads.** When we AJAX-load product variants or the cart drawer content, any ScrollTriggers that depend on element positions need refreshing.

- **`pin: true` on sections that contain sticky elements creates a stacking bug.** Don't mix GSAP pinning with CSS `position: sticky` on the same ancestor chain.

- **`scrub: true` with `markers: true` in development is a lifesaver.** Remove markers before production.

## Shopify AJAX cart

- **`/cart/add.js` POST returns only the added item, not the full cart.** Fetch `/cart.js` after add to get full cart state.

- **Line items have a numeric `key` (e.g., `"4871234:abc123"`).** Use the full key when calling `/cart/change.js`, not the variant ID alone.

- **Cart notes have a 4 KB limit.** If you're using line item properties for mixed pack compositions, watch the total size.

## Fonts

- **Google Fonts `display=swap` query param is required.** Without it, text can be invisible for seconds on slow connections.

- **Preloading a font from Google requires `crossorigin` attribute.** Without it, the preload is discarded and refetched.

## Image handling

- **`image_url: '800x'` gives you a width-constrained image, `'800x600'` gives you a cropped image.** They're different — don't mix up.

- **Shopify CDN doesn't support AVIF natively as of April 2026.** We serve WebP. Don't request `.avif` from `image_url`.

- **`loading="lazy"` on above-the-fold images hurts LCP.** Only lazy-load below-the-fold images.

## French specifics

- **VAT (TVA) rate for beverages depends on category.** Standard beverages = 20%, some foods = 5.5%. Functional shots: check with accountant — probably 20%.

- **"Droit de rétractation" (right of withdrawal) is 14 days for distance selling** under French consumer law. EXCEPT for perishable goods (which our shots are, after opening). Display the withdrawal notice + the perishable exception clearly.

- **Prices must be displayed TTC (tax-included) to consumers.** B2B can show HT (tax-excluded). Our site is B2C — always TTC.

## Klaviyo / email

- **Klaviyo's `_learnq.push(['track', ...])` queue fires before Klaviyo's script loads.** Safe to call immediately; queue is processed on load. No need for `window.onload` wrapper.

- **Klaviyo tracks on the current domain only.** If the client has a `.fr` and a `.com` variant, you need two Klaviyo tracking keys or one public key with domain-agnostic config.

## Git / deployment

- **`config/settings_data.json` MUST be gitignored.** If it isn't, multiple devs push over each other's merchant settings.

- **`shopify theme push --unpublished` creates a new unpublished theme every time.** You'll end up with 20 unpublished themes if you're not careful. Use `--theme-id` to target a specific dev theme.

- **Shopify has a 1,000 file theme limit.** Monitor as you add sections — this is easy to hit on a heavily customized theme.

## Mobile specifics

- **iOS Safari's `100vh` includes the URL bar** — results in scroll jank on sites using `min-height: 100vh`. Use `100svh` (small viewport height) for iOS-safe full-height sections.

- **Touch events don't trigger `:hover` styles on iOS.** Don't rely on hover for essential interactions.

- **`-webkit-tap-highlight-color` is the blue flash on tap.** Disable it for custom-styled buttons: `-webkit-tap-highlight-color: transparent;`.

---

**When you find a new gotcha, add it here.** Include: what happened, why it happened, how to fix/avoid.
