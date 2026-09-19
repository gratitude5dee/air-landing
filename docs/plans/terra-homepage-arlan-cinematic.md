# Terra implementation plan: Air homepage cinematic refresh

## Objective

Turn the homepage into one continuous, cinematic product story for Air: the interface forms from live type and cloud light, resolves into the hero, then moves through apps, Mini Apps, and persistent context without repeating the same glass-card treatment.

Use the supplied Arlan Vault material as visual reference only. Build original components and artwork; do not copy source code or proprietary assets.

## Current-state review

### Keep

- The pale sky / cloud palette and large editorial typography.
- The existing low-power cloud shader and static image fallback.
- The core message: “Your personal assistant for your work.”
- One primary conversion action: “Try Air for free,” plus a quieter “See how it works.”
- The draggable app-orb idea, DriftWall Mini App showcase, and accordion workspace story.
- Existing reduced-motion, forced-colors, keyboard, and save-data accommodations.

### Improve

- The mobile intro and hero currently repeat the same AIR wordmark, artifacts, orb, and message back-to-back. The intro should transform into the hero rather than restart it.
- The intro lasts up to 7.2 seconds and blocks page scrolling. First-load spectacle should resolve in 2.8–3.4 seconds, be immediately skippable, and not replay for returning users unless requested.
- The app-orb section creates a very tall empty field on mobile before its interaction becomes legible. The mobile composition needs a deliberate arc or carousel, not a scaled desktop field.
- Grid backgrounds, large embossed words, chromatic floor glows, glass containers, and rounded action rails recur in every section. Give each section one distinct visual job.
- The Mini App wall is visually strong but needs faster comprehension: stable labels/tooltips, clear active state, and direct descriptions for Create, Inbox, Shop, Zap, and Trade.
- Static section headings do not yet share a signature motion language with the cinematic opening.

## Creative direction: “Air assembles around the work”

The homepage should feel like an operating environment materializing—not a gallery of unrelated effects.

1. **Signal:** loose live glyphs and symbols appear in cloud haze.
2. **Formation:** the glyph field spirals inward and resolves into the word `AIR`.
3. **Ripple:** the formed letters pass through one restrained tiled wave.
4. **Context:** notes, messages, images, and approvals bloom into orbit.
5. **Continuity:** the intro surface melts upward into the real hero with the same AIR object still in place.
6. **Product proof:** each subsequent section demonstrates a concrete behavior—bring apps together, open a Mini App, keep context, review a consequential action.

## Arlan Vault mapping

### Midjourney Medical ASCII → intro formation

Create an original single-canvas glyph system. Cache glyph sprites once, then reuse them. Characters orbit with stronger angular velocity near the center and gradually settle into the AIR wordmark. Keep real HTML copy and controls above the canvas.

### Kinetic typography → AIR settle and section headlines

After the glyphs resolve, divide the AIR wordmark into a modest tile grid and pass one sine wave across it. Reuse a lighter version for section-title entrances; do not animate every paragraph.

### Liquid UI → continuity between surfaces

Use fused corners and animated shared masks where two product surfaces meet: hero-to-orbit transition, Mini App tooltip-to-tile connection, and the three-step workspace gallery. Avoid turning every container into a blob.

### Amo hover button → conversion moment

Apply a short, original puffy/glossy motion clip only to the primary “Try Air for free” CTA on fine-pointer devices. The default button must remain readable and functional without video. On touch and reduced motion, use a static specular highlight.

### Supporting references from the CSV

- Ghosty reveal for image entrances.
- Chromatic glow for one restrained bottom-light transition.
- Apple-style squircles for primary controls only.
- The Typer for a brief state change inside product copy, not the main headline.

## Page architecture

### 0. Cinematic intro — 2.8–3.4 seconds

