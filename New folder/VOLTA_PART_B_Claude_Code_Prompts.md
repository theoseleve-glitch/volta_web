# Volta Drinks — Part B: Prompts for Claude Code

**For:** Théo (to paste into Claude Code terminal)
**Prepared:** April 2026
**Scope:** 14 sequenced prompts that build the Volta Drinks Shopify theme from Dawn base to launch-ready.

**How to use:** Run these in order. Each prompt is standalone — paste the whole thing, let it complete, review, then move on. Each assumes the previous is done. Don't skip.

---

# PART B — PROMPTS FOR CLAUDE CODE

Run these in order. Each is a standalone prompt — paste the whole thing into Claude Code, let it complete, review, then move on.

**Setup before you start:**

```bash
# Install Shopify CLI if you haven't
npm install -g @shopify/cli@latest

# In your working directory
shopify theme init volta-drinks --clone-url https://github.com/Shopify/dawn
cd volta-drinks
shopify theme dev --store=volta-drinks.myshopify.com
```

Once the dev server is running and you see Dawn in your browser, start Claude Code in the same directory.

---

## PROMPT 1 — Project orientation & audit

```
You are building a Shopify storefront for Volta Drinks, a French premium functional beverage brand (ginger-based wellness shots) targeting health-conscious urban consumers. The brand is playful/mascot-led (green lightning bolt character), bilingual FR/EN, subscription-enabled, and needs to hit Awwwards-level polish while maximizing conversion.

Your first task: orient yourself. Do NOT write any code yet.

1. Run `ls -la` and map the full Dawn theme directory structure. Produce a tree of the top 3 levels.
2. Read /config/settings_schema.json and summarize the current theme settings groups.
3. Read /sections/main-product.liquid and summarize how Dawn handles product pages — specifically variant selection, add-to-cart logic, and media gallery.
4. Read /sections/header.liquid and /sections/footer.liquid — summarize navigation structure.
5. Identify which sections currently render on the homepage by reading /templates/index.json.
6. Flag any files you'll need to heavily modify vs. replace vs. leave alone.

Output: a markdown orientation doc at /docs/THEME_AUDIT.md with findings and a recommended modification plan. Be specific about file paths.

Do not modify any files yet.
```

---

## PROMPT 2 — Design system foundation

```
Now set up the design system foundation for Volta Drinks. Create these in /assets/:

FILE: volta-tokens.css

Define CSS custom properties on :root for:

Colors:
  --volta-green: #4ADE80 (PLACEHOLDER — will swap for exact hex from client logo)
  --volta-green-dim: rgba from --volta-green at 0.5 alpha
  --volta-yellow: #FDE047 (neon accent)
  --volta-ink: #0E0E10 (near-black for text)
  --volta-cream: #F7F7F2 (off-white background, NEVER pure white)
  --volta-cream-warm: #F2EFE5 (slightly warmer variant for section breaks)
  --volta-shadow: rgba(14, 14, 16, 0.08)

Typography:
  --font-display: 'Bricolage Grotesque', sans-serif (for huge hero/display text — voice of the brand)
  --font-body: 'Inter', sans-serif (only for body/UI — we're not using Inter for display)
  --font-mono: 'JetBrains Mono', monospace (for labels, eyebrows, price tickers)

Type scale (clamp-based, fluid):
  --text-xs: clamp(11px, 0.7vw, 12px)
  --text-sm: clamp(13px, 0.85vw, 14px)
  --text-base: clamp(15px, 1vw, 17px)
  --text-lg: clamp(18px, 1.3vw, 22px)
  --text-xl: clamp(22px, 1.8vw, 28px)
  --text-2xl: clamp(28px, 2.4vw, 40px)
  --text-3xl: clamp(36px, 3.5vw, 56px)
  --text-hero: clamp(56px, 9vw, 160px)

Spacing scale (based on 4px grid):
  --space-1 through --space-24 (4px to 96px in a musically-spaced scale)

Motion tokens:
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1)
  --ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1)
  --duration-fast: 0.2s
  --duration-base: 0.4s
  --duration-slow: 0.8s
  --duration-luxury: 1.2s

Then add global resets:
- Remove default font-family from body, set to --font-body
- background: var(--volta-cream)
- color: var(--volta-ink)
- scroll-behavior: auto (Lenis will handle scroll smoothing — we override Dawn's default)
- Add a subtle noise/grain overlay via SVG data URL as a fixed background layer at 3% opacity
- Selection color: background: var(--volta-green), color: var(--volta-ink)

Import Bricolage Grotesque, Inter, and JetBrains Mono via Google Fonts <link> in /layout/theme.liquid's <head>, with preconnect and font-display: swap.

Then add this file to the theme's stylesheet load order in /layout/theme.liquid (after Dawn's base.css).

Show me the diff before applying.
```

