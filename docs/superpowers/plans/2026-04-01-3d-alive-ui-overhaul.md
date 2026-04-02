# 3D & Alive UI Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Hilal from a flat 2D interface into an immersive 3D experience with a React Three Fiber landing hero, ambient particle depth on every screen, 3D tilt cards, escalating game intensity, and general Islamic rebranding — with graceful mobile degradation.

**Architecture:** New visual components layer on top of existing pages. A shared `ParticleStarfield` replaces flat backgrounds. A `TiltCard` wrapper adds 3D hover to interactive elements. A `useGameIntensity` hook drives escalating visuals during gameplay. The R3F landing hero is lazy-loaded and only ships to desktop. All Ramadan-specific copy is replaced with general Islamic language.

**Tech Stack:** React 19, Motion (Framer Motion) 12, React Three Fiber, Three.js, @react-three/drei, @react-three/postprocessing, @tsparticles/react, @tsparticles/slim, TypeScript, Tailwind CSS v4, Vite 7

---

## File Map

| File | Purpose |
|------|---------|
| `frontend/src/components/AuroraBackground.tsx` | **CREATE** — CSS aurora gradient backdrop |
| `frontend/src/components/ParticleStarfield.tsx` | **CREATE** — tsParticles gold starfield with configurable intensity |
| `frontend/src/components/TiltCard.tsx` | **CREATE** — Reusable 3D tilt hover wrapper |
| `frontend/src/components/FloatingElements.tsx` | **CREATE** — Decorative parallax SVG shapes |
| `frontend/src/components/3d/LandingHeroScene.tsx` | **CREATE** — R3F Canvas orchestrator (lazy-loaded) |
| `frontend/src/components/3d/GradientMesh.tsx` | **CREATE** — Shader-based animated gradient background |
| `frontend/src/components/3d/IslamicLattice.tsx` | **CREATE** — 3D geometric arabesque lattice |
| `frontend/src/components/3d/CrescentMoon3D.tsx` | **CREATE** — 3D crescent with orbiting stars |
| `frontend/src/lib/animations.ts` | **CREATE** — Shared Framer Motion variants |
| `frontend/src/hooks/useGameIntensity.ts` | **CREATE** — Game progress → visual intensity mapping |
| `frontend/src/hooks/useMobileDetect.ts` | **CREATE** — Mobile/low-perf device detection |
| `frontend/src/index.css` | **MODIFY** — Rename CSS classes, add aurora keyframes |
| `frontend/src/pages/LandingPage.tsx` | **MODIFY** — Replace copy, integrate 3D hero |
| `frontend/src/pages/LoginPage.tsx` | **MODIFY** — Add ambient depth layer |
| `frontend/src/pages/RegisterPage.tsx` | **MODIFY** — Add ambient depth layer |
| `frontend/src/pages/JoinPage.tsx` | **MODIFY** — Add ambient depth layer |
| `frontend/src/pages/PlayerLobbyPage.tsx` | **MODIFY** — Add ambient depth layer |
| `frontend/src/pages/HostLobbyPage.tsx` | **MODIFY** — Add ambient depth layer |
| `frontend/src/pages/PlayerGamePage.tsx` | **MODIFY** — Escalating intensity + tilt cards |
| `frontend/src/pages/HostGamePage.tsx` | **MODIFY** — Escalating intensity |
| `frontend/src/pages/AdminDashboardPage.tsx` | **MODIFY** — Rename CSS class |
| `frontend/src/components/PodiumScreen.tsx` | **MODIFY** — Max celebration effects |
| `frontend/src/App.tsx` | **MODIFY** — Rename CSS class |

---

## Task 1: Install Dependencies

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install 3D and particle packages**

```bash
cd frontend && npm install three @react-three/fiber @react-three/drei @react-three/postprocessing @tsparticles/react @tsparticles/slim
```

- [ ] **Step 2: Install Three.js types**

```bash
cd frontend && npm install -D @types/three
```

- [ ] **Step 3: Verify install**

```bash
cd frontend && npm ls three @react-three/fiber @tsparticles/react
```

Expected: All three packages listed without errors.

- [ ] **Step 4: Verify build still passes**

```bash
cd frontend && npm run build
```

Expected: Build succeeds with no errors (new packages are installed but not yet imported).

- [ ] **Step 5: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: install R3F, Three.js, tsParticles for 3D UI overhaul"
```

---

## Task 2: CSS Foundation — Rename Classes + Add Aurora Keyframes

**Files:**
- Modify: `frontend/src/index.css`
- Modify: All files referencing `ramadan-pattern` or `bg-ramadan` (see list below)

- [ ] **Step 1: Rename CSS classes in index.css**

In `frontend/src/index.css`, replace `.bg-ramadan` with `.bg-hilal` and `.ramadan-pattern` with `.hilal-pattern`:

```css
/* ─── Reusable background: dark-purple + arabesque pattern ─────────────── */
.bg-hilal {
  background-color: #1a0a2e;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30 30 0zm0 10L10 30l20 20 20-20-20-20z' fill='%23f5c842' fill-rule='evenodd'/%3E%3C/svg%3E");
  background-size: 60px 60px;
}

/* Full-viewport diamond lattice overlay — fixed so it never affects layout or scroll */
.hilal-pattern {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30 30 0zm0 10L10 30l20 20 20-20-20-20z' fill='%23f5c842' fill-rule='evenodd'/%3E%3C/svg%3E");
  background-size: 60px 60px;
}
```

- [ ] **Step 2: Add aurora keyframes to index.css**

Append to the end of `frontend/src/index.css`:

```css
/* ─── Aurora gradient animation ──────────────────────────────────────────── */
@keyframes aurora-drift-1 {
  0%, 100% { transform: translate(0%, 0%) scale(1); }
  33% { transform: translate(5%, -3%) scale(1.05); }
  66% { transform: translate(-3%, 5%) scale(0.95); }
}

