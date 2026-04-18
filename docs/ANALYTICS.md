# Analytics & Tracking

What fires, where, and from which source. Updated 2026-04-17.

---

## Install status

| Vendor | Installed via | Required setting | Status |
|---|---|---|---|
| Google Tag Manager | Theme (`snippets/volta-analytics.liquid`) | `volta_gtm_id` in Theme Settings → Volta · Analytics | Configurable; no default |
| Google Analytics 4 | Inside GTM container | GTM tag | Configured in GTM |
| Meta Pixel | **Preferred:** Shopify Meta sales channel (native). **Fallback:** theme setting `volta_meta_pixel_id` | Meta Pixel ID | Dual-path |
| Klaviyo | Shopify App + theme snippet for web tracking | `volta_klaviyo_public_key` | Configurable; no default |
| Core Web Vitals | Theme JS (`volta-events.js`) | none (auto) | Fires LCP/CLS/INP to dataLayer |

## dataLayer event catalog

All pushed by `/assets/volta-events.js`. GTM will see every event under `event: <name>`.

### Auto-fire

| Event | When | Payload |
|---|---|---|
| `volta_page_view` | Page load | `path`, `locale` |
| `web_vital` | LCP/CLS/INP observed | `name` (LCP/CLS/INP), `value` (ms or unitless) |
| `volta_cursor_engaged` | First cursor hover on any interactive element (fires once per session) | none |

### User-action-fire

| Event | When | Payload |
|---|---|---|
| `volta_add_to_cart` | Cart add succeeds | `product_id`, `variant_id`, `price`, `quantity`, `subscription` (bool), `currency` |
| `volta_subscription_selected` | User selects subscription radio | `selling_plan_id` |
| `volta_checkout_started` | Click on cart-drawer checkout button | `source: 'drawer'` |

### Meta Pixel mapping

Events are translated for Meta's standard-event API:

| Volta event | Meta event | Notes |
|---|---|---|
| `volta_add_to_cart` | `AddToCart` | Maps `product_id → content_ids`, `price/100 → value` |
| `volta_checkout_started` | `InitiateCheckout` | — |

### Klaviyo mapping

All Volta events are `_learnq.push(['track', event_name, payload])` — Klaviyo picks them up as custom events automatically.

---

## Checkout-level events

These are **not** fired by the theme. They come from:

- **Shopify's Web Pixels API** (installed via Shopify Meta sales channel and Klaviyo app) — Purchase, ViewContent on checkout pages, order completion
- Klaviyo's native Shopify integration — checkout started, order placed, order fulfilled, refund

This split matters: even on Shopify Basic (no `checkout.liquid` access), we still get proper order-level attribution because the apps use Web Pixels.

---

## How to verify

1. **GTM Preview Mode**: paste the dev theme URL into GTM's Preview. You should see `volta_page_view` fire on load and `volta_add_to_cart` fire when you add an item.
2. **GA4 DebugView**: GA4 property → Configure → DebugView. All events flow here once GTM → GA4 is wired.
3. **Meta Pixel Helper** (Chrome extension): should detect the Pixel ID and show `PageView` + `AddToCart` on the product page.
4. **Klaviyo web tracking**: Klaviyo admin → Profiles → look for browser activity once you trigger events.

---

## Blocked on client inputs

These settings are required before launch (also tracked in `docs/OPEN_QUESTIONS.md`):

- [ ] GTM container ID
- [ ] Meta Pixel ID
- [ ] Klaviyo public key
- [ ] GA4 property (created inside GTM, no theme-level input needed)
