# Open Questions

Questions pending client answer. Each has a blocking phase in `/docs/BUILD_PLAN.md`. Answer unblocks work.

**Legend:** `🔴` blocks launch · `🟡` blocks a specific phase · `🟢` nice-to-have

---

## Brand & identity

- 🔴 **Exact green hex code from logo file?** Placeholder: `#4ADE80`. Blocks Phase 1 (design tokens).
- 🔴 **Is the current mascot final or to be refined?** Options: keep as-is / illustrator refinement (€500–2000) / AI-generated variants. Blocks Phase 3 (mascot animation polish).
- 🟡 **Final tagline?** Placeholder: "Charge ton jus" / "Charge up." Need client approval or 3 alternatives.
- 🟢 **Brand guidelines document exists?** If yes, send it — it supersedes `/docs/BRAND.md` placeholders.

## Product line

- 🔴 **Final flavor lineup with ingredients?** Placeholders: Ginger Classic, Citrus Storm, Tropical Jolt, Deep Root. Blocks Phase 2 (product pages).
- 🔴 **Final prices?** Confirmed: €3/unit, €15/6-pack. Need: 12-pack price, mixed subscription pack price.
- 🟡 **What's in the Mixed Pack?** 12 shots assumed. 3 of each flavor if 4 flavors? Customer-chosen mix vs. curated?
- 🟡 **Free shipping threshold?** Placeholder: €25. Depends on margin math.
- 🔴 **Shelf life at room temperature?** Critical for subscription model (30-day pack).

## Subscription mechanics

- 🟡 **Cadence options?** Monthly confirmed. Add bi-weekly?
- 🟡 **Discount scope?** -30% confirmed. Applies to: single / all packs / Mixed Pack only?
- 🟡 **Cancel/pause/skip rules?** Default proposed: cancel anytime, skip anytime, swap flavors, pause up to 3 months. Confirm.

## Operations

- 🔴 **Fulfillment address / origin of shipments?**
- 🟡 **In-house fulfillment or 3PL?** Affects the "48h livraison" claim on site.
- 🔴 **Carrier(s)?** Colissimo, Chronopost, DHL?
- 🟡 **Shelf life + cold chain requirements?** Determines packaging claims and B2B feasibility.

## Legal & compliance

- 🔴 **Trademark status?** Has client filed at EUIPO for "VOLTA DRINKS"? If not, file before launch. See separate risk PDF for full analysis.
- 🔴 **HACCP audit done?** Required for beverage production in France.
- 🔴 **Legal documents ready?** CGV, mentions légales, politique de confidentialité, politique de retours. Should be lawyer-reviewed, not ChatGPT.
- 🔴 **Allowed health claims?** Must be vetted against EU Reg 1924/2006 before going live. Safer to stick with sensory language.
- 🔴 **Allergen declarations?** EU Reg 1169/2011 — must appear on every product page.

## Marketing & data

- 🟡 **Instagram / TikTok handles for footer?**
- 🟡 **Klaviyo (or other ESP) account created?**
- 🟡 **Meta Pixel ID?** Needed for Phase 5 pixel setup.
- 🟡 **GTM container ID?** Needed for Phase 5 analytics.
- 🟢 **Existing waitlist / pre-launch customers?** If yes, build a founding-customers launch flow.
- 🟡 **Review app preference?** Default: Judge.me. Confirm.

## Design references

- 🟢 **5 websites the client loves (not competitors)?** Informs motion and tone.
- 🟢 **5 websites the client hates?** Equally informative.

## Assets

- 🔴 **Product photography status?** iPhone photos mentioned. Need: professional shoot OR high-quality AI-generated (nano banana).
- 🟡 **Lifestyle photography status?** TBD per client.
- 🟡 **Video content?** TBD. Nice-to-have for hero.
- 🔴 **Final FR copy for "Notre Histoire" section?** Placeholder content can't ship.
- 🔴 **Final EN copy for all pages?** Placeholders in `en.json` are `[EN: TODO]`.

## Build logistics

- 🔴 **Launch target date?** Sets the pace and determines v1 cuts.
- 🟡 **Budget for paid assets?** Lottie mascot (€300–800), product shoot (€500–1500), stock audio (€50–100).

---

## Status log

Update as answers come in. Remove items from the list as they're answered.

- [ ] None yet.

---

## When all 🔴 questions are answered

- Swap all placeholders in code
- Update `/docs/BRAND.md` with final values
- Run `/audit launch` — this runs the full pre-launch checklist
- Proceed to Phase 5 Step 14