@keyframes aurora-drift-2 {
  0%, 100% { transform: translate(0%, 0%) scale(1.05); }
  33% { transform: translate(-4%, 4%) scale(1); }
  66% { transform: translate(6%, -2%) scale(1.1); }
}

@keyframes aurora-drift-3 {
  0%, 100% { transform: translate(0%, 0%) scale(0.95); }
  33% { transform: translate(3%, 6%) scale(1.05); }
  66% { transform: translate(-5%, -4%) scale(1); }
}
```

- [ ] **Step 3: Find-and-replace class names across all components**

Replace every `className="ramadan-pattern"` with `className="hilal-pattern"` in these files:

- `frontend/src/App.tsx`
- `frontend/src/pages/PlayerLobbyPage.tsx`
- `frontend/src/pages/HostLobbyPage.tsx`
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/RegisterPage.tsx`
- `frontend/src/pages/AdminDashboardPage.tsx`
- `frontend/src/pages/HostGamePage.tsx`
- `frontend/src/components/PodiumScreen.tsx`
- `frontend/src/pages/JoinPage.tsx`
- `frontend/src/pages/PlayerGamePage.tsx`

- [ ] **Step 4: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes. No references to `ramadan-pattern` remain (search to confirm).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/index.css frontend/src/App.tsx frontend/src/pages/ frontend/src/components/PodiumScreen.tsx
git commit -m "refactor: rename ramadan CSS classes to hilal, add aurora keyframes"
```

---

## Task 3: Mobile Detection Hook

**Files:**
- Create: `frontend/src/hooks/useMobileDetect.ts`

- [ ] **Step 1: Create the hook**

Create `frontend/src/hooks/useMobileDetect.ts`:

```typescript
import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

function subscribe(callback: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

function getServerSnapshot() {
  return false;
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsLowPerf(): boolean {
  // Check on mount only — hardwareConcurrency doesn't change
  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency ?? 4 : 4;
  return cores < 4;
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes (hook is created but not yet imported anywhere).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useMobileDetect.ts
git commit -m "feat: add useMobileDetect hook for responsive 3D degradation"
```

---

## Task 4: Shared Animation Variants

**Files:**
- Create: `frontend/src/lib/animations.ts`

- [ ] **Step 1: Create shared variants file**

Create `frontend/src/lib/animations.ts`:

```typescript
import type { Variants } from "motion/react";

/** Cinematic enter: scale up from slightly smaller + blur clear */
export const cinematicEnter: Variants = {
  hidden: { opacity: 0, scale: 0.95, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(4px)",
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

/** Staggered container — use on parent, children use cinematicEnter */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

/** Slide up with fade */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/** Card hover spring config — used by TiltCard reset */
export const tiltSpring = { type: "spring" as const, stiffness: 300, damping: 20 };
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/animations.ts
git commit -m "feat: add shared animation variants for cinematic transitions"
```

---

## Task 5: Aurora Background Component

**Files:**
- Create: `frontend/src/components/AuroraBackground.tsx`

- [ ] **Step 1: Create the component**

Create `frontend/src/components/AuroraBackground.tsx`:

```tsx
export function AuroraBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {/* Layer 1 — deep purple drift */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-20%",
          width: "140%",
          height: "140%",
          background: "radial-gradient(ellipse at 30% 40%, #2a1442 0%, transparent 60%)",
          filter: "blur(60px)",
          animation: "aurora-drift-1 8s ease-in-out infinite",
        }}
      />
      {/* Layer 2 — mid purple drift */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "120%",
          height: "120%",
          background: "radial-gradient(ellipse at 70% 60%, #150830 0%, transparent 60%)",
          filter: "blur(60px)",
          animation: "aurora-drift-2 12s ease-in-out infinite",
        }}
      />
      {/* Layer 3 — faint gold hint */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "-15%",
          width: "130%",
          height: "130%",
          background: "radial-gradient(ellipse at 50% 50%, rgba(245,200,66,0.03) 0%, transparent 50%)",
          filter: "blur(60px)",
          animation: "aurora-drift-3 16s ease-in-out infinite",
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/AuroraBackground.tsx
git commit -m "feat: add AuroraBackground component for animated gradient backdrop"
```

---

## Task 6: Particle Starfield Component

**Files:**
- Create: `frontend/src/components/ParticleStarfield.tsx`

- [ ] **Step 1: Create the component**

Create `frontend/src/components/ParticleStarfield.tsx`:

```tsx
import { useCallback, useMemo } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import { useIsMobile } from "../hooks/useMobileDetect";

interface ParticleStarfieldProps {
  /** Speed multiplier (1.0 = default). Used by game intensity system. */
  speed?: number;
  /** Particle count multiplier (1.0 = default). Used by game intensity system. */
  countMultiplier?: number;
}

export function ParticleStarfield({ speed = 1, countMultiplier = 1 }: ParticleStarfieldProps) {
  const isMobile = useIsMobile();
  const baseCount = isMobile ? 30 : 80;

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: false,
      fpsLimit: 60,
      particles: {
        number: {
          value: Math.round(baseCount * countMultiplier),
        },
        color: { value: "#f5c842" },
        opacity: {
          value: { min: 0.15, max: 0.4 },
          animation: {
            enable: true,
            speed: 0.3,
            sync: false,
          },
        },
        size: {
          value: { min: 1, max: 2 },
        },
        move: {
          enable: true,
          speed: 0.3 * speed,
          direction: "none" as const,
          outModes: { default: "out" as const },
        },
      },
      interactivity: isMobile
        ? {}
        : {
            events: {
              onHover: {
                enable: true,
                mode: "repulse",
              },
            },
            modes: {
              repulse: {
                distance: 100,
                speed: 0.5,
              },
            },
          },
      detectRetina: true,
    }),
    [baseCount, speed, countMultiplier, isMobile],
  );

  return (
    <Particles
      id="particle-starfield"
      init={particlesInit}
      options={options}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ParticleStarfield.tsx
git commit -m "feat: add ParticleStarfield component with configurable intensity"
```

---

## Task 7: TiltCard Component

**Files:**
- Create: `frontend/src/components/TiltCard.tsx`

- [ ] **Step 1: Create the component**

Create `frontend/src/components/TiltCard.tsx`:

```tsx
import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useIsMobile } from "../hooks/useMobileDetect";
import { tiltSpring } from "../lib/animations";

interface TiltCardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  /** Max rotation in degrees. Default 8. */
  maxRotation?: number;
  /** Whether to show the gold shine overlay. Default true. */
  shine?: boolean;
}

export function TiltCard({
  children,
  style,
  className,
  maxRotation = 8,
  shine = true,
}: TiltCardProps) {
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const shineX = useMotionValue(50);
  const shineY = useMotionValue(50);

  const springX = useSpring(rotateX, tiltSpring);
  const springY = useSpring(rotateY, tiltSpring);

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current || isMobile) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const percentX = (e.clientX - centerX) / (rect.width / 2);
    const percentY = (e.clientY - centerY) / (rect.height / 2);

    rotateY.set(percentX * maxRotation);
    rotateX.set(-percentY * maxRotation);
    shineX.set(((e.clientX - rect.left) / rect.width) * 100);
    shineY.set(((e.clientY - rect.top) / rect.height) * 100);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
    shineX.set(50);
    shineY.set(50);
  }

  if (isMobile) {
    return (
      <div style={style} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        rotateX: springX,
        rotateY: springY,
        transformStyle: "preserve-3d",
        position: "relative",
        ...style,
      }}
      className={className}
    >
      {children}
      {shine && (
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            background: `radial-gradient(circle at ${shineX.get()}% ${shineY.get()}%, rgba(245,200,66,0.08) 0%, transparent 60%)`,
          }}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/TiltCard.tsx
