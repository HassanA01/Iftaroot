# 3D & Alive UI Overhaul — Design Spec

**Date:** 2026-04-01  
**Supersedes:** `2026-04-01-general-islamic-rebrand-design.md` (copy changes from that spec are incorporated here)  
**Goal:** Transform Hilal from a flat 2D interface into an immersive, 3D-feeling experience with a showpiece landing page hero, ambient depth on every screen, and escalating visual intensity during gameplay — while keeping the Islamic identity (crescent, lanterns, gold-on-purple) and ensuring clean mobile responsiveness.

---

## Tech Stack Additions

| Package | Purpose | Bundle Cost (gzipped) | Scope |
|---------|---------|----------------------|-------|
| `@react-three/fiber` | React renderer for Three.js | ~25 KB (+ Three.js) | Landing hero only |
| `three` | 3D engine | ~155 KB | Landing hero only |
| `@react-three/drei` | R3F helpers (Float, Stars, MeshTransmission, etc.) | Tree-shakeable, ~5-15 KB used | Landing hero only |
| `@react-three/postprocessing` | Bloom, depth-of-field | ~10 KB | Landing hero only |
| `@tsparticles/react` + `@tsparticles/slim` | Particle starfield | ~20 KB | All pages |

**Critical:** The entire R3F bundle (Three.js + fiber + drei + postprocessing) is **lazy-loaded** via `React.lazy()` + `Suspense`. It only loads on the landing page and never blocks initial page load or game screens.

---

## 1. Landing Page Hero (Desktop) — 3D Scene

A full-screen R3F `<Canvas>` behind the existing landing page content. Three composited layers, all responding to mouse position for parallax depth.

### Layer 1: Animated Gradient Mesh (Background)
- Custom fragment shader or ShaderGradient component
- Colors: deep purple (`#1a0a2e`), mid purple (`#2a1442`), dark navy (`#0a0520`), with subtle gold (`#f5c842`) highlights
- Slowly morphing organic blobs — simplex noise driving vertex displacement
- Fills the entire viewport as the deepest layer

### Layer 2: 3D Geometric Islamic Lattice (Midground)
- Tessellating arabesque/geometric shapes rendered as Three.js meshes with slight extrusion (depth)
- Gold emissive material (`#f5c842`) with low intensity so shapes glow subtly
- Slowly rotating on Y-axis (~0.5 RPM)
- Gold point light behind the lattice so light filters through the gaps
- Mouse parallax: slight X/Y offset inverse to cursor position
- Positioned behind the crescent but in front of the gradient

### Layer 3: 3D Crescent Moon + Orbiting Stars (Foreground)
- Crescent moon as a 3D extruded shape (or torus segment) with gold metallic material
- Subtle float animation (gentle Y oscillation, ~2px amplitude, 4s cycle)
- Mouse-tracking rotation: rotates slightly toward cursor (max ±10° on X and Y)
- 20-30 small gold sphere particles orbiting the crescent in elliptical paths at varying speeds/radii
- Bloom post-processing on the crescent for a soft gold glow

### Post-Processing (via @react-three/postprocessing)
- **Bloom**: Subtle, focused on emissive gold elements
- **Vignette**: Slight darkening at edges to frame the scene
- **ChromaticAberration**: Very subtle (0.002) for a cinematic feel

### Mobile Fallback
On mobile (detect via `window.innerWidth < 768` or `navigator.hardwareConcurrency < 4`):
- **Do NOT load R3F / Three.js at all** — the lazy import never triggers
- Instead, render:
  - CSS aurora gradient background (animated radial gradients + blur, pure CSS)
  - tsParticles gold starfield (reduced particle count: 30 instead of 80)
  - Existing 2D crescent moon SVG + floating lanterns (current design, retained)
- Result: still looks rich and alive, zero WebGL overhead

---

## 2. Ambient Depth System (All Pages)

These effects apply globally — landing page, auth pages, lobby, game screens, podium. They use **only Framer Motion (already installed) + tsParticles + CSS**.

### 2a. Gold Particle Starfield Background
Replaces the flat `#1a0a2e` background on all pages.

- **Library:** tsParticles with slim bundle
- **Particles:** Small circles (1-2px), gold (`#f5c842`) at 20-40% opacity
- **Count:** 80 on desktop, 30 on mobile
- **Movement:** Slow drift (`speed: 0.3`), random directions
- **Interactivity:** Mouse repulsion (`distance: 100, speed: 0.5`) on desktop, disabled on mobile
- **Z-index:** Behind all content, rendered as a fixed-position canvas
- **Config lives in:** `frontend/src/components/ParticleStarfield.tsx` — a single reusable component

### 2b. 3D Tilt on Interactive Cards
Answer option cards, lobby player cards, quiz cards, form cards.

