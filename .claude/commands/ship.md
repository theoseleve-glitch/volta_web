---
description: Pre-commit ship workflow — runs checks, creates commit, optionally pushes to unpublished theme
---

Run the pre-commit ship workflow. Commit message will be `$ARGUMENTS` if provided, else I'll ask you.

## Steps

1. **Show git status.** What's changed? Group by category (Liquid sections, CSS, JS, locales, config).

2. **Run blocking checks** in this order, stopping if any fails:
   - `shopify theme check` — must have zero errors
   - Any test suite configured in the repo — must pass
   - Check for `console.log` or `debugger` statements in modified JS — flag if found
   - Check for `TODO` or `FIXME` comments added in this change — flag if found
   - Check for hardcoded FR or EN strings in modified Liquid files — flag if found

3. **If any check fails**, STOP. Report the failures and ask me to fix before shipping.

4. **If checks pass**, optionally invoke `shopify-reviewer` subagent on the changed files for a final code review.

5. **Propose the commit message** in imperative mood, referencing the theme area:
   - Good: "Add sticky header scroll behavior"
   - Good: "Fix quantity input on mobile cart"
   - Good: "Refactor product form into snippet"
   - Bad: "updates" / "wip" / "changes"

6. **Ask me to confirm** the message. If I say yes, commit it.

7. **Ask if I want to push to the unpublished theme** for QA:
   - If yes: `shopify theme push --unpublished --theme-id=<id>`
   - The theme ID should be stored in `.claude/settings.local.json` as `voltaDevThemeId`
   - If not stored, ask me for it and save it

8. **Report:**
   - Commit hash
   - Files changed (count)
   - Preview URL if pushed

## Never do

- Push to the live theme automatically
- Force push
- Amend commits that have been pushed
- Skip `shopify theme check` "just this once"
