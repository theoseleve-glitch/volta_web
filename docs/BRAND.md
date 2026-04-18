# Brand Spec

Reference document for Volta Drinks brand identity. Source of truth for every design and copy decision.

## Brand essence

Volta Drinks is a **playful, charged, premium-accessible** functional beverage brand. A ginger shot that feels like flipping a switch. The brand lives in the collision between serious craft and electric personality.

- **What it is:** a shot, a ritual, a micro-burst of cleanliness and intent
- **What it is not:** a cold supplement, a pharmacy product, a clinical wellness brand

## Voice

### French (primary)

- **Tu form always.** Never vous. The brand is a friend, not a supplier.
- **Short sentences.** Average 8–12 words. Long sentences drain the energy.
- **Active voice, imperative for CTAs.** "Charge ton jus," not "Chargez votre jus" or "Nos jus rechargent votre journée."
- **Playful without being childish.** Wordplay is fine; slang is fine; corporate is not.
- **Confident, never apologetic.** No hedging ("peut-être," "un peu," "essayez").

**Examples:**
- Good: "Un shot. Une montée. Zéro compromis."
- Good: "T'es prêt ? Ouvre, bois, c'est parti."
- Bad: "Découvrez nos délicieuses boissons fonctionnelles énergisantes."
- Bad: "Nous vous proposons une gamme de shots..."

### English (secondary)

- **Casual American register.** Contractions yes; Britishisms no.
- **Same energy as French.** Don't translate literally — rewrite in the same voice.
- **Short, declarative, confident.**

**Examples:**
- Good: "Charge up. One shot. All day."
- Good: "Open. Drink. Done."
- Bad: "Energize yourself with our functional beverages."
- Bad: "Discover our range of premium wellness shots."

## Colors

**Placeholders until client confirms exact hex values.**

| Name | Hex | Usage |
|---|---|---|
| Volta Green | `#4ADE80` | Primary brand color. Mascot, CTAs, accents. Saturated. |
| Volta Green Dim | `rgba(74, 222, 128, 0.5)` | Subdued states, backgrounds behind green text |
| Volta Yellow | `#FDE047` | Neon accent for attention (subscription band, active states) |
| Volta Ink | `#0E0E10` | Near-black for body text and one dark section |
| Volta Cream | `#F7F7F2` | Default off-white background. NEVER pure white. |
| Volta Cream Warm | `#F2EFE5` | Slightly warmer variant for section breaks |
| Volta Shadow | `rgba(14, 14, 16, 0.08)` | Multi-layered shadow base |

**Contrast requirements:**
- Green on cream: fails AA for body text. Use for display only.
- Yellow on cream: fails AA for body text. Use for display only.
- Ink on cream: passes AA (≥ 12:1).
- Cream on ink: passes AA.

## Typography

| Font | Role | Weights | Source |
|---|---|---|---|
| Bricolage Grotesque | Display, hero, section headings | 400, 700 | Google Fonts |
| Inter | Body, UI, buttons | 400, 500, 600 | Google Fonts |
| JetBrains Mono | Labels, eyebrows, price tickers, accents | 400, 500 | Google Fonts |

**Type scale** (fluid, clamp-based — see `/assets/volta-tokens.css`):

- Hero: `clamp(56px, 9vw, 160px)` — the "CHARGE UP" moment, fills viewport
- Display (section titles): `clamp(36px, 3.5vw, 56px)`
- H1 product: `clamp(28px, 2.4vw, 40px)`
- H2: `clamp(22px, 1.8vw, 28px)`
- H3: `clamp(18px, 1.3vw, 22px)`
- Body: `clamp(15px, 1vw, 17px)`
- Small: `clamp(13px, 0.85vw, 14px)`
- Labels/eyebrows: `clamp(11px, 0.7vw, 12px)` — usually mono, uppercase, tracked 2–4pt

**Line heights:**
- Display/hero: 1.05 to 1.1
- Headings: 1.15 to 1.25
- Body: 1.55 to 1.7