---

## PROMPT 3 — Lenis + GSAP foundation

```
Install Lenis and GSAP for smooth scrolling and scroll-driven animation. Load both from CDN (not npm — this is a Liquid theme, we keep it simple).

In /layout/theme.liquid, just before </body>, add:

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js"></script>

Then create /assets/volta-motion.js with:

1. Lenis initialization:
   - duration: 1.2
   - easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
   - smoothWheel: true
   - smoothTouch: false (mobile uses native scroll — feels wrong otherwise)

2. Sync Lenis with GSAP ScrollTrigger:
   - lenis.on('scroll', ScrollTrigger.update)
   - gsap.ticker.add((time) => { lenis.raf(time * 1000) })
   - gsap.ticker.lagSmoothing(0)

3. A global `window.VoltaMotion` object exposing:
   - lenis (the Lenis instance)
   - reveal(selector, options) — standard scroll-triggered reveal
   - pin(selector, options) — ScrollTrigger pin helper
   - parallax(selector, speed) — parallax on element
   - magnetize(selector, strength) — magnetic hover effect for buttons

4. A prefers-reduced-motion guard at the top:
   - If window.matchMedia('(prefers-reduced-motion: reduce)').matches — disable Lenis, skip all scroll animations, let the browser scroll natively. CRITICAL for accessibility.

5. At DOMContentLoaded, auto-initialize:
   - Reveal all elements with class .v-reveal (fade + translateY 40px → 0, stagger 80ms)
   - Magnetize all .v-magnetic elements (80px radius, 0.3 strength)
   - Parallax all .v-parallax elements at 0.85× scroll speed

Add this script to /layout/theme.liquid via {{ 'volta-motion.js' | asset_url | script_tag }} AFTER the GSAP/Lenis CDN scripts.

Test: after implementing, the homepage should scroll smoothly (lerped, not native). No content-breaking changes — just smoother scroll. Show me the files.
```

---

## PROMPT 4 — Custom cursor

```
Build a custom cursor system. This is a conversion-optimization piece disguised as aesthetic polish — it guides attention to CTAs.

Create /snippets/volta-cursor.liquid with the HTML shell:

<div class="v-cursor" aria-hidden="true">
  <div class="v-cursor__dot"></div>
  <div class="v-cursor__ring"></div>
  <div class="v-cursor__label"></div>
</div>

Include this snippet in /layout/theme.liquid just after <body>.

In /assets/volta-tokens.css (append, don't replace):
- .v-cursor: position fixed, z-index 9999, pointer-events none, top 0 left 0
- .v-cursor__dot: 6px circle, var(--volta-ink), mix-blend-mode: difference
- .v-cursor__ring: 32px circle, border 1.5px solid var(--volta-ink), transform-origin center
- .v-cursor__label: 10px uppercase monospace letter-spacing 2px, opacity 0 by default
- On body.cursor-hidden: display none (for touch devices)
- On .v-cursor--hover: ring scales to 2×, dot scales to 0.5×
- On .v-cursor--view: ring scales to 3×, label becomes visible with "VIEW" or custom text
- On .v-cursor--drag: ring becomes circle with "DRAG" label

In /assets/volta-motion.js (append):

1. Detect touch devices. If touch, add body.cursor-hidden and return early — don't initialize cursor.
2. Track mouse position with GSAP quickTo for performant follow (lerp with 0.15 factor for dot, 0.08 for ring — ring lags slightly)
3. On mouseenter of [data-cursor="hover"] → add .v-cursor--hover
4. On mouseenter of [data-cursor="view"] → add .v-cursor--view, set label text from data-cursor-label attribute (default "VIEW")
5. On mouseenter of [data-cursor="drag"] → add .v-cursor--drag
6. On mouseleave → remove all state classes
7. On mousedown anywhere → ring pulses (scale to 0.8 then back)

Apply to existing elements:
- All <a> and <button> in Dawn templates get data-cursor="hover"
- Product images get data-cursor="view" with data-cursor-label="VOIR" (FR) / "VIEW" (EN) — use {{ 'cursor.view_label' | t }} eventually
- Any horizontal scroll sections get data-cursor="drag"

Test: cursor should follow smoothly with slight lag on ring, expand on links/buttons, hide on touch devices. The mix-blend-mode: difference effect should make the cursor visible on any background.
```

