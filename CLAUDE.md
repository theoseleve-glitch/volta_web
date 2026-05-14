# Volta Drinks — Project Memory

This is a Shopify Liquid theme project for **Volta Drinks**, a French premium functional beverage brand (ginger-based wellness shots). The site is B2C, bilingual FR/EN, subscription-enabled via Seal, and targets Awwwards-level motion quality with conversion optimization as the primary metric.

**Current phase:** Pre-launch build. Building custom theme from Dawn base.

---

## Quick orientation

- **Platform:** Shopify (Liquid, NOT Hydrogen — see @.claude/rules/stack-decisions.md for why)
- **Base theme:** Dawn (Shopify reference theme, OS 2.0 JSON templates)
- **Motion stack:** GSAP 3 + ScrollTrigger + Lenis (all via CDN, no npm)
- **Subscriptions:** Seal Subscriptions app (Liquid-native widgets)
- **Languages:** French (default), English (secondary) via Shopify Markets + locale files
- **Deploy:** `shopify theme push --unpublished` then promote after QA — NEVER push to live directly

For the full decision log including rejected alternatives, see @.claude/rules/stack-decisions.md.
For the build sequence, see @docs/BUILD_PLAN.md.
For the brand spec, see @docs/BRAND.md.

---

## Core working rules

These apply everywhere, always. Do not deviate without explicit user approval.

1. **Read before writing.** Run `view` or `ls` on the directory before creating files. Shopify themes have a rigid structure — misplaced files break the Theme Editor silently.
2. **One logical change per commit.** No catch-all commits. Commit messages use imperative mood: "Add sticky header" not "Added sticky header".
3. **`shopify theme check` before every commit.** Resolve all errors. Warnings are errors for new code.
4. **All user-facing strings go through `{{ 'key' | t }}`** — never hardcode FR or EN text. Every string lives in `/locales/fr.default.json` or `/locales/en.json`.
5. **Never modify `config/settings_data.json`** — it contains live merchant customizations. It's in `.gitignore`.
6. **Animate only `transform` and `opacity`.** Never animate width, height, top, left, margin, padding. This is a performance hard rule.
7. **Every `<img>` has explicit width and height attributes.** Prevents CLS.
8. **All scroll animations respect `prefers-reduced-motion`.** Non-negotiable for accessibility.

### Token efficiency rules (avoid wasting context)

Learned the hard way during the V1 build. Do not break these:

9. **Never re-Read files already shown in this turn's system reminders.** If the harness surfaces a file's contents, use that — don't Read it again "to be safe."
10. **For large files already flagged "too large to include" (e.g. `preview/v1.css`, `preview/index.html`):** use `Grep` with specific patterns to locate line numbers, then `Read` only the needed range with `offset`/`limit`. Never Read 900+ lines to find one block.
11. **Prefer `Edit` over `Write` on existing files.** Edits only send the diff; Write resends the entire file.
12. **Batch independent tool calls in one message.** Multiple Edits across different files, or Grep + Read for different scopes, go in parallel — not sequential turns.
13. **Don't spawn subagents for visual QA when the user has the preview open.** They'll guess at issues; the user can just tell me what's broken.
14. **Skip status-reporting MCP calls** (`swarm_status`, `token_usage`, etc.) unless explicitly asked — they spend tokens reporting on tokens.
15. **Don't re-read a file you just edited to "verify".** Edit errors if the match fails; the harness tracks state.

For the full Shopify convention set, see @.claude/rules/shopify-conventions.md.
For the motion/performance rules, see @.claude/rules/motion-and-perf.md.
For the accessibility baseline, see @.claude/rules/accessibility.md.

---

## How I work with you

- **Ask before doing large refactors.** Small edits: just do them. Touching >5 files or replacing an established pattern: propose a plan first.
- **When you hit ambiguity, ask ONE focused question.** Don't ask three at once.
- **If a requirement conflicts with a rule in `.claude/rules/`, flag the conflict — don't silently resolve it.**
- **Prefer deleting code over commenting it out.** Git is the archive.
- **Never say "done" until `shopify theme check` passes and the feature works end-to-end in the dev preview.**

---

## Commands I use often

```bash
# Dev preview (run once at session start, leave running in another terminal)
shopify theme dev --store=volta-drinks.myshopify.com

# Validate theme
shopify theme check

# Push to unpublished theme for QA
shopify theme push --unpublished --json
```

For custom slash commands I've defined, see `.claude/commands/`. Key ones:
- `/new-section <name>` — scaffolds a new section with Liquid + schema + translations
- `/audit` — runs theme-check + lighthouse-style heuristics
- `/translate <key>` — finds all hardcoded strings in a file and proposes translation keys

---

## Subagents available

I've defined specialized agents in `.claude/agents/`. Invoke them for focused tasks to keep my main context clean:

- **`shopify-reviewer`** — reviews Liquid code for Shopify-specific bugs, deprecated tags, schema errors. Use after any section or snippet change.
- **`motion-engineer`** — designs and implements GSAP/Lenis animations with performance audit built in.
- **`a11y-auditor`** — checks accessibility (WCAG AA, reduced-motion, keyboard nav, screen reader). Use before marking anything "done".
- **`translator-fr-en`** — extracts hardcoded strings, generates FR/EN locale entries, checks parity.
- **`perf-auditor`** — runs performance analysis on a file or the whole theme against hard targets.

Delegate to these rather than doing everything in the main thread. Their context stays clean and they report back summaries.

---

## Hard targets (non-negotiable, ship-blockers)

- Lighthouse mobile Performance ≥ 90
- Lighthouse mobile Accessibility ≥ 95
- CLS < 0.1 on home, product, cart
- LCP < 2.5s on mobile 4G
- 60fps during all scroll animations on a mid-range laptop
- `shopify theme check` clean (zero errors, zero warnings on new code)
- All sections work in Theme Editor (add, remove, reorder without JS errors)
- All user-facing copy translated to FR and EN

If any of these regress, fix before moving on. Do not accumulate debt.

---

## Current known gotchas

- **Seal Subscriptions widget injects ugly default UI.** We're building a custom `volta-subscription-toggle` snippet and hiding Seal's default. Don't let Seal's markup leak.
- **Dawn's default cart drawer has been replaced** with `volta-cart-drawer`. Don't reintroduce `cart-drawer.liquid`.
- **Lenis conflicts with Shopify's Theme Editor preview** — we disable Lenis when `window.Shopify.designMode` is true.
- **Mascot SVG is inline, not referenced as `<img>`** — this is required for GSAP to animate its children.

When I discover new gotchas during sessions, I'll add them to @.claude/rules/gotchas.md.

---

## Auto-memory

I (Claude Code) will save notes to auto-memory as I learn things about this project. You can view and prune them via `/memory`. Do not disable auto-memory — it's doing useful work.

---

For the full set of questions still pending with the client (pricing, trademarks, assets), see @docs/OPEN_QUESTIONS.md.
