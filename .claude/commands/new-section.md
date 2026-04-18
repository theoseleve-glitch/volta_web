---
description: Scaffold a new Shopify section with Liquid, schema, translation keys, and section CSS/JS hooks
---

Create a new Shopify section called `$ARGUMENTS` following the Volta Drinks conventions.

## Steps

1. **Validate the name.** Ensure it starts with `volta-` prefix (our convention to distinguish from Dawn originals) and is kebab-case. If the user gave "hero banner", convert to `volta-hero-banner`.

2. **Create `/sections/$ARGUMENTS.liquid`** with:
   - Liquid section wrapper with unique class `v-section v-section--[name]`
   - Wrapper attributes for our motion system: `data-v-section-id="{{ section.id }}"`
   - Semantic HTML structure (use `<section>`, appropriate heading level)
   - All user-facing strings using `{{ 'sections.[name].[field]' | t }}`
   - `data-v-reveal` attributes on elements that should animate in on scroll
   - Section schema at the bottom with:
     - `"name": "t:sections.[name].name"`
     - At least 2–3 editable settings (heading, body text, CTA, etc.)
     - A `preset` so it appears in Theme Editor
     - `"blocks": [{ "type": "@app" }]` if content could benefit from app blocks

3. **Add translation entries** to:
   - `/locales/fr.default.json` — polished French copy (tu form, punchy)
   - `/locales/en.json` — polished English copy (casual, direct)
   - `/locales/fr.default.schema.json` — schema labels in French
   - `/locales/en.schema.json` — schema labels in English

4. **Add section CSS** to `/assets/volta-section-[name].css` (or append to an existing section stylesheet) using our design tokens from `volta-tokens.css`. Never use hardcoded colors, font sizes, or spacing — always `var(--volta-*)`.

5. **Add section JS** to `/assets/volta-section-[name].js` IF the section has interactivity. Structure:
   - Class-based component scoped by `data-v-section-id`
   - Init function registered with our motion system via `VoltaMotion.register(sectionId, initFn, cleanupFn)`
   - Cleanup function that kills GSAP triggers and removes listeners on `shopify:section:unload`

6. **Show me the diff of all files created/modified** and ask me to review before you save anything.

## Conventions to follow

- Read `.claude/rules/shopify-conventions.md` before starting.
- Read `.claude/rules/motion-and-perf.md` if the section has animations.
- Read `.claude/rules/accessibility.md` for any interactive element.
- Respect the brand voice (tu form French, casual English).

## Output

End with:
- List of files created/modified
- A reminder to run `shopify theme check` before committing
- A suggestion to invoke `shopify-reviewer` subagent to validate the code