- Replace `MobileAirIntro` with a responsive `CinematicAirIntro` used on phone and desktop.
- Sequence: cloud field → glyph vortex → AIR formation → tile ripple → artifact orbit → liquid handoff.
- Preserve visible Skip and Enter controls from frame one.
- Show the full intro once per session. Returning visits receive a 450–700ms atmospheric reveal. Keep Replay in the hero.
- Never delay navigation, the main headline, or the CTA for animation readiness.

### 1. Hero — the settled world

- The AIR object persists spatially from the intro instead of replaying a second entrance.
- Keep one poster-like composition: AIR world, headline, one sentence, primary CTA, text link.
- Reduce floating artifacts from nine to five high-signal items on desktop and four on mobile.
- Make the hero copy enter immediately after the AIR settle, with no independent theatrical animation.

### 2. “Step into Air” product film

- Promote the film from an inset card to a wider cinematic strip that visually bridges sky and workspace.
- Keep autoplay muted, inline, intersection-triggered, poster-backed, and paused off-screen.
- Use a ghosty edge reveal instead of another rounded glass frame.

### 3. Apps in orbit

- Desktop: retain free drag with gentle gravitational return and collision-safe bounds.
- Mobile: replace the tall absolute field with a compact draggable arc showing five primary apps; overflow apps enter as the arc rotates.
- Selecting an orb exposes one compact capability sentence next to the Air core.
- Ensure a useful static composition before JavaScript and when reduced motion is active.

### 4. Mini Apps / DriftWall

- Keep the full wall, but let one tile become the active narrative surface.
- Hover/focus/tap reveals an anchored tooltip with title, one-sentence outcome, and availability state.
- Use unique imagery and crops for Create, Inbox, Shop, Zap, and Trade.
- On mobile, use a controlled vertical drift with snap-to-active behavior and persistent labels.
- Remove redundant framed rails beneath the wall; the active tile and CTA should carry the section.

### 5. One continuous workspace

- Keep the accordion interaction but visually fuse neighboring panels using the Liquid UI direction.
- Tell a strict three-beat story: Create → Organize → Continue.
- Use the kinetic headline reveal once as the section enters; keep all supporting copy still.
- The active panel must remain keyboard-operable and readable on touch without hover.

### 6. Closing conversion

- End with one concise invitation and the “Try Air for free” CTA.
- Use the Amo-inspired hover clip as a reward on pointer hover, not a looping background.
- Do not reintroduce price language or a second competing conversion path.

## Component plan

### Add

- `components/CinematicAirIntro.tsx`
- `components/CinematicAirIntro.module.css`
- `components/AsciiAirFormation.tsx`
- `components/KineticWordmark.tsx`
- `components/LiquidJoin.tsx`
- `components/AmoCta.tsx`
- `lib/motion-budget.ts`

### Refactor

- `LandingExperience.tsx`: introduce a shared intro/hero lifecycle and simpler section composition.
- `LandingExperience.module.css`: establish the spatial handoff and remove repeated decorative treatments.
- `AppOrbPlayground.tsx`: separate desktop free-drag and mobile arc layouts.
- `MiniAppShowcase.tsx`: add active-tile state and accessible tooltip content.
- `AccordionGallery.tsx`: add optional fused-panel styling without changing its accessible base behavior.
- `LandingCloudShader.tsx`: expose animation intensity and lifecycle controls to the intro/hero orchestrator.

### Retire after parity

- `MobileAirIntro.tsx`
- `MobileAirIntro.module.css`

## Motion orchestration

- Use the existing GSAP dependency for timelines and lifecycle cleanup.
- Use one canvas for cached glyph sprites; do not create one DOM node per particle.
- Use CSS transforms and opacity for interface motion. Avoid animating layout properties.
- Pause canvas and timelines when the document is hidden; stop intro rendering after the handoff.
- Clamp canvas DPR to `1.5` on mobile and `2` on desktop.
- Target 24–30 fps for atmosphere, 60 fps only for short direct manipulation.
- Maximum active glyphs: roughly 420 mobile / 900 desktop, tuned from profiling.