- **Technique:** Map `onMouseMove` clientX/Y relative to card center → `rotateX` and `rotateY` via Framer Motion `useMotionValue` + `useTransform`
- **Max rotation:** ±8°
- **Perspective:** `1000px` on parent
- **Shine overlay:** A radial gradient (`rgba(245,200,66,0.08)` → transparent) positioned at cursor location within the card
- **Reset:** On mouse leave, spring back to `rotateX: 0, rotateY: 0` with `type: "spring", stiffness: 300, damping: 20`
- **Mobile:** Disabled (no hover on touch). Cards remain flat.
- **Implementation:** A `<TiltCard>` wrapper component in `frontend/src/components/TiltCard.tsx` that wraps `motion.div` with the tilt logic. Used around existing card content.

### 2c. Floating Geometric Elements (Parallax Depth)
Small decorative arabesque shapes, mini crescents, and stars floating at different visual depths.

- **Technique:** 8-12 absolutely-positioned SVG elements per page, each with:
  - Different `scale` (0.3 to 1.0) to simulate depth
  - Different `filter: blur()` (0px for "close", 1-2px for "far")
  - Framer Motion `animate` with `y: [0, -20, 0]` or `[0, 15, 0]`, varying durations (6-12s), `repeat: Infinity`
  - Mouse parallax via `useMotionValue`: elements at larger scale move more with cursor, smaller ones move less
- **Opacity:** 5-15% — subtle, never competing with content
- **Implementation:** `frontend/src/components/FloatingElements.tsx` — renders a fixed set of positioned SVG shapes. Takes a `density` prop ("sparse" | "normal" | "dense") for escalation.

### 2d. Animated Aurora Gradient
A CSS-only backdrop behind the particle starfield.

- **Technique:** 3 overlapping `div`s with large radial gradients in purple hues, each with different `animation-duration` (8s, 12s, 16s), animating `background-position` and `scale`
- **Colors:** `#1a0a2e`, `#2a1442`, `#150830`, with a faint gold (`rgba(245,200,66,0.03)`) in one gradient
- **Filter:** `blur(60px)` on each div for soft edges
- **Implementation:** CSS classes in `frontend/src/index.css`, applied via a `<AuroraBackground>` component in `frontend/src/components/AuroraBackground.tsx`

### 2e. Cinematic Transitions
Content enters and exits with depth.

- **Enter:** `opacity: 0, scale: 0.95, filter: "blur(4px)"` → `opacity: 1, scale: 1, filter: "blur(0px)"` with `duration: 0.5, ease: easeOut`
- **Exit:** Reverse of enter
- **Stagger:** When multiple items enter (leaderboard rows, answer options), stagger by 0.05s each
- **Implementation:** Framer Motion `AnimatePresence` + `motion.div` variants. Define shared variants in `frontend/src/lib/animations.ts`.

---

## 3. Escalating Game Intensity

Visual energy scales with game progress. The intensity ratio is `currentQuestionIndex / totalQuestions` (0.0 to 1.0).

### Intensity Tiers

| Range | Tier | Particle Speed | Particle Count Multiplier | Transition Speed | Extra Effects |
|-------|------|---------------|--------------------------|-----------------|---------------|
| 0.0–0.33 | Calm | 0.3 | 1x | 500ms ease | None |
| 0.34–0.66 | Building | 0.6 | 1.5x | 350ms ease | Timer text pulses gently (scale 1.0→1.02→1.0) |
| 0.67–1.0 | Intense | 1.0 | 2x | 200ms spring | Screen edge gold glow, timer pulses harder (1.0→1.05→1.0), particle repulsion radius increases |

### Answer Feedback (Intensity-Scaled)

**Correct answer:**
- **Calm tier:** Card glows gold briefly (`boxShadow: "0 0 20px rgba(245,200,66,0.4)"`), subtle scale up (1.02)
- **Building tier:** Gold glow + 15-particle gold burst from card center (tsParticles one-shot emitter)
- **Intense tier:** Bright gold glow + 30-particle burst + brief screen flash (`opacity: 0 → 0.05 → 0` gold overlay, 200ms)

**Wrong answer:**
- **Calm tier:** Card dims slightly, subtle horizontal shake (2px, 300ms)
- **Building tier:** Stronger shake (4px), card border flashes red briefly
- **Intense tier:** Strong shake (6px) + particles briefly scatter outward from card + border flash

### Implementation
- `frontend/src/hooks/useGameIntensity.ts` — A hook that takes `currentQuestion` and `totalQuestions`, returns an `intensity` object with `tier`, `ratio`, `particleSpeed`, `particleMultiplier`, `transitionDuration`, and helper booleans (`isCalm`, `isBuilding`, `isIntense`)
- Game screen components read from this hook and apply the appropriate visual settings
- tsParticles instance is updated dynamically via its `refresh()` API when tier changes

