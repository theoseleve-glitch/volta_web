---
description: Run full quality audit — Shopify, accessibility, performance, translations — via specialized subagents
---

Run a comprehensive quality audit of the theme (or specific files if `$ARGUMENTS` is provided).

## Steps

1. **Define scope.**
   - If `$ARGUMENTS` is empty: audit the whole theme
   - If `$ARGUMENTS` is a path or glob: audit only those files
   - If `$ARGUMENTS` is "launch": run the full pre-launch checklist

2. **Run `shopify theme check`** first and capture output. This is the baseline — any errors here block everything else.

3. **Invoke subagents in parallel** (each runs in its own context, reports back):

   - `shopify-reviewer` — Liquid/schema/convention audit
   - `a11y-auditor` — accessibility audit
   - `perf-auditor` — performance audit
   - `translator-fr-en` — translation coverage and parity check

4. **Aggregate findings into a single report:**

   ```
   # Quality Audit Report
   
   ## Executive summary
   - shopify theme check: [PASS / N errors, N warnings]
   - Shopify review: [N blockers, N warnings, N nits]
   - Accessibility: [N blockers, N warnings]
   - Performance: [current vs. targets — GREEN / YELLOW / RED per metric]
   - Translation: [N missing keys, N TODO placeholders]
   
   ## Blockers (must fix before launch)
   [consolidated list with file:line and fix]
   
   ## Warnings (should fix before launch)
   [consolidated list]
   
   ## Enhancements (post-launch backlog)
   [consolidated list]
   
   ## Verdict
   [READY TO SHIP / NEEDS FIXES / MAJOR WORK NEEDED]
   ```

5. **Save the report** to `/docs/audits/YYYY-MM-DD-audit.md` with today's date. Create the directory if needed.

6. **Ask the user** which blockers to tackle first.

## When to run this

- Before any commit touching > 3 files
- Before pushing to an unpublished theme for client QA
- Before launch (with `$ARGUMENTS` = "launch" for the full ship checklist)
- Weekly during active development as a health check