## Accessibility and control

- Intro visuals are decorative; the actual H1 and CTA remain semantic HTML.
- Skip is keyboard reachable and visible immediately. Escape skips the intro.
- Focus moves to the H1 or primary CTA after manual entry, never into a hidden overlay.
- `prefers-reduced-motion`: render the settled AIR state immediately and crossfade in under 200ms.
- `Save-Data` or low-capability devices: use the static cloud/image composition and no canvas loop.
- Maintain 44px touch targets and visible focus treatment.

## Performance budgets

- No additional large animation framework; use GSAP, Canvas 2D, CSS, and the existing WebGL cloud shader.
- Intro JavaScript: target under 35KB gzip beyond current shared code.
- Intro media fallback: under 450KB if a short WebM is retained.
- No measurable CLS from intro exit or section reveals.
- Mobile LCP target under 2.5s on a mid-tier phone profile.
- Long tasks under 50ms during load; animation must not delay CTA interactivity.

## Delivery sequence

### Phase 1 — Baseline and design tokens

- Capture 390×844, 768×1024, and 1440×900 baselines.
- Record LCP, CLS, total JS, animation frame rate, and reduced-motion screenshots.
- Add motion-duration, easing, surface, radius, and chroma tokens.

### Phase 2 — Intro prototype behind a feature flag

- Build the glyph canvas, AIR target layout, kinetic settle, skip behavior, and reduced-motion state.
- Add `NEXT_PUBLIC_AIR_CINEMATIC_V2` or an equivalent local flag.
- Do not touch downstream sections until the handoff is stable.

### Phase 3 — Hero handoff

- Share settled geometry/state between intro and hero.
- Remove the duplicate hero entrance and reduce artifact count.
- Validate first-visit, return-visit, replay, and direct-hash behavior.

### Phase 4 — Section differentiation

- Recompose film, orb, DriftWall, and accordion sections in that order.
- Give each section one interaction and one visual signature.
- Remove decorative layers that repeat without communicating product behavior.

### Phase 5 — Conversion and polish

- Add the Amo-inspired CTA hover asset and non-video fallback.
- Tighten copy and verify there is one primary conversion action per viewport.

### Phase 6 — QA and rollout

- Test Safari iOS, Chrome Android, desktop Safari, and desktop Chrome.
- Test keyboard, screen reader landmarks, touch drag, rotation, slow network, Save-Data, and reduced motion.
- Run visual regression screenshots and production build/tests.
- Ship behind the flag, compare conversion and engagement, then remove the legacy intro after validation.

## Acceptance criteria

- The intro and hero read as one uninterrupted scene, not two versions of the same animation.
- A first-time user can identify Air, its value, and the primary CTA within three seconds.
- Returning users are not blocked by the full intro.
- Every major section has one clear job and a distinct visual behavior.
- The app-orb section never presents a large blank mobile field.
- Every Mini App is identifiable without relying on hover alone.
- Reduced-motion and static fallbacks preserve hierarchy and product meaning.
- No regression to signup flow, Cal.com links, waitlist count, or `/admin`.
- Typecheck, tests, production build, and accessibility checks pass.

## Terra execution prompt

Act as a senior design engineer and frontend systems engineer. Implement the plan in this document on the current Air landing-page branch. Treat the supplied Arlan Vault descriptions as inspiration only; create original code and visuals. Work phase by phase, keep the existing signup/admin behavior intact, and preserve unrelated working-tree changes. Start by capturing baseline screenshots and performance metrics. Build the cinematic intro behind a feature flag, verify its reduced-motion and static fallbacks, then integrate the hero handoff before touching later sections. Use the existing GSAP dependency, Canvas 2D, CSS, and the current low-power WebGL cloud shader; do not add a heavy animation framework. Test mobile first at 390×844, then tablet and desktop. After each phase run typecheck and relevant tests, and finish with a production build plus visual QA. Do not deploy until the complete experience has been reviewed.