## The mascot

The green lightning bolt character IS the brand. It's the signature moment, the conversion differentiator, and the visual anchor that separates Volta Drinks from the US competitor (drinkvolta.com) who has no mascot.

### Physical description

A cartoon lightning bolt with:
- An expressive face (two round eyes with tracking pupils, a simple smile)
- Two small fists (left and right)
- A single zigzag body shape
- Colored in `--volta-green` by default

### Animation states

| State | When | Description |
|---|---|---|
| `idle` | Default (hero, nav areas) | Gentle breathing (scale 1.0↔1.02, 3s loop), pupils track cursor at 3px max radius |
| `charging` | Scroll through subscription band | Pupils glow yellow, subtle vibration, color saturates |
| `discharge` | Section transition triggers | Quick flash + scale pulse (0.4s) |
| `punch` | Add to Cart click | Left fist extends + rotates, returns (0.5s) |
| `celebrate` | Checkout success, order confirmation | Jump + star pupils + fists up (0.8s) |
| `sad` | Empty cart, 404 | Mouth flips, pupils droop, slight deflation (static) |

### Mascot usage rules

- Mascot appears in: hero, subscription band, cart drawer, 404 page, order confirmation
- Mascot does NOT appear in: product cards (keep product-focused), checkout, footer (keep clean)
- Mascot is inline SVG, never `<img>`, because we animate its children
- Mascot is `aria-hidden="true"` — purely decorative for assistive tech
- Mascot pauses animations when offscreen (ScrollTrigger onEnter/onLeave)

## Voice matrix (by surface)

| Surface | Tone | Length | Example (FR) |
|---|---|---|---|
| Hero headline | Bold, imperative | 2–4 words | "Charge ton jus" |
| Hero subhead | Descriptive, punchy | 8–12 words | "Shots fonctionnels. 100% naturel. 0% compromis." |
| CTA buttons | Imperative verb | 1–3 words | "Découvrir" / "J'abonne" |
| Product names | Noun + adjective or evocative | 1–3 words | "Gingembre Éclair" |
| Product descriptions | Sensory + functional | 20–40 words | "Un shot vif, net, direct. Gingembre frais, citron, ananas." |
| Trust badges | Short, definite | 2–4 words | "Livraison 48h" / "Made in France" |
| Empty states | Friendly, playful | 5–10 words | "Ton panier est vide. Charge-toi." |
| Error messages | Direct, actionable | 5–15 words | "Oups. Réessaie dans quelques secondes." |
| Email subjects | Curiosity + value | 4–7 words | "Ton shot t'attend. (Et -30%.)" |

## Tone boundaries

- **Never use medical claims.** "Boosts immunity" / "renforce les défenses" are regulated health claims. Stick to sensory ("vif," "intense," "frais") and ritual ("rituel," "routine," "quotidien").
- **Never hedge.** The brand is confident. Drop "peut-être," "probablement," "essayez."
- **Never sound like a supplement.** No lab imagery, no dosage language, no "x% absorption."
- **Never sound like a supermarket juice.** No "artisanal," "grand-mère," "terroir" clichés.
- **Humor is OK** when it's quick and confident. Not OK when it's self-deprecating or apologetic.

## Visual grammar

- Backgrounds are cream or ink. Never pure white or pure black.
- Accents are green and yellow. Never three colors at once in the same composition.
- Photography is saturated, close-up, product-focused. Lifestyle shots exist but don't dominate.
- Illustrations use the mascot or mascot-adjacent elements (electricity, charge icons, bottle silhouettes).
- Layouts break the grid deliberately — one element per section overlaps, bleeds, or sits off-center.
- Whitespace is generous. Minimum 120px vertical padding between major sections.

## When in doubt

- **Ask:** does this sound like something the mascot would say?
- If yes, it's on-brand.
- If it sounds like a press release or a pharmacist, rewrite.
