# Build Plan

Sequenced build plan for Volta Drinks. Each step is a milestone. Do not skip ahead — each assumes the previous is complete.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Phase 1 — Foundation (weeks 1–2)

### Step 1 — Theme audit & orientation `[ ]`
- Clone Dawn, read its structure
- Map what we modify heavily, modify lightly, leave alone
- Produce `/docs/THEME_AUDIT.md`
- **Deliverable:** orientation doc committed

### Step 2 — Design system foundation `[ ]`
- `/assets/volta-tokens.css` with colors, typography, spacing, motion tokens
- Google Fonts (Bricolage Grotesque, Inter, JetBrains Mono) loaded via preconnect + preload
- Global resets: body bg `--volta-cream`, scroll-behavior auto
- Noise overlay via SVG data URL at 3% opacity
- Selection color
- **Deliverable:** tokens file live, hero page renders with correct fonts/colors

### Step 3 — Motion foundation (GSAP + Lenis) `[ ]`
- CDN scripts loaded in theme.liquid with defer
- `/assets/volta-motion.js` with Lenis init, GSAP sync, `window.VoltaMotion` helpers
- `prefers-reduced-motion` guard
- Design-mode guard (`window.Shopify?.designMode`)
- Auto-init of `.v-reveal`, `.v-magnetic`, `.v-parallax` classes
- **Deliverable:** homepage scrolls smoothly, reveal classes animate

### Step 4 — Custom cursor `[ ]`
- `/snippets/volta-cursor.liquid` with HTML shell
- CSS for dot + ring + label states (hover, view, drag)
- JS with GSAP quickTo for smooth follow
- Touch detection — hide on touch devices
- data-cursor attributes applied to links, buttons, images
- **Deliverable:** cursor follows smoothly on desktop, invisible on touch

---

## Phase 2 — Structure (weeks 2–3)

### Step 5 — Homepage sections `[ ]`
Build these sections, in order, each with schema + translations:
- `volta-hero.liquid` — 100vh banner with mascot placeholder
- `volta-shot-band.liquid` — green explainer band
- `volta-products.liquid` — asymmetric product grid
- `volta-subscription.liquid` — yellow subscription band
- `volta-story.liquid` — horizontal scroll story
- `volta-reviews.liquid` — marquee testimonials
- Header with sticky scroll behavior + language toggle
- Footer with newsletter
- **Deliverable:** homepage renders end-to-end with placeholder content

### Step 6 — Product template `[ ]`
- 50/50 split layout: sticky media left, scrolling info right
- Scroll-scrubbed hero image (scale + rotation)
- Variant selector (pack size)
- Subscription toggle (placeholder for Seal integration in Step 7)
- Quantity selector
- Magnetic Add to Cart button
- Trust bar (Livraison 48h / Sans sucre / Vegan / Made in France)
- Accordion sections (ingredients, nutrition, etc.)
- Below-fold: hero ingredient, benefits, process, related products
- Mobile: stack layout, no sticky
- **Deliverable:** product page functional for one-time purchase

---

## Phase 3 — Commerce (week 3–4)

### Step 7 — Seal Subscriptions integration `[ ]`
- Read Seal's exposed Liquid tags
- Build `/snippets/volta-subscription-toggle.liquid`
- Hide Seal's default widget with CSS
- Wire up selling plan ID to Add to Cart
- Handle Mixed Pack as subscription-only
- **Deliverable:** can subscribe to a product end-to-end

### Step 8 — Mascot animation system `[ ]`
- Hand-code SVG mascot with labeled parts
- `/snippets/volta-mascot.liquid`
- `/assets/volta-mascot.js` with VoltaMascot class
- States: idle, charging, discharge, punch, celebrate, sad
- Scroll-binding via ScrollTrigger
- Place mascot in hero, subscription band, cart drawer, 404
- Respect reduced-motion
- **Deliverable:** mascot animates on scroll, punches on Add to Cart, celebrates in cart drawer

### Step 9 — Cart drawer `[ ]`
- Slide in from right, 420px wide / full-width mobile
- Empty state with sad mascot
- Line items with qty stepper, remove, subscription badge
- Free shipping progress bar
- Magnetic checkout button with mascot punch
- AJAX Cart API (no page reloads)
- Focus trap, Escape to close
- **Deliverable:** complete add-to-cart → drawer → checkout flow

---

## Phase 4 — Polish (week 4–5)

### Step 10 — Bilingual setup `[ ]`
- Audit every string in the theme
- Populate `/locales/fr.default.json` and `/locales/en.json`
- Language toggle in header (native Shopify Markets)
- hreflang tags per page
- SEO metadata per language
- **Deliverable:** full FR/EN parity, toggle switches language cleanly

### Step 11 — Performance audit & optimization `[ ]`
- Run `perf-auditor` subagent
- Convert images to WebP, set explicit dimensions
- Defer CDN scripts
- Inline critical CSS
- Preload LCP image + primary font
- Lighthouse mobile ≥ 90
- **Deliverable:** all hard performance targets met

### Step 12 — Preloader & page transitions `[ ]`
- Custom preloader with mascot charging animation
- Asset-loading-driven counter
- Wipe exit effect
- Session storage flag (first visit only)
- View Transitions API for page-to-page
- Reduced-motion + keyboard skip
- **Deliverable:** signature first-impression moment

---

## Phase 5 — Launch (week 5–6)

### Step 13 — Analytics & pixels `[ ]`
- GTM container in theme settings
- Meta Pixel (via Shopify native + Liquid fallback)
- Klaviyo web tracking + newsletter form
- web-vitals reporting to dataLayer
- Custom events: add_to_cart, subscription_selected, cursor_engaged, mascot_clicked
- `/docs/ANALYTICS.md` event reference
- **Deliverable:** all tracking live, verified in GA4 debug view

### Step 14 — Launch checklist `[ ]`
Full pre-launch checklist (see `/docs/LAUNCH_CHECKLIST.md`):
- All products + selling plans in admin
- All legal pages (CGV, mentions, confidentialité, retours)
- Lighthouse mobile ≥ 90 on home, product, cart
- CLS < 0.1 on all key pages
- Test purchases: one-time (1, 6, 12) + subscription + mixed pack
- Cookie consent active
- Shipping zones + tax configured
- Klaviyo flows live (welcome, abandoned cart, post-purchase)
- Meta Pixel firing all events
- 404 + 500 pages customized
- **Deliverable:** ready to publish

---

## Client-dependent unblocks

Some steps are blocked on client answers (see `/docs/OPEN_QUESTIONS.md`):

- Final brand green hex → Step 2
- Final flavor names and prices → Step 5, Step 6
- Final mascot asset (Lottie or refined SVG) → Step 8
- Final product photography → Step 5, Step 6
- EN copy → Step 10
- Legal documents → Step 14
- Meta Pixel ID, Klaviyo key, GTM container ID → Step 13
- Trademark status (EUIPO) → Step 14 (go/no-go for public launch)

Do not block on these — build with placeholders, swap at the end of each relevant phase.

---

**When starting work on a step:** update status to `[~]`, open a feature branch, commit to that branch, run `/audit` before merging to main.

**When completing a step:** update status to `[x]`, note the completion date, tag the main branch.