git commit -m "feat: add TiltCard component for 3D hover effect"
```

---

## Task 8: Floating Elements Component

**Files:**
- Create: `frontend/src/components/FloatingElements.tsx`

- [ ] **Step 1: Create the component**

Create `frontend/src/components/FloatingElements.tsx`:

```tsx
import { motion } from "motion/react";
import { useIsMobile } from "../hooks/useMobileDetect";

type Density = "sparse" | "normal" | "dense";

interface FloatingElementsProps {
  density?: Density;
}

interface FloatingShape {
  id: string;
  /** SVG path or type */
  type: "diamond" | "crescent" | "star";
  /** Position as % of viewport */
  x: number;
  y: number;
  /** Visual scale (simulates depth) */
  scale: number;
  /** Blur in px (0 = close, 2 = far) */
  blur: number;
  /** Opacity 0-1 */
  opacity: number;
  /** Y-axis float amplitude in px */
  floatAmplitude: number;
  /** Animation duration in seconds */
  duration: number;
}

const ALL_SHAPES: FloatingShape[] = [
  { id: "d1", type: "diamond", x: 8, y: 15, scale: 0.4, blur: 1.5, opacity: 0.06, floatAmplitude: 15, duration: 10 },
  { id: "s1", type: "star", x: 85, y: 10, scale: 0.6, blur: 1, opacity: 0.08, floatAmplitude: 12, duration: 8 },
  { id: "c1", type: "crescent", x: 92, y: 55, scale: 0.5, blur: 1.5, opacity: 0.06, floatAmplitude: 18, duration: 12 },
  { id: "d2", type: "diamond", x: 15, y: 70, scale: 0.7, blur: 0.5, opacity: 0.1, floatAmplitude: 10, duration: 7 },
  { id: "s2", type: "star", x: 70, y: 80, scale: 0.35, blur: 2, opacity: 0.05, floatAmplitude: 20, duration: 11 },
  { id: "c2", type: "crescent", x: 5, y: 40, scale: 0.8, blur: 0, opacity: 0.12, floatAmplitude: 8, duration: 6 },
  // Dense-only shapes
  { id: "d3", type: "diamond", x: 50, y: 25, scale: 0.3, blur: 2, opacity: 0.04, floatAmplitude: 22, duration: 13 },
  { id: "s3", type: "star", x: 30, y: 60, scale: 0.9, blur: 0, opacity: 0.1, floatAmplitude: 6, duration: 9 },
  { id: "c3", type: "crescent", x: 60, y: 90, scale: 0.45, blur: 1, opacity: 0.07, floatAmplitude: 14, duration: 10 },
  { id: "d4", type: "diamond", x: 40, y: 5, scale: 0.55, blur: 1, opacity: 0.08, floatAmplitude: 16, duration: 8 },
  { id: "s4", type: "star", x: 20, y: 90, scale: 0.4, blur: 1.5, opacity: 0.06, floatAmplitude: 19, duration: 11 },
  { id: "c4", type: "crescent", x: 78, y: 35, scale: 0.65, blur: 0.5, opacity: 0.09, floatAmplitude: 11, duration: 7 },
];

const DENSITY_COUNT: Record<Density, number> = { sparse: 4, normal: 6, dense: 12 };

function DiamondSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 0l12 12-12 12L0 12 12 0zm0 4L4 12l8 8 8-8-8-8z" fill="#f5c842" fillRule="evenodd" />
    </svg>
  );
}

function CrescentSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 3a9 9 0 11-6 15.87A9 9 0 0015 3z"
        fill="#f5c842"
      />
    </svg>
  );
}

function StarSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l2.09 6.26H21l-5.55 4.03L17.55 18.53 12 14.47l-5.55 4.06L8.55 12.29 3 8.26h6.91L12 2z"
        fill="#f5c842"
      />
    </svg>
  );
}

const SHAPE_MAP = { diamond: DiamondSVG, crescent: CrescentSVG, star: StarSVG };

export function FloatingElements({ density = "normal" }: FloatingElementsProps) {
  const isMobile = useIsMobile();
  const count = isMobile ? Math.min(DENSITY_COUNT[density], 4) : DENSITY_COUNT[density];
  const shapes = ALL_SHAPES.slice(0, count);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}
      aria-hidden="true"
    >
      {shapes.map((s) => {
        const Shape = SHAPE_MAP[s.type];
        return (
          <motion.div
            key={s.id}
            animate={{ y: [0, -s.floatAmplitude, 0] }}
            transition={{ duration: s.duration, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              transform: `scale(${s.scale})`,
              filter: s.blur > 0 ? `blur(${s.blur}px)` : undefined,
              opacity: s.opacity,
            }}
          >
            <Shape />
          </motion.div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/FloatingElements.tsx
git commit -m "feat: add FloatingElements component for parallax decorative shapes"
```

---

## Task 9: Game Intensity Hook

**Files:**
- Create: `frontend/src/hooks/useGameIntensity.ts`

- [ ] **Step 1: Create the hook**

Create `frontend/src/hooks/useGameIntensity.ts`:

```typescript
import { useMemo } from "react";

type IntensityTier = "calm" | "building" | "intense";

interface GameIntensity {
  /** 0.0 to 1.0 progress through the game */
  ratio: number;
  tier: IntensityTier;
  /** Particle speed multiplier */
  particleSpeed: number;
  /** Particle count multiplier */
  particleMultiplier: number;
  /** Transition duration in ms */
  transitionDuration: number;
  /** Framer Motion transition ease */
  transitionEase: string;
  /** Timer pulse scale (for keyframe animation) */
  timerPulseScale: number;
  /** Whether to show screen edge glow */
  showEdgeGlow: boolean;
  /** Particle burst count on correct answer */
  correctBurstCount: number;
  /** Card shake amplitude (px) on wrong answer */
  wrongShakeAmplitude: number;
  /** Floating elements density */
  floatingDensity: "sparse" | "normal" | "dense";
  isCalm: boolean;
  isBuilding: boolean;
  isIntense: boolean;
}

export function useGameIntensity(
  questionIndex: number | undefined,
  totalQuestions: number | undefined,
): GameIntensity {
  return useMemo(() => {
    if (questionIndex == null || totalQuestions == null || totalQuestions === 0) {
      return makeIntensity(0);
    }
    const ratio = questionIndex / totalQuestions;
    return makeIntensity(ratio);
  }, [questionIndex, totalQuestions]);
}

function makeIntensity(ratio: number): GameIntensity {
  if (ratio < 0.34) {
    return {
      ratio,
      tier: "calm",
      particleSpeed: 1,
      particleMultiplier: 1,
      transitionDuration: 500,
      transitionEase: "easeOut",
      timerPulseScale: 1.0,
      showEdgeGlow: false,
      correctBurstCount: 0,
      wrongShakeAmplitude: 2,
      floatingDensity: "sparse",
      isCalm: true,
      isBuilding: false,
      isIntense: false,
    };
  }
  if (ratio < 0.67) {
    return {
      ratio,
      tier: "building",
      particleSpeed: 2,
      particleMultiplier: 1.5,
      transitionDuration: 350,
      transitionEase: "easeOut",
      timerPulseScale: 1.02,
      showEdgeGlow: false,
      correctBurstCount: 15,
      wrongShakeAmplitude: 4,
      floatingDensity: "normal",
      isCalm: false,
      isBuilding: true,
      isIntense: false,
    };
  }
  return {
    ratio,
    tier: "intense",
    particleSpeed: 3.3,
    particleMultiplier: 2,
    transitionDuration: 200,
    transitionEase: "easeOut",
    timerPulseScale: 1.05,
    showEdgeGlow: true,
    correctBurstCount: 30,
    wrongShakeAmplitude: 6,
    floatingDensity: "dense",
    isCalm: false,
    isBuilding: false,
    isIntense: true,
  };
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useGameIntensity.ts
git commit -m "feat: add useGameIntensity hook for escalating visual effects"
```

---

## Task 10: 3D Landing Hero — Gradient Mesh

**Files:**
- Create: `frontend/src/components/3d/GradientMesh.tsx`

- [ ] **Step 1: Create the gradient mesh shader component**

Create `frontend/src/components/3d/GradientMesh.tsx`:

```tsx
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;

  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.z += sin(pos.x * 2.0 + uTime * 0.3) * 0.15;
    pos.z += cos(pos.y * 2.0 + uTime * 0.2) * 0.1;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;

  // Simplex-style noise
  vec3 mod289(vec3 x) { return x - floor(x / 289.0) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x / 289.0) * 289.0; }
  vec3 permute(vec3 x) { return mod289((x * 34.0 + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405, 0.366025403784, -0.577350269189, 0.024390243902);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 a0 = x - floor(x + 0.5);
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    float n = snoise(vUv * 3.0 + uTime * 0.08);
    float n2 = snoise(vUv * 2.0 - uTime * 0.05);

    vec3 deepPurple = vec3(0.102, 0.039, 0.180);   // #1a0a2e
    vec3 midPurple  = vec3(0.165, 0.078, 0.259);    // #2a1442
    vec3 darkNavy   = vec3(0.039, 0.020, 0.118);    // #0a0520
    vec3 gold       = vec3(0.961, 0.784, 0.259);    // #f5c842

    vec3 color = mix(deepPurple, midPurple, smoothstep(-0.5, 0.5, n));
    color = mix(color, darkNavy, smoothstep(-0.3, 0.7, n2));
    color += gold * smoothstep(0.5, 0.8, n * n2) * 0.08;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function GradientMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -3]} scale={[12, 8, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/3d/GradientMesh.tsx
git commit -m "feat: add GradientMesh 3D shader component for landing hero"
```

---

## Task 11: 3D Landing Hero — Islamic Lattice

**Files:**
- Create: `frontend/src/components/3d/IslamicLattice.tsx`

- [ ] **Step 1: Create the lattice component**

Create `frontend/src/components/3d/IslamicLattice.tsx`:

```tsx
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/** Creates a single diamond shape as a 2D geometry with depth */
function DiamondGeometry() {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.5);
    s.lineTo(0.5, 0);
    s.lineTo(0, -0.5);
    s.lineTo(-0.5, 0);
    s.closePath();
    return s;
  }, []);

  const extrudeSettings = useMemo(
    () => ({ depth: 0.04, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2 }),
    [],
  );

  return <extrudeGeometry args={[shape, extrudeSettings]} />;
}

/** A grid of diamond shapes arranged in a lattice */
export function IslamicLattice() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.15;
    }
  });

  // Generate a 5x5 lattice of diamonds
  const diamonds = useMemo(() => {
    const items: { x: number; y: number; delay: number }[] = [];
    for (let row = -2; row <= 2; row++) {
      for (let col = -2; col <= 2; col++) {
        const offset = row % 2 === 0 ? 0 : 0.6;
        items.push({
          x: col * 1.2 + offset,
          y: row * 1.2,
          delay: (row + col) * 0.3,
        });
      }
    }
    return items;
  }, []);

  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} position={[0, 0, -1.5]}>
        {diamonds.map((d, i) => (
          <mesh key={i} position={[d.x, d.y, 0]}>
            <DiamondGeometry />
            <meshStandardMaterial
              color="#f5c842"
              emissive="#f5c842"
              emissiveIntensity={0.15}
              transparent
              opacity={0.25}
              metalness={0.6}
              roughness={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        {/* Gold point light filtering through the lattice */}
        <pointLight color="#f5c842" intensity={2} position={[0, 0, -1]} distance={8} />
      </group>
    </Float>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/3d/IslamicLattice.tsx
git commit -m "feat: add IslamicLattice 3D component for landing hero"
```

---

## Task 12: 3D Landing Hero — Crescent Moon

**Files:**
- Create: `frontend/src/components/3d/CrescentMoon3D.tsx`

- [ ] **Step 1: Create the crescent moon component**

Create `frontend/src/components/3d/CrescentMoon3D.tsx`:

```tsx
import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/** Creates a crescent shape by subtracting one circle from another */
function CrescentGeometry() {
  const shape = useMemo(() => {
    const outer = new THREE.Shape();
    // Outer circle (full moon)
    const outerRadius = 1;
    outer.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    // Inner circle (subtracted to create crescent)
    const hole = new THREE.Path();
    hole.absarc(0.4, 0.2, outerRadius * 0.8, 0, Math.PI * 2, true);
    outer.holes.push(hole);

    return outer;
  }, []);

  const extrudeSettings = useMemo(
    () => ({
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 4,
      curveSegments: 64,
    }),
    [],
  );

  return <extrudeGeometry args={[shape, extrudeSettings]} />;
}

/** Small sphere particle orbiting the crescent */
function OrbitingStar({
  radius,
  speed,
  offset,
  size,
}: {
  radius: number;
  speed: number;
  offset: number;
  size: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed + offset;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.y = Math.sin(t) * radius * 0.6; // Elliptical
    ref.current.position.z = Math.sin(t * 0.5) * 0.3;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial
        color="#f5c842"
        emissive="#f5c842"
        emissiveIntensity={0.8}
      />
    </mesh>
  );
}

export function CrescentMoon3D() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    // Gentle mouse-tracking rotation (max ±10°)
    const targetRotY = pointer.x * 0.175; // ~10° in radians
    const targetRotX = -pointer.y * 0.175;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05;
  });

  // Generate orbiting stars
  const stars = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        radius: 1.5 + Math.random() * 1.2,
        speed: 0.2 + Math.random() * 0.4,
        offset: (i / 24) * Math.PI * 2,
        size: 0.02 + Math.random() * 0.03,
      })),
    [],
  );

  return (
    <Float speed={0.8} rotationIntensity={0} floatIntensity={0.4}>
      <group ref={groupRef} position={[0, 0.3, 0]}>
        {/* Crescent mesh */}
        <mesh rotation={[0, 0, Math.PI * 0.1]}>
          <CrescentGeometry />
          <meshStandardMaterial
            color="#f5c842"
            emissive="#f5c842"
            emissiveIntensity={0.3}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>

        {/* Orbiting star particles */}
        {stars.map((s, i) => (
          <OrbitingStar key={i} {...s} />
        ))}
      </group>
    </Float>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/3d/CrescentMoon3D.tsx
git commit -m "feat: add CrescentMoon3D component with orbiting stars"
```

---

## Task 13: 3D Landing Hero — Scene Orchestrator

**Files:**
- Create: `frontend/src/components/3d/LandingHeroScene.tsx`

- [ ] **Step 1: Create the scene orchestrator**

Create `frontend/src/components/3d/LandingHeroScene.tsx`:

```tsx
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { GradientMesh } from "./GradientMesh";
import { IslamicLattice } from "./IslamicLattice";
import { CrescentMoon3D } from "./CrescentMoon3D";

export function LandingHeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
      }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 1.5]}
    >
      {/* Ambient + directional lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#f5c842" />

      {/* Layer 1: Gradient mesh (deepest) */}
      <GradientMesh />

      {/* Layer 2: Islamic lattice (midground) */}
      <IslamicLattice />

      {/* Layer 3: Crescent moon + orbiting stars (foreground) */}
      <CrescentMoon3D />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={0.4}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette
          offset={0.3}
          darkness={0.6}
          blendFunction={BlendFunction.NORMAL}
        />
        <ChromaticAberration
          offset={[0.001, 0.001] as any}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </Canvas>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes. The component tree-shakes Three.js modules it uses.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/3d/LandingHeroScene.tsx