---

## PROMPT 5 — Homepage structure (following the client's sketch)

```
Rebuild the homepage following this layout (derived from client's hand-drawn sketch):

HEADER (sticky, hides on scroll down / shows on scroll up):
- Left: logo (mascot + "VOLTA DRINKS" wordmark)
- Center: nav links — Shots / Abonnement / Notre Histoire / Avis
- Right: language toggle (FR/EN), cart icon with live count

HERO BANNER (100vh):
- Off-white background with a subtle fruit pattern or scattered small bottle graphics
- 4 product bottles arranged artistically — one centered large, 3 smaller around it
- Massive display headline: "CHARGE TON JUS" (FR) / "CHARGE UP" (EN)
- Subhead: "Shots fonctionnels. 100% naturel. 0% compromis." / "Functional shots. 100% natural. Zero compromise."
- Primary CTA: "Découvrir" / "Shop now" — magnetic button
- Secondary CTA: "Abonnement -30%" / "Subscribe -30%" — ghost style
- Mascot animation (placeholder for now — static SVG, we animate in Prompt 9)

"SHOT" EXPLAINER BAND (full-width, bold color):
- Green background (var(--volta-green))
- Left: "LE SHOT" huge type
- Middle: "60ml. 3 secondes. Une montée d'énergie nette, sans crash, sans sucre ajouté."
- Right: "BUY NOW" CTA that scrolls to product grid

PRODUCT GRID (4 products):
- Asymmetric layout — not a uniform 4-column grid. One product featured larger, others stagger around it
- Each product card:
  - Product image (parallax on scroll, data-cursor="view")
  - Price
  - Name
  - Tagline (1 line, monospace)
  - "Ajouter / Add" micro-CTA
- On hover: image scales slightly, card lifts with multi-layered shadow

SUBSCRIPTION BAND:
- Full-width yellow accent band (var(--volta-yellow))
- "Mixé. Livré. -30%." / "Mixed. Shipped. -30%."
- Short benefits list (3 items): flavor rotation, cancel anytime, free shipping
- CTA: "Commencer mon abonnement" / "Start my subscription"

"NOTRE HISTOIRE" / "OUR STORY" (horizontal scroll):
- A pinned section with horizontal scroll revealing 3-4 panels: origin, ingredients, production, vision
- Each panel has a image + short copy
- data-cursor="drag" on this section

REVIEWS BAND:
- Infinite-scroll marquee of customer quotes
- Placeholder: 6 fake reviews until real ones exist

FOOTER:
- Newsletter signup (large, bold)
- Links: CGV, Mentions légales, Contact, FAQ, Politique de confidentialité
- Social icons
- Copyright + "Made with ⚡ in France"

Implementation:
- Create /sections/volta-hero.liquid, /sections/volta-shot-band.liquid, /sections/volta-products.liquid, /sections/volta-subscription.liquid, /sections/volta-story.liquid, /sections/volta-reviews.liquid
- Each section has Shopify schema blocks so the client can edit from admin
- Replace /templates/index.json to use these sections
- Use {{ 'section_name.field_name' | t }} for all user-facing copy — this unlocks FR/EN translation later
- Add data-v-reveal, data-v-parallax, data-v-magnetic attributes where appropriate
- All images lazy-loaded with {% render 'image', ... %} Dawn pattern, with explicit width/height

Do not skip the translation keys. Every user-facing string MUST go through {{ | t }}. Add entries to /locales/fr.default.json and /locales/en.json.

Show me the section files one at a time, I'll approve each before you move to the next.
```

---

## PROMPT 6 — Product template with scroll-scrubbed hero

