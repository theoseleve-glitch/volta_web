# Accessibility

WCAG 2.1 AA minimum. France also has specific disability accessibility requirements (RGAA — Référentiel Général d'Amélioration de l'Accessibilité), and for e-commerce above certain revenue thresholds, RGAA compliance will become mandatory. Build to WCAG AA from day one to stay ahead of it.

## Non-negotiable rules

1. **Every interactive element is keyboard-navigable.** Tab order follows visual order. No keyboard traps.
2. **Visible focus states.** Never `outline: none` without a replacement focus style. Our focus style: 2px solid `var(--volta-yellow)` with 2px offset.
3. **Color contrast ≥ 4.5:1** for body text, ≥ 3:1 for large text (18pt+) and UI components. Check every color pairing.
4. **All images have meaningful `alt` attributes.** Decorative images: `alt=""`. Never omit the attribute.
5. **Semantic HTML.** `<button>` for actions, `<a>` for navigation, `<h1>`–`<h6>` in hierarchical order, `<nav>` / `<main>` / `<footer>` landmarks.
6. **Form inputs have associated `<label>` elements.** Placeholder text is NOT a label.
7. **ARIA only when HTML isn't enough.** Prefer `<button>` over `<div role="button">`. Prefer `<nav>` over `<div role="navigation">`.

## Reduced motion

Every scroll-driven animation, every hover effect that moves > 8px, every autoplaying loop must have a reduced-motion branch.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

In JS:
```js
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducedMotion) {
  // Skip Lenis, skip ScrollTrigger, skip mascot animations
  return;
}
```

## Focus management

- **Skip-to-content link** at the top of every page, visible on focus: `<a class="skip-to-content" href="#MainContent">Aller au contenu</a>`.
- **Focus trap in modals** (cart drawer, mobile menu): first and last focusable elements loop.
- **Return focus after modal close** to the element that opened it.
- **Don't disable focus-visible.** Use `:focus-visible` to hide focus rings for mouse users, show for keyboard users.

## Cart drawer accessibility

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the drawer title.
- Opening the drawer: move focus to the close button.
- Closing the drawer: return focus to the triggering button.
- Escape key closes the drawer.
- Tab is trapped within the drawer while open.

## Language toggle accessibility

- `<button>` elements (not `<a>` with JS), with `aria-pressed` to indicate active language.
- `aria-label` includes the full language name: `aria-label="Switch to English"`.
- After toggling, announce the language change with an `aria-live="polite"` region.

## Mascot accessibility

The mascot is purely decorative. Hide it from assistive tech:
```html
<div class="v-mascot" aria-hidden="true" role="presentation">
  <!-- SVG here -->
</div>
```

If the mascot ever conveys meaning (e.g., empty cart state), provide a text alternative nearby.

## Custom cursor accessibility

The custom cursor is decorative:
```html
<div class="v-cursor" aria-hidden="true"></div>
```

It must NOT block pointer events from reaching real elements (`pointer-events: none`).

## Keyboard shortcuts

If we add keyboard shortcuts, document them and make them discoverable:
- `?` or `Shift+/`: open shortcut list
- `Escape`: close drawer/modal
- `Tab` / `Shift+Tab`: navigate focusable elements

Never intercept standard browser shortcuts (`Cmd+F`, `Cmd+R`, etc.).

## Screen reader testing

Before marking any feature "done", test with at least one screen reader:
- **macOS / iOS:** VoiceOver (built in)
- **Windows:** NVDA (free) or JAWS
- **Android:** TalkBack

Check:
- Every interactive element is reachable and announces its purpose
- Form errors are announced
- Loading states are announced (`aria-live="polite"` on status regions)
- Modal dialogs are announced when opened

## Automated audit tools

```bash
# Lighthouse Accessibility audit
npx lighthouse https://volta-drinks.myshopify.com --only-categories=accessibility

# axe-core via CLI
npx @axe-core/cli https://volta-drinks.myshopify.com

# Pa11y
npx pa11y https://volta-drinks.myshopify.com
```

Target: Lighthouse Accessibility ≥ 95. axe-core: zero violations on rendered pages.

Automated tools catch ~30% of issues. Manual testing catches the rest.

## Common mistakes

1. Using `<div onclick>` instead of `<button>` → no keyboard access
2. Placeholder text as label → fails screen reader
3. Missing alt text → fails screen reader
4. `outline: none` without focus replacement → keyboard users lost
5. Color-only indicators (red error text with no icon/text) → fails colorblind users
6. Autoplaying video without mute/pause control → fails WCAG 2.1
7. Text in images → untranslatable, unsearchable, unreadable by screen readers
8. Links without discernible text (icon-only with no aria-label) → fails screen reader

## When in doubt

- **If a sighted keyboard-only user can't complete the checkout flow, it's broken.** Test this explicitly before launch.
- **If a screen reader user doesn't know they added an item to cart, it's broken.** Announce cart changes with `aria-live`.
- **If removing all CSS breaks the reading order, the HTML is wrong.** Semantic HTML is the foundation.
