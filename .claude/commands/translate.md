---
description: Extract hardcoded user-facing strings from a file, generate translation keys, update FR/EN locales
---

Extract all hardcoded user-facing strings from `$ARGUMENTS` (a file path, or empty to audit the whole theme) and move them into Shopify's translation system.

## Steps

1. **Delegate to `translator-fr-en` subagent** with the scope defined by `$ARGUMENTS`.

2. **Present the subagent's proposed changes** to me:
   - For each hardcoded string: the file:line, the current text, the proposed translation key, and the proposed FR and EN copy.
   - If EN copy is uncertain, the subagent will mark it `[EN: TODO]`. I'll provide final copy separately.

3. **Ask me to approve the batch** before applying any changes.

4. **Apply approved changes:**
   - Add entries to `/locales/fr.default.json` and `/locales/en.json`
   - Replace hardcoded strings in Liquid files with `{{ 'key.path' | t }}`
   - If any strings are in section schema labels, also update `/locales/*.schema.json`

5. **Run `shopify theme check`** to verify no syntax errors introduced.

6. **Report back:**
   - Number of strings extracted
   - Files modified
   - Any TODOs remaining (marked `[EN: TODO]` for me to fill in)

## Brand voice reminders (auto-apply unless I say otherwise)

- French: tu form, punchy, short, imperative for CTAs
- English: casual, confident, American register, contractions OK

## Edge cases

- If a string is a brand name or proper noun ("Volta Drinks", "GSAP"), leave it hardcoded — no translation needed.
- If a string is for accessibility (aria-label, alt text), translate it — these are user-facing for screen reader users.
- If a string contains merge variables ({{ product.title }}), use Shopify's string interpolation: `{{ 'key.path' | t: title: product.title }}`.
