# Volta Drinks — Shopify Theme

Custom Shopify Liquid theme for Volta Drinks, a French premium functional beverage brand.

**Stack:** Shopify Liquid (Dawn-based) · GSAP 3 + ScrollTrigger · Lenis · Seal Subscriptions · Klaviyo · GA4 + Meta Pixel

**Status:** Pre-launch build. See [`docs/BUILD_PLAN.md`](./docs/BUILD_PLAN.md) for current phase.

---

## Quick start

### Prerequisites

- Node.js 20+ (for Shopify CLI and npx tooling)
- Shopify CLI 3.90+: `npm install -g @shopify/cli@latest`
- Git
- Access to the Volta Drinks Shopify admin (ask Théo)
- Claude Code CLI (optional but recommended): https://code.claude.com

### Setup

```bash
# 1. Clone the repo
git clone <repo-url> volta-drinks
cd volta-drinks

# 2. Authenticate with Shopify
shopify auth login

# 3. Copy local settings template
cp .claude/settings.local.json.template .claude/settings.local.json
# Edit .claude/settings.local.json and fill in VOLTA_DEV_THEME_ID

# 4. Pull the current live theme settings (but not the theme code)
shopify theme pull --live --only=config/settings_data.json

# 5. Start the dev server
shopify theme dev --store=volta-drinks.myshopify.com

# 6. (Optional) Install Shopify AI Toolkit for Claude Code live store access
# See: https://shopify.dev/docs/apps/build/ai-toolkit
```

### Install the Shopify AI Toolkit (strongly recommended)

Shipped April 9, 2026. Gives Claude Code live, authenticated access to the Volta Drinks store: products, analytics, theme files, orders. Two commands:

```bash
# Via Claude Code plugin marketplace
claude plugin install @shopify/ai-toolkit

# Then authenticate
claude shopify auth
```

Once installed, Claude Code can directly query the store API and push theme changes without you managing credentials manually.

---

## Project structure

```
.
├── CLAUDE.md                 # Root memory file for Claude Code
├── README.md                 # This file
├── .gitignore
├── .shopifyignore
├── .claude/
│   ├── settings.json         # Project Claude Code settings (committed)
│   ├── settings.local.json   # Local overrides (gitignored)
│   ├── agents/               # Specialized subagents
│   │   ├── shopify-reviewer.md
│   │   ├── motion-engineer.md
│   │   ├── a11y-auditor.md
│   │   ├── translator-fr-en.md
│   │   └── perf-auditor.md
│   ├── commands/             # Custom slash commands
│   │   ├── new-section.md
│   │   ├── audit.md
│   │   ├── translate.md
│   │   ├── ship.md
│   │   └── mascot.md
│   ├── hooks/                # Lifecycle hooks
│   │   ├── format-on-save.sh
│   │   └── verify-before-stop.sh
│   └── rules/                # Detailed rulesets imported via @
│       ├── stack-decisions.md
│       ├── shopify-conventions.md
│       ├── motion-and-perf.md
│       ├── accessibility.md
│       └── gotchas.md
├── docs/                     # Human + agent-facing documentation
│   ├── BUILD_PLAN.md
│   ├── BRAND.md
│   ├── OPEN_QUESTIONS.md
│   └── METAFIELDS.md
├── assets/                   # CSS, JS, images, fonts
├── config/
│   ├── settings_schema.json  # Theme settings schema (committed)
│   └── settings_data.json    # Merchant data (GITIGNORED)
├── layout/
│   └── theme.liquid
├── locales/
│   ├── fr.default.json
│   ├── en.json
│   ├── fr.default.schema.json
│   └── en.schema.json
├── sections/                 # Reusable section blocks
├── snippets/                 # Partials
└── templates/                # OS 2.0 JSON templates
```

---

## Working with Claude Code

This repo is heavily tuned for Claude Code. If you're using it:

1. **Start Claude Code at the repo root** — `cd volta-drinks && claude`. It loads `CLAUDE.md` automatically.

2. **Key commands:**
   - `/new-section <name>` — scaffold a new section
   - `/audit` — run full quality audit via subagents
   - `/audit launch` — run the pre-launch checklist
   - `/translate <file>` — extract hardcoded strings
   - `/ship "<message>"` — pre-commit workflow
   - `/mascot <state>` — work on mascot animation
   - `/memory` — view or edit persistent memory

3. **Delegate to subagents explicitly** when the task is bounded:
   - "Use the `shopify-reviewer` subagent to review the product template"
   - "Use the `perf-auditor` subagent on the homepage"

4. **Read the rules before fighting them.** If something in `.claude/rules/` seems wrong, read the reasoning first — there's usually a decision log explaining why.

---

## Working without Claude Code

Everything here works manually too. The subagent docs in `.claude/agents/` double as checklists for human reviewers. The commands in `.claude/commands/` double as runbooks. The rules in `.claude/rules/` are plain markdown references.

### Manual workflow

```bash
# Before committing
shopify theme check                    # Lint theme
npx lighthouse <url> --preset=perf     # Perf check
npx @axe-core/cli <url>                # A11y check

# Commit with an imperative message
git commit -m "Add sticky header scroll behavior"

# Push to unpublished theme for QA
shopify theme push --unpublished --theme-id=<dev-theme-id>

# After QA, publish via admin (never via CLI)
```

---

## Hard rules (non-negotiable)

These are in `CLAUDE.md` and `.claude/rules/` but worth restating:

1. **Never push directly to the live theme.** Always push to unpublished, QA, then publish via admin.
2. **`shopify theme check` must pass** with zero errors before any commit.
3. **Every user-facing string goes through `{{ 'key' | t }}`** — French and English locale files must stay in parity.
4. **Only animate `transform` and `opacity`.**
5. **Every animation respects `prefers-reduced-motion`.**
6. **`config/settings_data.json` is gitignored.** Never force-commit it.
7. **One logical change per commit. Imperative mood commit messages.**

---

## Performance targets (ship-blockers)

| Metric | Target |
|---|---|
| Lighthouse Performance (mobile) | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| LCP | < 2.5s |
| CLS | < 0.1 |
| Scroll fps | 60 |

---

## Getting help

- **Architectural questions:** read `.claude/rules/stack-decisions.md`
- **Shopify conventions:** `.claude/rules/shopify-conventions.md`
- **Motion / performance:** `.claude/rules/motion-and-perf.md`
- **Accessibility:** `.claude/rules/accessibility.md`
- **Known traps:** `.claude/rules/gotchas.md`
- **Brand voice / colors:** `docs/BRAND.md`
- **Pending client answers:** `docs/OPEN_QUESTIONS.md`

---

## License

Proprietary. © Volta Drinks 2026. All rights reserved.
