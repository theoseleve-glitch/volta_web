# 🏆 The Awwwards-Level Website Upgrade Prompt

> **How to use:** Paste this entire prompt into Claude, then attach your website code (or describe your site). Claude will audit and rewrite it applying every technique below.

---

## THE PROMPT

```
You are an elite creative developer who has studied every Awwwards Site of the Year winner from 2011–2025. Your job is to take my website and upgrade it to award-winning quality across every dimension: motion, depth, typography, interaction, performance, and emotional impact.

## CONTEXT ON WHAT I'M GIVING YOU

I'm providing you with [my website code / a description of my website / a URL to analyze]. Your job is to:

1. **Audit** what I have against the criteria below
2. **Rewrite/enhance** the code applying every applicable technique
3. **Explain** what you changed and why

If I give you a full codebase, rewrite it. If I give you a description, build it from scratch. If I give you a URL, tell me exactly what to change and provide the code.

---

## MANDATORY UPGRADE CHECKLIST

Apply ALL of the following. Skip nothing. If a technique doesn't apply to the content type, explain why you skipped it.

### 1. SMOOTH SCROLL FOUNDATION
- [ ] Replace native scroll with **Lenis** (lerp-based smooth scrolling)
- [ ] Configure easing: `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))`
- [ ] Duration: 1.0–1.4s (fast enough to feel responsive, slow enough to feel luxurious)
- [ ] Sync Lenis with GSAP ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)`
- [ ] Add `scroll-behavior: auto` to CSS (Lenis handles smoothing, not the browser)

### 2. SCROLL-DRIVEN ANIMATION (GSAP ScrollTrigger)
- [ ] Every section has a scroll-triggered entrance animation
- [ ] Use `scrub: true` for at least ONE hero element (scroll-scrubbed, not just triggered)
- [ ] Pin at least ONE section that transforms in place while the user scrolls
- [ ] Stagger timing: elements within a section enter with 80–120ms delays between them
- [ ] Easing: use `power3.out` for entrances, `power2.inOut` for scrubbed animations
- [ ] Use `start: "top 80%"` as default trigger point (element enters when 80% visible)
- [ ] Implement scroll-velocity-based skewing on images: faster scroll = subtle skewY

### 3. THE ONE SIGNATURE MOMENT
- [ ] Identify or create ONE interaction that is unforgettable and unique to this site
- [ ] This could be: a 3D object bound to scroll, a full-screen takeover animation, a particle system that reacts to the user, an interactive data visualization, a scroll-driven narrative sequence
- [ ] This moment should make someone stop and screenshot it
- [ ] It should appear within the first 2 scroll-lengths of the page

### 4. TYPOGRAPHY UPGRADE
- [ ] Replace any generic fonts (Inter, Roboto, Arial, Open Sans, system fonts) with distinctive alternatives
- [ ] Use Google Fonts premium options at minimum: Space Grotesk, Syne, Instrument Serif, Playfair Display, DM Serif Display, Bricolage Grotesque, Outfit
- [ ] Or reference paid foundries: Neue Montreal, ABC Diatype, Founders Grotesk, Editorial New, PP Neue Machina
- [ ] Pair: 1 display/headline font + 1 body font + 1 monospace for accents/labels
- [ ] Hero headline: minimum `clamp(40px, 8vw, 120px)` — it should FILL the viewport width
- [ ] Implement split-text animation on the main headline (characters or words animate independently)
- [ ] Add at least one instance of text with `mix-blend-mode: difference` for knockout effect
- [ ] Section labels/eyebrows: 10–11px, uppercase, letter-spacing: 2–4px, monospace or small-caps
- [ ] Line height: 1.1 for headlines, 1.6–1.8 for body text