```
Rebuild the product template (/templates/product.json + /sections/main-product.liquid) for Volta shots. This is the #1 conversion page — every decision is conversion-first.

Layout (desktop):
- Left 50%: product media gallery, STICKY during scroll
  - Main image pinned
  - On scroll, the product image scales from 1 to 1.2 and has a subtle rotation (±5deg)
  - Secondary images appear as the user scrolls, fading/crossfading
  - This uses ScrollTrigger with scrub: true — classic Awwwards move
- Right 50%: scrolling product info
  - Breadcrumb: Shots / [Product Name]
  - Product name (display font, huge)
  - Price + subscription price comparison (strikethrough regular, highlight -30%)
  - Short tagline
  - Variant selector (pack size: 1 / 6 / 12 / Mixed subscription only)
  - Subscription toggle: "One-time" vs "Subscribe & save -30%" — uses Seal Subscriptions widget
  - Quantity selector (custom styled, not default)
  - ADD TO CART — massive magnetic button with the mascot punching animation on click
  - Trust bar: "Livraison 48h" "Sans sucre ajouté" "Vegan" "Made in France" (4 icons, monospace labels)
  - Expandable sections (accordion):
    - Ingrédients complets
    - Valeurs nutritionnelles
    - Comment le boire
    - Livraison & retours

Below the fold (full-width, breaking out of the 50/50):
- "L'INGRÉDIENT HÉRO" section — scroll-scrubbed reveal of the main ingredient with a WebGL-less but visually rich treatment (large image, layered text, subtle parallax)
- "CE QU'IL FAIT" — 3 benefit blocks, icon + headline + description, staggered reveal
- "COMMENT ON LE FAIT" — production process, 4 steps, horizontal scroll reveal
- Related products (3 other flavors)
- Reviews for this specific product

Technical:
- The sticky-media + scrolling-info split is done with CSS position: sticky on left col, normal flow right col
- All scroll-triggered animations respect prefers-reduced-motion
- On mobile, the layout stacks (media full-width at top, then info — NOT sticky on mobile, too janky)
- Add To Cart triggers the Seal Subscriptions widget if subscription is selected, else standard Shopify cart add via AJAX (don't do a full-page reload — update cart drawer in place)
- Cart drawer slides in from right, 500ms ease-out-expo, with the mascot doing a quick "got it" animation

Work on the Liquid + schema first, I'll approve, then the scroll animation JS, then the cart drawer.
```

---

## PROMPT 7 — Seal Subscriptions integration

```
Integrate Seal Subscriptions (https://apps.shopify.com/seal-subscriptions) into the product page and cart drawer.

Assumptions:
- Client has already installed Seal from the Shopify App Store
- Seal's default widget is currently showing as an ugly injected element — we need to either (a) style it to match our design or (b) replace it with a custom widget that talks to Seal's Liquid tags

Approach: custom widget. Seal exposes Liquid objects we can consume directly.

Steps:
1. Read Seal's theme integration docs (they live at /snippets/seal-subscriptions.liquid after install). Summarize what hooks we have.
2. Build /snippets/volta-subscription-toggle.liquid — a custom radio toggle:
   - "Achat unique" / "One-time" — shows regular price
   - "Abonnement mensuel -30%" / "Monthly subscription -30%" — shows discounted price, badge "ÉCONOMISE 30%"
   - Styled with our design system (cream background, green accent when selected, smooth transition)
3. When the user toggles, update the Add to Cart button's data-selling-plan-id to the correct Seal selling plan ID
4. Hide Seal's default widget entirely — we control the UI
5. Make sure cart line items show the subscription badge correctly in the cart drawer
6. On cart drawer, subscription items have a clear "Abonnement • Tous les mois" label

Also handle the "Mixed pack" case:
- This is ONLY available on subscription
- Product page for "Mixed Pack" hides the "One-time" toggle
- Copy: "Le pack mixte est exclusif à l'abonnement" with a link explaining why

Show me the toggle snippet first, then the JS that rewires the Add to Cart.
```

---

## PROMPT 8 — Mascot Lottie integration (or SVG fallback)