---

## 4. Podium Screen — Maximum Celebration

The podium is already the most celebratory screen. Enhancements:

- **Particle starfield at max intensity** — fast, dense, gold particles
- **Existing confetti** — retained and enhanced (longer duration, more colors: gold + white + light purple)
- **3D tilt on podium cards** — each winner's card tilts on hover
- **Staggered entrance:** 3rd place → 2nd place → 1st place, each with a dramatic scale-up + blur-clear transition, 0.5s apart
- **Gold glow pulse** on 1st place card — continuous subtle `boxShadow` animation
- **Floating geometric elements at "dense" density**

---

## 5. Copy Changes (Incorporated from Rebrand Spec)

All Ramadan-specific copy is replaced with general Islamic / community language.

### Landing Page (`frontend/src/pages/LandingPage.tsx`)

| Location | Current | New |
|----------|---------|-----|
| Line 284 — tagline | `Ramadan 2026` | `Live Islamic Quiz` |
| Lines 305-312 — hero headline | `CELEBRATE` / `RAMADAN.` | `GATHER.` / `PLAY.` |
| Line 349 — subtext | `...built for Ramadan nights...` | `...for your community...` |
| Line 490 — Kahoot comparison | `No Ramadan theme` | `No Islamic design` |
| Line 530 — Hilal comparison | `Built for Ramadan` | `Built for the Ummah` |
| Line 559 — feature label | `Ramadan-Themed` | `Islamic Design` |
| Line 560 — feature title | `Designed for the occasion` | `Designed with intention` |
| Line 561 — feature body | `...built with intention, not as an afterthought.` | `...crafted for the community, not as an afterthought.` |
| Line 664 — step 3 | `...Crown your Ramadan champion.` | `...Crown your champion.` |
| Line 756 — CTA | `Ramadan Mubarak. Enter a game code...` | `Assalamu Alaikum. Enter a game code...` |

### CSS Class Renames (`frontend/src/index.css`)

| Current | New |
|---------|-----|
| `.bg-ramadan` | `.bg-hilal` |
| `.ramadan-pattern` | `.hilal-pattern` |

All references across all files updated accordingly (list in rebrand spec).

---

## 6. New File Map

| File | Purpose |
|------|---------|
| `frontend/src/components/3d/LandingHeroScene.tsx` | R3F Canvas with all three 3D layers, lazy-loaded |
| `frontend/src/components/3d/GradientMesh.tsx` | Shader-based gradient mesh background |
| `frontend/src/components/3d/IslamicLattice.tsx` | 3D geometric arabesque lattice |
| `frontend/src/components/3d/CrescentMoon3D.tsx` | 3D crescent with orbiting stars |
| `frontend/src/components/ParticleStarfield.tsx` | tsParticles gold starfield, configurable intensity |
| `frontend/src/components/TiltCard.tsx` | Reusable 3D tilt wrapper component |
| `frontend/src/components/FloatingElements.tsx` | Decorative parallax SVG elements |
| `frontend/src/components/AuroraBackground.tsx` | CSS aurora gradient backdrop |
| `frontend/src/lib/animations.ts` | Shared Framer Motion variants for cinematic transitions |
| `frontend/src/hooks/useGameIntensity.ts` | Game progress → visual intensity mapping |

---

## 7. What Stays Unchanged

- Crescent moons, lanterns, stars, geometric patterns (enhanced, not replaced)
- Gold-on-purple palette (`#f5c842`, `#1a0a2e`, `#ff6b35`)
- Prayer Arc Transition with prayer names
- Arabic dua on podium ("ربِ زِدنِي علِماً")
- Poppins typography
- Audio files
- WebSocket game logic, state machine, scoring — zero backend changes
- All existing page routes and component structure (new components wrap/enhance existing ones)

---

## 8. Mobile Strategy

**Principle:** Desktop gets the full 3D experience. Mobile stays clean, responsive, and performant — no WebGL.

| Feature | Desktop | Mobile |
|---------|---------|--------|
| Landing 3D hero scene | Full R3F canvas | CSS aurora + 2D SVG elements + reduced particle starfield |
| Particle starfield | 80 particles, mouse repulsion | 30 particles, no interactivity |
| 3D tilt on cards | Active on hover | Disabled (no hover on touch) |
| Floating geometric elements | 8-12 elements with mouse parallax | 4-6 elements, no mouse parallax, animation only |
| Escalating intensity | Full particle burst effects | Glow/shake effects only, no particle bursts |
| Aurora gradient | Active | Active (lightweight CSS) |
| Cinematic transitions | Active | Active (same Framer Motion) |

**Detection:** `window.matchMedia("(max-width: 768px)")` for responsive, `navigator.hardwareConcurrency < 4` as an additional GPU guard for the R3F scene.