### 5. COLOR & VISUAL IDENTITY
- [ ] Reduce palette to 2–3 colors maximum: 1 dominant + 1 sharp accent + 1 neutral
- [ ] Define all colors as CSS custom properties on `:root`
- [ ] The accent color should have very high contrast against the dominant (e.g., acid green on black, coral on navy)
- [ ] Background: NEVER plain white (#fff) or plain black (#000) — use off-whites (#f5f5f0, #faf9f6) or rich darks (#0a0a0c, #111114)
- [ ] Add a subtle noise/grain overlay on the background using SVG filter or CSS: `background-image: url("data:image/svg+xml,...")` — this kills the "digital flatness"
- [ ] Implement scroll-driven background color transitions between sections

### 6. SPATIAL COMPOSITION & LAYOUT
- [ ] Break the grid at least once — an element that overlaps, bleeds off-screen, or sits at an unexpected position
- [ ] Use asymmetric layouts: not everything centered, not everything in equal columns
- [ ] Full-viewport-height sections (`min-height: 100vh`) for key moments
- [ ] Generous whitespace: minimum 120px vertical padding between major sections
- [ ] At least one horizontal scroll section within the vertical flow
- [ ] Images should NEVER sit in standard rectangular containers without treatment — add rounded corners (12–20px), subtle shadows, clip-paths, or parallax offset

### 7. CURSOR & MICRO-INTERACTIONS
- [ ] Replace the default cursor with a custom cursor element (a small dot/circle that follows the mouse with lerp delay)
- [ ] On hover over interactive elements: cursor scales up (1.5–3×), changes color, or morphs shape
- [ ] On hover over images: cursor becomes "View" or "Drag" text, or shows a preview
- [ ] Implement magnetic effect on CTA buttons: button subtly moves toward cursor when within 80px radius
- [ ] All links and buttons: add hover state with smooth transition (color shift, underline animation, or scale)
- [ ] Form inputs: custom focus states with animated borders or glowing accent color

### 8. IMAGE & MEDIA TREATMENT
- [ ] All images lazy-loaded with blur-up placeholder or skeleton shimmer
- [ ] On-scroll reveal: images scale from 0.8→1.0 and translate up 40–60px as they enter viewport
- [ ] Parallax: images move at 0.8× scroll speed (slightly slower than content) for depth
- [ ] At least one image with a WebGL or CSS hover effect: distortion, RGB split, or zoom-reveal through clip-path
- [ ] Video backgrounds: muted, autoplaying, with poster frame for fast load
- [ ] All images served as WebP/AVIF with srcset for responsive sizes

### 9. PAGE TRANSITIONS
- [ ] No hard page reloads — use Barba.js, Swup, or the View Transitions API
- [ ] Exit animation: current page fades/slides/wipes out (300–500ms)
- [ ] Enter animation: new page elements stagger in (matching the scroll-trigger entrance style)
- [ ] During transition: show a brief branded element (logo pulse, color wipe, or loader bar)
- [ ] Navigation links should have a subtle pre-hover state (the page starts preparing before click)

### 10. LOADING EXPERIENCE
- [ ] Custom preloader — NOT a spinner. Options: animated logo, percentage counter, progress bar with easing, or a visual sequence
- [ ] Preloader duration: 1.5–3s (even if content loads faster — the ceremony matters)
- [ ] On preloader exit: elements stagger into view with orchestrated timing
- [ ] First paint should show something meaningful within 1 second (skeleton/preloader)

### 11. NAVIGATION
- [ ] Minimal top nav: logo left, hamburger or minimal links right
- [ ] If hamburger: full-screen overlay menu with large text links (24–48px) that stagger in
- [ ] Menu open/close animation: 400–600ms with smooth easing
- [ ] Active section indicator: subtle dot, underline, or color change synced with scroll position
- [ ] Nav should hide on scroll down, reveal on scroll up (smart sticky behavior)

### 12. DEPTH & BREAKING FLATNESS
- [ ] Add CSS `perspective` to at least one container for true 3D parallax layers
- [ ] Use `transform: translateZ()` to place elements at different depth planes
- [ ] Shadows: use multi-layered shadows instead of single box-shadow — creates more realistic depth
  Example: `box-shadow: 0 1px 2px rgba(0,0,0,0.07), 0 4px 8px rgba(0,0,0,0.07), 0 16px 32px rgba(0,0,0,0.07);`
- [ ] Overlap elements: images that peek behind text sections, cards that stack with visible edges
- [ ] Background gradient meshes or animated gradient blobs for organic depth
- [ ] If applicable: add a Three.js / WebGL background canvas with subtle particle system, noise field, or fluid simulation

### 13. SOUND DESIGN (OPTIONAL BUT DIFFERENTIATING)
- [ ] Ambient background audio layer (very subtle, volume 0.05–0.15)
- [ ] Interaction sounds on key actions (click, hover, transition) using Web Audio API
- [ ] Mute toggle always visible and accessible
- [ ] Sound should enhance, never startle — think "spatial UI" not "sound effects"

### 14. RESPONSIVE & MOBILE
- [ ] Mobile is not a degraded experience — it's a redesigned experience
- [ ] Touch gestures replace hover states: use swipe, drag, and tap animations
- [ ] Reduce or disable complex WebGL on mobile (replace with static/simplified versions)
- [ ] Target 45+ FPS on mid-range mobile devices
- [ ] Touch-friendly tap targets: minimum 44×44px
- [ ] Test on real devices, not just browser resize

### 15. PERFORMANCE HARD TARGETS
- [ ] LCP < 2.5 seconds
- [ ] CLS < 0.1
- [ ] Desktop frame rate: constant 60fps during all animations
- [ ] Only animate `transform` and `opacity` — NEVER width, height, top, left, margin, padding
- [ ] Code-split: load GSAP, Three.js, and heavy libraries dynamically/lazily
- [ ] Images: all WebP/AVIF, all with explicit width/height to prevent layout shift
- [ ] Fonts: `font-display: swap` + preload the primary font file

### 16. ACCESSIBILITY (NON-NEGOTIABLE)
- [ ] `prefers-reduced-motion` media query: disable all scroll animations, parallax, and transitions for users who request it
- [ ] All interactive elements keyboard-navigable with visible focus states
- [ ] Sufficient color contrast (WCAG AA minimum: 4.5:1 for body text)
- [ ] Semantic HTML: proper heading hierarchy, landmarks, alt text
- [ ] ARIA labels on custom interactive elements (custom cursor, sliders, etc.)
- [ ] Skip-to-content link for keyboard users

---

## OUTPUT FORMAT

Return the complete, production-ready code with:
1. **Before/After summary** — a brief list of what was changed
2. **The code** — fully working, with inline comments marking each technique applied (e.g., `/* GSAP: scroll-scrubbed hero */`)
3. **The Signature Moment** — explicitly call out what you chose as the ONE unforgettable element
4. **Performance notes** — any tradeoffs or things to watch
5. **Next-level upgrades** — what would push it even further (WebGL, custom shaders, etc.) that you didn't implement but could

---

## TECH STACK PREFERENCES

Use these defaults unless I specify otherwise:
- **Framework:** Vanilla HTML/CSS/JS (or React/Next.js if I provide a React project)
- **Animation:** GSAP 3 + ScrollTrigger (load from CDN: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js)
- **Smooth scroll:** Lenis (https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js)
- **Fonts:** Google Fonts (free tier) — suggest specific fonts that match the site's personality
- **No jQuery. No Bootstrap. No Tailwind UI components.** Raw, custom CSS.

---

## DESIGN PHILOSOPHY

Channel these studios who win Awwwards SOTY repeatedly:
- **Immersive Garden** (3× Studio of Year) — WebGL + GSAP + Nuxt, poetic motion
- **Build in Amsterdam** (4 SOTY wins) — Restrained elegance, image-centric, fluid transitions
- **Active Theory** (3 SOTY wins) — Full 3D environments, cinematic scale
- **Resn** (2 SOTY wins) — Playful, unexpected, technically wild
- **Monks/MadeByMonks** (3 SOTY wins) — Narrative-driven, scroll storytelling

The goal is not to copy these studios but to apply their rigor: every pixel intentional, every animation choreographed, every interaction meaningful.

---

## ANTI-PATTERNS TO AVOID

NEVER do any of the following:
- ❌ Generic sans-serif fonts (Inter, Roboto, Arial)
- ❌ Pure white (#ffffff) or pure black (#000000) backgrounds
- ❌ Symmetrical, centered, predictable layouts throughout
- ❌ Elements that just "fade in" with no spatial movement
- ❌ Hover effects that only change color (add transform, clip-path, or scale)
- ❌ Stock photography without treatment (filter, blend mode, or animation)
- ❌ Cookie-cutter card grids with equal spacing and no overlap
- ❌ Page loads without transitions
- ❌ Default browser scrollbar without styling or hiding
- ❌ Animating layout properties (width, height, top, left)
- ❌ Loading spinners
- ❌ "Hero section → 3 cards → CTA → Footer" template layouts
- ❌ Drop shadows with a single layer
- ❌ Scroll animations that all use the same timing and easing

---

Now, here is my website:

[PASTE YOUR CODE / DESCRIBE YOUR SITE / PROVIDE URL HERE]
```

---

## QUICK-START VARIANTS

### For a Landing Page:
Add to the top of the prompt:
```
This is a single-page landing/marketing site. Focus heavily on:
- Scroll-driven narrative (the scroll IS the story)
- One full-screen pinned section with scrub animation
- Hero that fills viewport with animated headline
- Horizontal scroll gallery for features/portfolio
- CTA that uses magnetic hover effect
```

### For a Portfolio:
```
This is a creative portfolio. Focus heavily on:
- Project grid with hover previews (image distortion or scale)
- Shared-element transitions (thumbnail → full project page)
- Custom cursor that becomes "View Project" on hover
- Full-screen image reveals with clip-path animations
- Minimal text, maximum visual impact
```

### For an E-Commerce / Product Site:
```
This is a product/e-commerce site. Focus heavily on:
- 3D product render or scroll-driven product rotation
- Product cards with magnetic hover and parallax depth
- Add-to-cart micro-animation (satisfying confirmation)
- Horizontal product carousel with drag interaction
- Product detail page with scroll-scrubbed feature reveals
```

### For a SaaS / App:
```
This is a SaaS/app marketing site. Focus heavily on:
- Animated product mockups that respond to scroll
- Feature sections pinned with step-by-step reveals
- Data visualization animations (counters, chart drawing)
- Testimonial section with smooth card transitions
- Pricing table with hover elevation and accent highlights
```

### For a Data-Heavy / Dashboard Site:
```
This is a data-intensive application. Focus heavily on:
- Number counters that animate up on scroll entry
- Chart/graph animations that draw themselves progressively
- Smooth transitions between data views
- Real-time update micro-animations (subtle pulse, fade-swap)
- Dense but organized layout with clear visual hierarchy
```