git commit -m "feat: add LandingHeroScene orchestrator with post-processing"
```

---

## Task 14: Landing Page Integration — 3D Hero + Copy Changes

This is the largest task. It modifies the existing `LandingPage.tsx` to:
1. Lazy-load the 3D scene on desktop
2. Replace all Ramadan copy
3. Add ambient depth layers (aurora, particles, floating elements)

**Files:**
- Modify: `frontend/src/pages/LandingPage.tsx`

- [ ] **Step 1: Add lazy import and mobile detection at top of LandingPage.tsx**

At the top of `frontend/src/pages/LandingPage.tsx`, add these imports (after existing imports):

```tsx
import { lazy, Suspense } from "react";
import { useIsMobile } from "../hooks/useMobileDetect";
import { AuroraBackground } from "../components/AuroraBackground";
import { ParticleStarfield } from "../components/ParticleStarfield";
import { FloatingElements } from "../components/FloatingElements";

const LandingHeroScene = lazy(() =>
  import("../components/3d/LandingHeroScene").then((m) => ({ default: m.LandingHeroScene }))
);
```

- [ ] **Step 2: Add mobile detection hook and 3D scene to the hero section**

Inside the `LandingPage` component function, add near the top:

```tsx
const isMobile = useIsMobile();
```

In the hero section (around the area with the canvas grain effect, stars, crescent moon), add the 3D scene for desktop. Wrap the existing hero `<section>` content. Before the hero `<section>`, add the ambient layers:

```tsx
{/* Ambient depth layers */}
<AuroraBackground />
<ParticleStarfield />
<FloatingElements density="normal" />

