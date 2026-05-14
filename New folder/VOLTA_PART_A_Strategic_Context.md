# Volta Drinks — Part A: Strategic Context

**For:** Théo (internal reference)
**Prepared:** April 2026
**Purpose:** Locked strategic decisions that orient every other decision in the build. Read first.

---

# PART A — STRATEGIC CONTEXT

## Stack decision (locked)

**Shopify Liquid (Dawn theme as base) + GSAP + Lenis + custom sections.** Not Hydrogen.

Why:
- Hydrogen costs 3-5× more to build, requires ongoing JS engineering capacity, and breaks compatibility with most of the Shopify app ecosystem — including every subscription app that matters.
- A well-built Liquid theme hits Lighthouse ~90 mobile out of the box; Hydrogen might hit 95-99 but at the cost of weeks of extra work that pre-revenue doesn't justify.
- Subscription apps, reviews, email capture, FAIRE integration, analytics — all assume Liquid. Going headless means rebuilding integrations by hand.
- Awwwards-level motion is achievable in Liquid. GSAP + Lenis don't care what templating language generates the HTML. The site will feel like a headless site because the motion layer IS custom.
- You're shipping fast; Liquid ships fast.

Revisit when: revenue > €500k/year, or the brand needs content-heavy editorial features Shopify can't handle.

## Subscription app decision (locked)

**Seal Subscriptions** for launch.

Why:
- Free plan, 0% transaction fees until meaningful scale. Recharge charges $99/mo + transaction fees from subscriber #50; the math is hostile for a pre-revenue brand.
- Honest recommendation from multiple 2026 reviews: start on Seal, migrate to Recharge at $15-20k/mo subscription revenue.
- Seal injects frontend widgets that work natively in Liquid themes — no custom API work required.
- Passwordless customer portal, mixed subscriptions in cart (needed for the "mixed pack" SKU), native Shopify checkout.

Revisit when: subscription MRR > €15k AND churn/retention analytics become the bottleneck. Then migrate to Recharge or Skio.

## Brand direction (locked from your answers)

- **Playful/mascot** (green lightning bolt with face, "VOLTA DRINKS" arc)
- **Full Awwwards-level motion** — GSAP, Lenis, signature moment, flex-piece
- **Conversion-optimized** — every motion serves selling, not just art

The tension here is real and has to be resolved by design: **the mascot IS the signature moment.** Not a separate WebGL art piece layered on top. The lightning bolt character does something unexpected on scroll — charges up, reacts to the cursor, throws a punch when you hit "buy," zips across the viewport between sections. This is the flex. This is what makes it shareable.

If the mascot stays as a static PNG, the site becomes either (a) a generic playful e-commerce site or (b) an Awwwards site with a mismatched logo. The mascot has to move.

## Colors (placeholder, per your direction)

- **Primary:** Neon green (pull from existing logo — get exact hex from client)
- **Neutral:** Off-white background `#F7F7F2` (NOT pure white — pure white kills the playful feel)
- **Accent:** Neon yellow (placeholder, works well against green for high-contrast CTAs)
- **Depth:** Near-black `#0E0E10` for text and one section

The palette is aggressive on purpose — playful brands in saturated categories win by being loud, not subtle. Confirm with client before launch.

## Content assumptions

- 3-4 SKUs at launch (flavors TBD — placeholder: Ginger Classic, Citrus Storm, Tropical Jolt, Deep Root)
- Single / 6-pack / 12-pack / Mixed pack (subscription only)
- **€3/unit, €15/6-pack** (per your direction)
- Implied: 12-pack ~€28 (slight volume discount), Mixed pack (subscription) ~€30/month for 12
- 30% subscription discount confirmed
- Monthly cadence only at launch (add weekly/bi-weekly later if demand)

## The signature moment concept

Working title: **"CHARGE UP"**

When you land on the site, the mascot is dim, slightly deflated, floating center-screen. As you scroll, he charges — eyes brighten, color saturates from pale green to neon, he starts jittering slightly with electrical energy. At the midpoint of the page he releases a lightning burst that triggers the product reveal section. On product pages he punches the air when "Add to Cart" is clicked. On checkout success, he does a full celebration animation.

This is achievable with **Lottie** (free, After Effects-to-JSON animation format) + GSAP for scroll-binding. You don't need WebGL. You don't need Three.js. You need one good Lottie file of the mascot in multiple states.

**Asset option if client won't pay for illustrator/animator:** I'll include a prompt later for generating an animated SVG version directly in code as a free fallback. It won't be as polished as Lottie but it'll work.

---