```
This is the signature-moment implementation.

IDEAL PATH: Lottie
- Client provides a Lottie JSON file of the mascot with multiple animation states: idle, charging, discharge, punch, celebrate
- We load Lottie-web from CDN, mount it, and control state via GSAP

FALLBACK PATH (if client has no Lottie asset): animated SVG
- We take the static mascot SVG (the green lightning bolt with face from the logo)
- We break it into separate paths (body, eyes, pupils, fists, mouth)
- We animate via GSAP by targeting those paths

For now, implement the FALLBACK. We'll swap to Lottie when the client provides the file.

Steps:
1. Convert the existing logo PNG to SVG using https://svgtrace.com or similar (you can instruct the user to do this manually — you can't do image→SVG conversion in terminal, but you can write the SVG by hand if the mascot shape is simple enough).
2. Actually — write a hand-coded SVG of the mascot inline. Use the reference image (green lightning bolt, cartoon face with two eyes, two small fists, smile). Give each part an ID: #v-mascot-body, #v-mascot-left-eye, #v-mascot-right-eye, #v-mascot-left-pupil, #v-mascot-right-pupil, #v-mascot-left-fist, #v-mascot-right-fist, #v-mascot-mouth.
3. Save as /snippets/volta-mascot.liquid with the inline SVG and wrapper <div class="v-mascot" data-mascot-state="idle">...</div>
4. Create /assets/volta-mascot.js:
   - Class VoltaMascot that takes the root element
   - Methods: setState(state), charge(), discharge(), punch(), celebrate(), follow(cursor)
   - States:
     - idle: gentle breathing (scale 1.0 → 1.02 on a 3s loop), pupils track cursor at 3px radius
     - charging: pupils glow yellow, subtle vibration (x: ±1px), color tint darkens
     - discharge: quick flash (opacity pulse), mascot briefly scales 1.3 then back
     - punch: left fist rotates and extends, scales up, returns
     - celebrate: mascot jumps (y: -40px then back), pupils become stars, fists raised
   - Scroll-binding: if `data-mascot-scroll="charge"` attribute, the mascot charges up as the user scrolls through its section
5. Place the mascot in:
   - Hero section (idle, cursor-tracking)
   - Top of subscription band (charging, triggers at 50% scroll through section)
   - On cart drawer (small, celebrates when item added)
   - 404 page (sad variant — add "sad" state, mascot's mouth flips, pupils droop)

Critical: all animations use GSAP, all respect prefers-reduced-motion (in reduce mode, mascot is a static happy idle pose, no animation).

Show me the SVG first. I want to see the mascot before you animate anything.
```

---

## PROMPT 9 — Cart drawer with mascot moment

```
Build a custom cart drawer that replaces Dawn's default.

Layout:
- Slides in from right, 420px wide on desktop, full-width on mobile
- Header: "Ton panier" / "Your cart" + item count, close button
- Items list:
  - Product image (60px)
  - Name + variant
  - Subscription badge if applicable
  - Quantity stepper (- / qty / +)
  - Remove (x)
  - Line total
- Empty state: mascot holding an empty cup, "Ton panier est vide. Charge-toi." with CTA to shop
- Footer:
  - Subtotal
  - "Livraison calculée à la prochaine étape"
  - Free shipping progress bar: "Plus que 8€ pour la livraison offerte!" with progress
  - Checkout button (huge, magnetic, green, mascot punches when clicked)

Interaction:
- Opens on Add to Cart (AJAX — no page reload)
- When an item is added, the mascot in the drawer does a quick celebrate animation (0.6s)
- When the last item is removed, mascot transitions to sad/empty state
- Qty stepper updates in place with AJAX, no reload, with a subtle shimmer on the line while updating

Technical:
- Use Shopify's Cart API via /cart/update.js, /cart/change.js, /cart/add.js
- Optimistic UI: update the DOM immediately, revert if the API fails
- Free shipping threshold: €25 (confirm with client)
- Respect Seal Subscriptions line item properties

Files:
- /sections/volta-cart-drawer.liquid
- /assets/volta-cart.js
- /snippets/volta-cart-line-item.liquid

Include mascot states via data attributes on the drawer's mascot element.
```

---

## PROMPT 10 — Bilingual setup (FR/EN)