{/* 3D Hero — desktop only */}
{!isMobile && (
  <Suspense fallback={null}>
    <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
      <LandingHeroScene />
    </div>
  </Suspense>
)}
```

The existing 2D crescent moon, stars, and lantern elements should be wrapped in a conditional so they only show on mobile:

```tsx
{isMobile && (
  <>
    {/* Existing CrescentMoon, star field, lanterns — keep as-is for mobile fallback */}
  </>
)}
```

The text content remains on top of both (3D scene on desktop, 2D fallback on mobile) with `position: relative; z-index: 2`.

- [ ] **Step 3: Replace all Ramadan copy**

Make these exact text replacements in `LandingPage.tsx`:

1. `Ramadan 2026` → `Live Islamic Quiz`
2. `CELEBRATE` → `GATHER.` (the line before `RAMADAN.`)
3. `RAMADAN.` → `PLAY.`
4. `A live multiplayer quiz game built for Ramadan nights.` → `A live multiplayer quiz game for your community.`
5. `"No Ramadan theme"` → `"No Islamic design"`
6. `"Built for Ramadan"` → `"Built for the Ummah"`
7. `label: "Ramadan-Themed"` → `label: "Islamic Design"`
8. `title: "Designed for the occasion"` → `title: "Designed with intention"`
9. `built with intention, not as an afterthought.` → `crafted for the community, not as an afterthought.`
10. `Crown your Ramadan champion.` → `Crown your champion.`
11. `Ramadan Mubarak. Enter a game code to join your host's session.` → `Assalamu Alaikum. Enter a game code to join your host's session.`

- [ ] **Step 4: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes. No "Ramadan" text remains (except possibly in comments).

- [ ] **Step 5: Verify no Ramadan references remain**

```bash
cd frontend && grep -r "Ramadan" src/pages/LandingPage.tsx
```

Expected: No output (or only comments).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/LandingPage.tsx
git commit -m "feat: integrate 3D hero scene + replace Ramadan copy on landing page"
```

---

## Task 15: Integrate Ambient Depth into Auth & Join Pages

**Files:**
- Modify: `frontend/src/pages/LoginPage.tsx`
- Modify: `frontend/src/pages/RegisterPage.tsx`
- Modify: `frontend/src/pages/JoinPage.tsx`

- [ ] **Step 1: Update LoginPage.tsx**

Add imports at top of `frontend/src/pages/LoginPage.tsx`:

```tsx
import { AuroraBackground } from "../components/AuroraBackground";
import { ParticleStarfield } from "../components/ParticleStarfield";
import { FloatingElements } from "../components/FloatingElements";
```

Add the ambient layers inside the page's root container, before other content:

```tsx
<AuroraBackground />
<ParticleStarfield />
<FloatingElements density="sparse" />
```

Wrap the form card with `TiltCard`:

```tsx
import { TiltCard } from "../components/TiltCard";
```

Replace the form's outer `<div>` (the one with the card background styling) with `<TiltCard style={...}>`.

- [ ] **Step 2: Update RegisterPage.tsx**

Same pattern as LoginPage — add `AuroraBackground`, `ParticleStarfield`, `FloatingElements`, and wrap the form card with `TiltCard`. RegisterPage has the same structure as LoginPage.

- [ ] **Step 3: Update JoinPage.tsx**

Same pattern — add ambient layers and `TiltCard` around the join code input card.

