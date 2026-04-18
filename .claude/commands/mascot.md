---
description: Build, modify, or debug a mascot animation state — delegates to motion-engineer subagent
---

Work on the mascot animation system. The argument `$ARGUMENTS` should specify either:
- A state name to build or modify: `idle`, `charging`, `discharge`, `punch`, `celebrate`, `sad`
- Or a specific task: "add cursor tracking", "debug breathing loop", etc.

## Context

The mascot is the site's signature conversion moment. It's an inline SVG with animatable parts:
- `#v-mascot-body` — the lightning bolt shape
- `#v-mascot-left-eye`, `#v-mascot-right-eye` — white eye shapes
- `#v-mascot-left-pupil`, `#v-mascot-right-pupil` — dark pupils (these track the cursor)
- `#v-mascot-left-fist`, `#v-mascot-right-fist` — the two fists
- `#v-mascot-mouth` — smile/frown path

The mascot file is at `/snippets/volta-mascot.liquid`.
The animation controller is at `/assets/volta-mascot.js`.

## State spec

### idle
Gentle breathing (scale 1.0 ↔ 1.02, 3s loop), pupils track cursor at 3px max radius, subtle color breathing on eyes (from `--volta-green` to a slightly lighter variant).

### charging
Pupils glow yellow (var(--volta-yellow)), subtle vibration on body (translateX: ±1px, random timing), color saturates from pale green to full neon. Duration: scroll-bound or 1.5s timed.

### discharge
Quick flash: opacity pulse (0 at peak), mascot briefly scales 1.3 then back to 1.0. 0.4s total. Triggered manually or on section enter.

### punch
Left fist rotates 25° and extends forward (translateX: 20px), scales up 1.2, returns to default. 0.5s total. Used on Add to Cart click.

### celebrate
Full celebration: mascot jumps (translateY: -40px → 0 with bounce ease), pupils become small stars (SVG shape swap), both fists raised. 0.8s total. Used on checkout success.

### sad
Mouth path flips (smile → frown), pupils droop (translateY: 2px on each pupil), body slightly deflates (scale 0.95). Static state, no loop. Used on 404 and empty cart.

## Steps

1. **Delegate to the `motion-engineer` subagent** with:
   - The state or task from `$ARGUMENTS`
   - The full spec from this document
   - Access to the current mascot files

2. The motion engineer will:
   - Read the current mascot SVG and JS
   - Propose a GSAP timeline or state implementation
   - Flag any performance considerations
   - Write or modify the code with inline comments
   - Show you the diff

3. **Test in the dev preview:**
   - Open the relevant page where the mascot state is triggered
   - Verify the animation at normal speed
   - Verify at 4× CPU throttle (still usable)
   - Verify with `prefers-reduced-motion: reduce` (animation disabled, static pose shown)

4. **Report:**
   - What changed
   - Expected behavior
   - Any known edge cases