```
Wire up full bilingual support.

Shopify has native markets/language support via Shopify Markets. Assume the client has enabled French (default) and English markets in admin.

Tasks:
1. Audit every section file you've built. Every user-facing string must use {{ 'key' | t }}, not hardcoded text.
2. Populate /locales/fr.default.json and /locales/en.json with every string in a nested structure:
   - general.* (nav, footer, buttons)
   - sections.hero.*
   - sections.shot_band.*
   - sections.product_grid.*
   - sections.subscription.*
   - sections.story.*
   - sections.reviews.*
   - product.* (add to cart, subscription toggle, accordions)
   - cart.* (drawer, checkout, empty state)
   - mascot.* (cursor labels, empty state copy)

3. Build a language toggle in the header:
   - Two buttons: "FR" / "EN"
   - Highlights the active language
   - On click, navigates to the equivalent URL in the other language
   - Use {% form 'localization' %} Shopify native pattern — this routes through Shopify's country/language picker
   - Style it minimally: monospace, 11px, uppercase, small underline on active

4. Add hreflang tags in <head>:
   - <link rel="alternate" hreflang="fr" href="..."/>
   - <link rel="alternate" hreflang="en" href="..."/>
   - <link rel="alternate" hreflang="x-default" href="..."/>

5. Metadata translations:
   - SEO title/description per language
   - Open Graph tags per language

Provide French copy first (client is French, the brand is French). I'll give you English copy in a follow-up — use placeholder "[EN: ...]" in en.json for now. 

French copy style: direct, playful, confident. Use "tu" not "vous" (the brand is young and punchy). Examples:
- "Charge ton jus" not "Chargez votre jus"
- "Ton panier est vide" not "Votre panier est vide"
- "Découvre les shots" not "Découvrez les shots"
```

---

## PROMPT 11 — Performance audit & fix

```
Now audit performance against these hard targets:
- LCP < 2.5s on mobile (4G simulated)
- CLS < 0.1
- 60fps during all animations
- First meaningful paint < 1s

Steps:
1. Run `shopify theme check` — fix all errors and warnings
2. Audit /assets/ — flag any asset > 100KB. Images should be WebP/AVIF, not PNG/JPG. Convert critical above-fold images.
3. Check the script load order. CDN scripts (GSAP, Lenis) should load with defer, not block rendering.
4. Every <img> must have explicit width and height attributes to prevent CLS.
5. Google Fonts: preconnect to fonts.gstatic.com, preload the primary font (Bricolage Grotesque 400 + 700), font-display: swap on all.
6. Critical CSS: identify the above-fold CSS and inline it in <head>. Move non-critical CSS to async-loaded external file.
7. Audit /assets/volta-motion.js — any forEach loops that could be bottlenecks on scroll? Convert to requestAnimationFrame-batched updates.
8. Audit mascot SVG — if it has more than 50 paths, it's too complex. Simplify.
9. Check animations: are any animating width, height, top, left, margin, or padding? Flag and refactor to transform + opacity only.
10. Add loading="lazy" to all below-the-fold images, loading="eager" + fetchpriority="high" to hero LCP image.

Run Lighthouse via a local audit if possible, else document which checks you performed manually. Report target vs. actual.

Do not ship without green light on all four targets.
```

---

## PROMPT 12 — Preloader & page transitions

```
Build the signature-moment preloader (first impression).

Preloader spec:
- Full-screen cream background
- Centered mascot, initially dim/deflated
- Counter at bottom: "0% → 100%" (monospace, large)
- As page assets load, mascot progressively charges (pale → neon green, scale 0.8 → 1.0)
- At 100%, mascot does a discharge animation + the preloader wipes away (curtain effect: full-width yellow stripe slides from bottom to top, revealing the site)
- Total duration: minimum 1.5s (even if page loads faster), maximum 3s
- Only shows on first visit (use sessionStorage flag)

Files:
- /snippets/volta-preloader.liquid — HTML shell
- /assets/volta-preloader.js — logic
- Inline critical preloader CSS in <head> so it renders before stylesheets load

Implementation:
1. Mascot is the same SVG as /snippets/volta-mascot.liquid but with different scroll-state
2. Counter is driven by actual asset loading (use Performance API + loaded image count + font loaded events)
3. If assets load in < 1.5s, animate counter smoothly to 100% to fill the min duration
4. After 100%: 400ms discharge, 600ms wipe, 200ms delay, then remove from DOM
5. During preloader, <body> has class .v-loading → prevents scroll, hides the actual content (opacity 0)
6. On preloader exit, .v-loading is removed and the hero's reveal animations cascade

Page transitions (between routes):
- Use the View Transitions API (supported in modern browsers)
- On internal link click: fade out current content (200ms), navigate, fade in new content (200ms)
- Feature-detect and fall back to instant navigation if unsupported
- Don't use Barba.js or Swup — View Transitions API is native and sufficient

Accessibility:
- Skip preloader if prefers-reduced-motion
- Keyboard users can skip with Escape key (hide preloader immediately)
```

---

## PROMPT 13 — Analytics, pixels, and GTM