- [ ] **Step 4: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/LoginPage.tsx frontend/src/pages/RegisterPage.tsx frontend/src/pages/JoinPage.tsx
git commit -m "feat: add ambient depth to login, register, and join pages"
```

---

## Task 16: Integrate Ambient Depth into Lobby Pages

**Files:**
- Modify: `frontend/src/pages/PlayerLobbyPage.tsx`
- Modify: `frontend/src/pages/HostLobbyPage.tsx`

- [ ] **Step 1: Update PlayerLobbyPage.tsx**

Add imports:

```tsx
import { AuroraBackground } from "../components/AuroraBackground";
import { ParticleStarfield } from "../components/ParticleStarfield";
import { FloatingElements } from "../components/FloatingElements";
import { TiltCard } from "../components/TiltCard";
```

Add ambient layers inside root container. Wrap player name cards with `TiltCard` if they have card styling.

- [ ] **Step 2: Update HostLobbyPage.tsx**

Same pattern — add ambient layers. Wrap the lobby card/content area with appropriate depth layers.

- [ ] **Step 3: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/PlayerLobbyPage.tsx frontend/src/pages/HostLobbyPage.tsx
git commit -m "feat: add ambient depth to lobby pages"
```

---

## Task 17: Escalating Intensity on PlayerGamePage

This is the core gameplay experience — where escalating intensity matters most.

**Files:**
- Modify: `frontend/src/pages/PlayerGamePage.tsx`

- [ ] **Step 1: Add imports**

Add to top of `frontend/src/pages/PlayerGamePage.tsx`:

```tsx
import { AuroraBackground } from "../components/AuroraBackground";
import { ParticleStarfield } from "../components/ParticleStarfield";
import { FloatingElements } from "../components/FloatingElements";
import { TiltCard } from "../components/TiltCard";
import { useGameIntensity } from "../hooks/useGameIntensity";
```

- [ ] **Step 2: Wire up the intensity hook**

Inside the component, after the existing state declarations, add:

```tsx
const intensity = useGameIntensity(
  currentQuestion?.question_index,
  currentQuestion?.total_questions,
);
```

Where `currentQuestion` is the current `QuestionPayload` from the WebSocket state.

- [ ] **Step 3: Add ambient layers with intensity-driven props**

Add inside the root container of each game phase (question, reveal, leaderboard):

```tsx
<AuroraBackground />
<ParticleStarfield speed={intensity.particleSpeed} countMultiplier={intensity.particleMultiplier} />
<FloatingElements density={intensity.floatingDensity} />
```

- [ ] **Step 4: Add edge glow for intense tier**

Add a conditional gold edge glow overlay:

```tsx
{intensity.showEdgeGlow && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      zIndex: 1,
      boxShadow: "inset 0 0 80px 20px rgba(245,200,66,0.08)",
    }}
    aria-hidden="true"
  />
)}
```

- [ ] **Step 5: Wrap answer option buttons with TiltCard**

For each answer option in the question phase, wrap the button/card element with `<TiltCard>`:

```tsx
<TiltCard key={option.id}>
  {/* existing option button content */}
</TiltCard>
```

- [ ] **Step 6: Add answer feedback animations**

After a player submits an answer and the reveal comes in, animate the selected card based on correctness and intensity:

For correct answers — apply a gold glow via inline style animation:
```tsx
style={{
  boxShadow: isCorrect
    ? `0 0 ${20 + intensity.correctBurstCount}px rgba(245,200,66,0.5)`
    : undefined,
}}
```

For wrong answers — use Framer Motion's `animate` prop for a shake:
```tsx
<motion.div
  animate={isWrong ? {
    x: [0, -intensity.wrongShakeAmplitude, intensity.wrongShakeAmplitude, -intensity.wrongShakeAmplitude, 0],
  } : {}}
  transition={{ duration: 0.3 }}
>
```

- [ ] **Step 7: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/PlayerGamePage.tsx
git commit -m "feat: add escalating intensity and 3D tilt to player game page"
```

---

## Task 18: Escalating Intensity on HostGamePage

**Files:**
- Modify: `frontend/src/pages/HostGamePage.tsx`

- [ ] **Step 1: Add imports**

Add to top of `frontend/src/pages/HostGamePage.tsx`:

```tsx
import { AuroraBackground } from "../components/AuroraBackground";
import { ParticleStarfield } from "../components/ParticleStarfield";
import { FloatingElements } from "../components/FloatingElements";
import { useGameIntensity } from "../hooks/useGameIntensity";
```

- [ ] **Step 2: Wire up intensity hook**

Inside the component, add:

```tsx
const intensity = useGameIntensity(
  currentQuestion?.question_index,
  currentQuestion?.total_questions,
);
```

Where `currentQuestion` is the current question state from the WebSocket messages.

- [ ] **Step 3: Add ambient layers with intensity props**

Add inside each game phase's root container:

```tsx
<AuroraBackground />
<ParticleStarfield speed={intensity.particleSpeed} countMultiplier={intensity.particleMultiplier} />
<FloatingElements density={intensity.floatingDensity} />
```

- [ ] **Step 4: Add edge glow for intense tier**

Same as PlayerGamePage — add the conditional gold edge glow overlay.

- [ ] **Step 5: Add timer pulse animation**

On the timer circle element, apply an intensity-driven pulse:

```tsx
<motion.div
  animate={{
    scale: [1, intensity.timerPulseScale, 1],
  }}
  transition={{
    duration: 1,
    repeat: Infinity,
    ease: "easeInOut",
  }}
>
  {/* existing timer circle content */}
</motion.div>
```

- [ ] **Step 6: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/HostGamePage.tsx
git commit -m "feat: add escalating intensity to host game page"
```

---

## Task 19: Enhanced Podium Screen

**Files:**
- Modify: `frontend/src/components/PodiumScreen.tsx`

