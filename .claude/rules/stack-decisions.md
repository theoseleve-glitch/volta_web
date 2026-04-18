# Stack Decisions

The architectural choices for Volta Drinks, with the reasoning behind each. If you're about to deviate from one of these, re-read the reasoning first and flag the conflict before acting.

## Platform: Shopify Liquid (not Hydrogen)

**Decision:** Standard Shopify theme using Liquid templating, Online Store 2.0 (JSON templates).

**Why not Hydrogen:**
- Hydrogen requires React + Remix/React Router expertise, costs 3–5× more to build, and needs ongoing frontend engineering capacity.
- Most Shopify apps (including every subscription app worth using) integrate via Liquid theme extensions. Going headless means custom rebuilding each integration.
- Pre-revenue brand. Hydrogen makes sense above ~€500k/year revenue where the 5-point Lighthouse delta matters commercially.
- Awwwards-level motion does not require Hydrogen. GSAP and Lenis are framework-agnostic.

**Revisit when:** annual revenue > €500k AND a content/editorial layer becomes a bottleneck.

## Base theme: Dawn

**Decision:** Fork Dawn (Shopify's reference theme).

**Why:**
- Dawn is maintained by Shopify, ships clean Lighthouse ~90 mobile out of the box, uses OS 2.0 JSON templates, follows current Shopify conventions.
- Any custom theme we could build from scratch would have to re-solve problems Dawn has already solved (cart AJAX, variant picker, quantity stepper, focus traps, locale handling).
- Paid themes (Impulse, Prestige, etc.) are tempting but lock us into the theme author's patterns and slow down motion layer integration.

**What we modify heavily:** sections, snippets, assets (CSS + JS).
**What we touch lightly:** layout/theme.liquid (inject our CSS/JS, keep Dawn's core).
**What we leave alone:** Dawn's core accessibility primitives, focus management, quantity-input web component.

## Motion stack: GSAP 3 + ScrollTrigger + Lenis (CDN)

**Decision:** Load all three from CDN. No npm build step.

**Why not npm:**
- Shopify themes don't have a build step natively. Adding one (Webpack, Vite, etc.) adds CI complexity and breaks the Theme Editor's live-reload.
- CDN scripts are cached aggressively by Cloudflare; LCP impact is negligible after first load.
- Dev ergonomics: editing a `.js` file in `/assets/` hot-reloads instantly.

**Specifics:**
- GSAP 3.12.5 (last stable as of April 2026)
- Lenis 1.1.18
- Load with `defer`, in this order: GSAP → ScrollTrigger → Lenis → `volta-motion.js`

**Rejected:**
- Framer Motion: requires React
- Motion One: lighter than GSAP but ScrollTrigger is best-in-class, no substitute
- ScrollMagic: abandoned, use GSAP ScrollTrigger instead

## Subscription app: Seal Subscriptions

**Decision:** Seal for launch, migration path to Recharge at ~€15k/mo MRR.

**Why Seal:**
- Free plan, 0% transaction fees (Recharge charges $99/mo + 1.34% from subscriber #50)
- European company, RGPD-conscious
- Injects frontend widgets that work natively in Liquid themes
- Supports mixed subscriptions in cart (required for the Mixed Pack SKU)
- Passwordless customer portal, mobile-friendly

**What to ignore about Seal:**
- Its default storefront widget is ugly. We hide it and build our own toggle (`volta-subscription-toggle.liquid`).

**Migration trigger:** when subscription MRR > €15k, retention analytics become the bottleneck, or the client needs advanced win-back flows. Then migrate to Recharge or Skio.

## Bilingual: Shopify Markets (not translation apps)

**Decision:** Native Shopify Markets + `/locales/fr.default.json` + `/locales/en.json`. No Langify or Weglot.

**Why:**
- Native Markets is free, SEO-friendly (proper hreflang, subfolder URLs), and doesn't add a third-party JS payload.
- Translation apps inject runtime scripts that translate the DOM — slower, worse SEO, brittle.
- `{{ 'key' | t }}` is the Shopify standard and every developer knows it.

**Cost:** writing translation keys is tedious but pays off in perpetuity.

## Analytics: GA4 + Meta Pixel + Klaviyo

**Decision:** GTM container as orchestrator, native Meta Shopify integration, Klaviyo for email.

**Why GTM:**
- Single point of control for the client (they can add scripts without dev work)
- Clean dataLayer events for downstream tools
- Free

**Why Klaviyo over alternatives (Mailchimp, Brevo):**
- Deepest Shopify + Seal integration of any ESP
- Free up to 250 contacts, 500 emails/mo
- Flow templates for DTC commerce

## Review app: Judge.me

**Decision:** Judge.me for launch (free tier).

**Why:**
- Free with paid upgrades; works on every Shopify plan
- Native rich snippets for SEO
- Can import reviews later from Loox/Yotpo if the client wants to switch

## Cookie banner: Consentmo (or Shopify's native consent)

**Decision:** Use Shopify's native consent API if available; fallback to Consentmo.

**Why:**
- Shopify's consent mode handles GDPR routing to GA4, Meta, etc. automatically
- Consentmo is a well-reviewed app with a free tier

## What we're NOT using (with reasons)

- **Tailwind CSS:** raw CSS with design tokens gives finer control. Tailwind's utility classes fight against Shopify Liquid's section-based architecture.
- **Alpine.js / HTMX:** Dawn uses web components. Adding another micro-framework duplicates functionality.
- **TypeScript:** Theme JS is small enough that TS adds setup burden without meaningful payoff.
- **A bundler (Vite/Webpack):** see CDN decision above.
- **jQuery:** obviously.

---

**Last updated:** April 2026. Revisit quarterly.