```
Set up analytics and conversion tracking — this is the conversion-optimization layer.

1. Google Tag Manager:
   - Add GTM container snippet to <head> and <body> start
   - Use Liquid variable {{ settings.gtm_container_id }} so the client can set this in theme settings
   - Create a matching setting in /config/settings_schema.json under "Analytics"

2. Meta Pixel (Facebook/Instagram ads — likely needed for DTC):
   - Shopify has native integration via the Meta sales channel; prefer that over hardcoded pixel
   - But also add a Liquid-level fallback pixel_id setting for redundancy
   - Fire events: PageView, ViewContent (on product), AddToCart, InitiateCheckout, Purchase (via Shopify's checkout.liquid on Plus or via Web Pixels on Basic)

3. Klaviyo:
   - Client will install Klaviyo app from Shopify App Store
   - Add the Klaviyo web tracking snippet to theme.liquid
   - Newsletter signup in footer should POST to Klaviyo API
   - Setting in settings_schema.json for Klaviyo public key

4. Core web vitals reporting:
   - web-vitals library from CDN, report LCP/CLS/INP to GTM dataLayer
   - This gives the client real RUM data in GA4

5. Custom events via dataLayer:
   - volta_add_to_cart (with product_id, price, subscription: true/false)
   - volta_subscription_selected (when user toggles subscription on product page)
   - volta_cursor_engaged (once per session, tracks custom cursor interaction)
   - volta_mascot_clicked (if user clicks the mascot)

Add a brief internal docs file at /docs/ANALYTICS.md explaining each event and which dashboards they should appear in.
```

---

## PROMPT 14 — Launch checklist

```
Final pre-launch checklist. Run through every item. Fix anything that fails.

CONTENT:
[ ] All 4 products created in Shopify admin with: name, description, price, variants, images, tags
[ ] Subscription selling plans configured in Seal for all products
[ ] Mixed Pack SKU set up as subscription-only
[ ] All section text translated to FR (EN pending client copy)
[ ] Legal pages present: CGV, Mentions légales, Politique de confidentialité, Politique de retours
[ ] Footer newsletter tied to Klaviyo list

DESIGN:
[ ] All placeholder colors swapped for final brand hex codes
[ ] All placeholder images swapped for real product photography
[ ] Mascot SVG matches final client-approved illustration
[ ] Favicon + Apple touch icon + OG image set

TECHNICAL:
[ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95
[ ] CLS < 0.1 on all key pages (home, product, cart)
[ ] prefers-reduced-motion respected (test with OS setting enabled)
[ ] Keyboard navigation: every interactive element reachable and visible focus state
[ ] Screen reader: mascot has aria-hidden, cursor has aria-hidden, all images have alt text, nav landmarks present
[ ] All forms validated client-side AND server-side
[ ] 404 page customized with sad mascot + helpful links
[ ] 500 page customized

COMMERCE:
[ ] Test purchase end-to-end: one-time purchase (single, 6-pack, 12-pack)
[ ] Test purchase end-to-end: subscription (monthly, mixed pack)
[ ] Test subscription cancellation flow
[ ] Test subscription modification (swap flavors)
[ ] Cart drawer works on mobile and desktop
[ ] Free shipping threshold correct
[ ] Shipping zones configured for France (and EU if needed)
[ ] Tax settings correct (France TVA 5.5% on food? 20% on beverages? — CLIENT MUST CONFIRM with accountant)
[ ] Payment methods: Carte bancaire, PayPal, Apple Pay, Google Pay

LEGAL:
[ ] Cookie consent banner (required EU/French law — use a Shopify app like Consentmo)
[ ] GDPR-compliant data handling on newsletter signup
[ ] Terms of sale link in checkout
[ ] Right of withdrawal notice (14 days, French law)

MARKETING:
[ ] Google Analytics 4 property created and tracking
[ ] Google Ads conversion tracking set up (if running ads)
[ ] Meta Pixel firing correctly on all events
[ ] Klaviyo flows live: welcome series, abandoned cart, post-purchase
[ ] Organic: sitemap.xml submitted to Google Search Console
[ ] OG images tested via https://www.opengraph.xyz/

POST-LAUNCH (day 1-7):
[ ] Monitor real-user Core Web Vitals via Search Console
[ ] Monitor conversion rate, cart abandonment, subscription opt-in rate
[ ] A/B test subscription discount framing (30% off vs €X savings)
[ ] Collect first 10 real reviews, replace placeholders

Generate a /docs/LAUNCH_CHECKLIST.md file with this list in checkbox form for the client.
```

---