- [ ] **Step 1: Add imports**

Add to top of `frontend/src/components/PodiumScreen.tsx`:

```tsx
import { AuroraBackground } from "./AuroraBackground";
import { ParticleStarfield } from "./ParticleStarfield";
import { FloatingElements } from "./FloatingElements";
import { TiltCard } from "./TiltCard";
```

- [ ] **Step 2: Add max-intensity ambient layers**

Inside the podium root container:

```tsx
<AuroraBackground />
<ParticleStarfield speed={3.3} countMultiplier={2} />
<FloatingElements density="dense" />
```

- [ ] **Step 3: Add staggered entrance for podium positions**

Wrap each podium position (3rd, 2nd, 1st) with a `motion.div` that staggers entrance:

```tsx
{/* 3rd place */}
<motion.div
  initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
  transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
>
  {/* existing 3rd place content */}
</motion.div>

{/* 2nd place */}
<motion.div
  initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
  transition={{ delay: 1.0, duration: 0.6, ease: "easeOut" }}
>
  {/* existing 2nd place content */}
</motion.div>

{/* 1st place */}
<motion.div
  initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
  transition={{ delay: 1.5, duration: 0.6, ease: "easeOut" }}
>
  {/* existing 1st place content */}
</motion.div>
```

- [ ] **Step 4: Add 3D tilt to podium cards**

Wrap each podium winner card with `<TiltCard>`.

- [ ] **Step 5: Add gold glow pulse on 1st place**

On the 1st place card, add a pulsing gold glow:

```tsx
<motion.div
  animate={{
    boxShadow: [
      "0 0 20px rgba(245,200,66,0.3)",
      "0 0 40px rgba(245,200,66,0.5)",
      "0 0 20px rgba(245,200,66,0.3)",
    ],
  }}
  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
>
  {/* 1st place card content */}
</motion.div>
```

- [ ] **Step 6: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/PodiumScreen.tsx
git commit -m "feat: enhance podium screen with max celebration effects"
```

---

## Task 20: Update AdminDashboardPage + App.tsx

These just need the CSS class rename (already done in Task 2) and optionally ambient layers for the admin dashboard.

**Files:**
- Modify: `frontend/src/pages/AdminDashboardPage.tsx`

- [ ] **Step 1: Add ambient layers to AdminDashboardPage**

Add imports and ambient layers (aurora + particles with sparse density). The admin dashboard is a work area so keep effects subtle:

```tsx
import { AuroraBackground } from "../components/AuroraBackground";
import { ParticleStarfield } from "../components/ParticleStarfield";
```

Add inside root container:

```tsx
<AuroraBackground />
<ParticleStarfield />
```

No floating elements or tilt cards on admin pages — keep it clean for work.

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/AdminDashboardPage.tsx
git commit -m "feat: add subtle ambient depth to admin dashboard"
```

---

## Task 21: Full Integration Test

- [ ] **Step 1: Run the full check script**

```bash
./scripts/check.sh
```

Expected: All checks pass (build, lint, typecheck, tests).

- [ ] **Step 2: If lint/typecheck fails, fix issues**

Common issues to watch for:
- Unused imports (if you imported something but used a different name)
- TypeScript errors on Three.js types (may need `// @ts-expect-error` for some R3F props)
- ESLint warnings on `any` types in shader-related code

Fix any issues and re-run until green.

- [ ] **Step 3: Start dev environment and visually verify**

```bash
docker compose up --build
```

Open `http://localhost:5173` and check:
- Landing page: 3D hero scene visible on desktop, aurora + particles on mobile (resize browser)
- Login/Register/Join: Particle starfield + aurora + tilt on form cards
- Create a test game and play through: verify escalating intensity across questions
- Podium: max celebration effects, staggered entrances

- [ ] **Step 4: Commit any remaining fixes**

```bash
git add -A
git commit -m "fix: resolve lint/type/integration issues from 3D UI overhaul"
```

---

## Task 22: Final Cleanup + PR

- [ ] **Step 1: Run full checks one final time**

```bash
./scripts/check.sh
```

Expected: Exit 0.

- [ ] **Step 2: Verify no Ramadan references remain in user-facing code**

```bash
grep -r "Ramadan" frontend/src/ --include="*.tsx" --include="*.ts" --include="*.css" | grep -v test | grep -v node_modules
```

Expected: No output (test files may still reference "Ramadan Trivia" as quiz fixture data, which is expected).

- [ ] **Step 3: Create PR**

```bash
gh pr create --base dev --title "feat: 3D alive UI overhaul + general Islamic rebrand" --body "$(cat <<'EOF'
## Summary
- Full 3D React Three Fiber hero scene on landing page (gradient mesh + Islamic lattice + crescent moon with orbiting stars)
- Ambient depth system on all pages (gold particle starfield, aurora gradient, floating geometric elements)
- 3D tilt hover effect on interactive cards
- Escalating visual intensity during gameplay (calm → building → intense)
- Enhanced podium celebration with staggered entrances and gold glow
- Replaced all Ramadan-specific copy with general Islamic community language
- Renamed CSS classes from ramadan to hilal
- Desktop-first with graceful mobile degradation (no WebGL on mobile)

## Test plan
- [ ] Landing page 3D hero renders on desktop
- [ ] Landing page falls back to 2D on mobile (resize to <768px)
- [ ] Particle starfield visible on all pages
- [ ] 3D tilt works on hover (cards, form elements)
- [ ] Game intensity escalates across questions (particles speed up, effects intensify)
- [ ] Podium shows staggered entrances and gold glow on 1st place
- [ ] No "Ramadan" text in user-facing UI
- [ ] All existing tests pass
- [ ] Build succeeds with no TypeScript errors

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
