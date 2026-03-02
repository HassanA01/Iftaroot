# Prayer Arc Transition Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show a Ramadan-themed prayer arc animation between every leaderboard → next screen transition on the host game page.

**Architecture:** A standalone `PrayerArcTransition` component renders a flat-bottom SVG semicircle whose stroke animates left → right via `stroke-dashoffset`. Five prayer label dots light up via `setTimeout` at proportional timestamps. `HostGamePage` adds an `"arc_transition"` phase that renders this component; `onComplete` fires the `next_question` WS message after animation completes.

**Tech Stack:** React 19, TypeScript, SVG, CSS animations, Framer Motion (already in project), Vitest + React Testing Library, `vi.useFakeTimers()`

---

### Task 1: Create feature branch

**Files:**
- No files changed — just branch setup

**Step 1: Create and switch to feature branch off `release/v1.0.0`**

```bash
git checkout release/v1.0.0
git checkout -b feat/21-prayer-arc-transition
```

**Step 2: Verify branch**

```bash
git branch --show-current
```
Expected output: `feat/21-prayer-arc-transition`

---

### Task 2: Write failing test for `PrayerArcTransition`

**Files:**
- Create: `frontend/src/test/PrayerArcTransition.test.tsx`

**Step 1: Write the test file**

```tsx
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PrayerArcTransition } from "../components/PrayerArcTransition";

describe("PrayerArcTransition", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders all 5 prayer labels", () => {
    render(<PrayerArcTransition onComplete={vi.fn()} />);
    expect(screen.getByText("Fajr")).toBeInTheDocument();
    expect(screen.getByText("Dhuhr")).toBeInTheDocument();
    expect(screen.getByText("Asr")).toBeInTheDocument();
    expect(screen.getByText("Maghrib")).toBeInTheDocument();
    expect(screen.getByText("Isha")).toBeInTheDocument();
  });

  it("calls onComplete after 1600ms", () => {
    const onComplete = vi.fn();
    render(<PrayerArcTransition onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("does not call onComplete before animation ends", () => {
    const onComplete = vi.fn();
    render(<PrayerArcTransition onComplete={onComplete} />);
    act(() => {
      vi.advanceTimersByTime(1599);
    });
    expect(onComplete).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run the test to verify it fails**

Run from project root:
```bash
docker compose exec frontend pnpm exec vitest run src/test/PrayerArcTransition.test.tsx
```
Expected: FAIL with "Cannot find module '../components/PrayerArcTransition'"

---

### Task 3: Implement `PrayerArcTransition` component

**Files:**
- Create: `frontend/src/components/PrayerArcTransition.tsx`

**Step 1: Create the component**

```tsx
import { useEffect, useState } from "react";

const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

// SVG dimensions
const W = 400;
const H = 220;
const CX = W / 2;      // 200
const CY = H - 20;     // 200  (flat bottom, center of the circle)
const R = CX - 20;     // 180  (radius, so left tip = 20, right tip = 380)

// Angles for each prayer: 180° (left) → 135° → 90° (top) → 45° → 0° (right)
// SVG y-axis is flipped so we subtract from CY
const ANGLES_DEG = [180, 135, 90, 45, 0];

function polarToCartesian(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + R * Math.cos(rad),
    y: CY - R * Math.sin(rad),
  };
}

// SVG path: semicircle from left (180°) to right (0°) via top
// M = move to left tip, A = arc to right tip (large-arc-flag=0, sweep=1)
const LEFT = polarToCartesian(180);
const RIGHT = polarToCartesian(0);
const ARC_PATH = `M ${LEFT.x} ${LEFT.y} A ${R} ${R} 0 0 1 ${RIGHT.x} ${RIGHT.y}`;

// Approximate arc length for a semicircle
const ARC_LENGTH = Math.PI * R;

const ANIMATION_MS = 1500;
const COMPLETE_DELAY_MS = 100;

interface Props {
  onComplete: () => void;
}

export function PrayerArcTransition({ onComplete }: Props) {
  const [litDots, setLitDots] = useState<boolean[]>([false, false, false, false, false]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Light up each dot at its proportional timestamp
    ANGLES_DEG.forEach((_, i) => {
      const delay = (i / (PRAYERS.length - 1)) * ANIMATION_MS;
      timers.push(
        setTimeout(() => {
          setLitDots((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, delay),
      );
    });

    // Fire onComplete after animation + buffer
    timers.push(setTimeout(onComplete, ANIMATION_MS + COMPLETE_DELAY_MS));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center"
      style={{ background: "#1a0a2e" }}
    >
      <style>{`
        @keyframes arcDraw {
          from { stroke-dashoffset: ${ARC_LENGTH}; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ maxWidth: "90vw" }}
        aria-hidden="true"
      >
        {/* Dim track */}
        <path
          d={ARC_PATH}
          fill="none"
          stroke="rgba(245,200,66,0.15)"
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Animated fill */}
        <path
          d={ARC_PATH}
          fill="none"
          stroke="#f5c842"
          strokeWidth={4}
          strokeLinecap="round"
          style={{
            strokeDasharray: ARC_LENGTH,
            strokeDashoffset: ARC_LENGTH,
            animation: `arcDraw ${ANIMATION_MS}ms linear forwards`,
            filter: "drop-shadow(0 0 8px rgba(245,200,66,0.7))",
          }}
        />

        {/* Dots */}
        {ANGLES_DEG.map((angle, i) => {
          const pos = polarToCartesian(angle);
          const lit = litDots[i];
          return (
            <circle
              key={PRAYERS[i]}
              cx={pos.x}
              cy={pos.y}
              r={6}
              fill={lit ? "#f5c842" : "rgba(245,200,66,0.25)"}
              style={{
                transition: "fill 0.3s ease",
                filter: lit ? "drop-shadow(0 0 6px rgba(245,200,66,0.9))" : "none",
              }}
            />
          );
        })}
      </svg>

      {/* Labels */}
      <div
        style={{
          display: "flex",
          width: W,
          maxWidth: "90vw",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        {PRAYERS.map((name, i) => (
          <span
            key={name}
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.05em",
              color: litDots[i] ? "#f5c842" : "rgba(245,200,66,0.3)",
              transition: "color 0.3s ease",
              textAlign: "center",
              width: 56,
            }}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Run the tests to verify they pass**

```bash
docker compose exec frontend pnpm exec vitest run src/test/PrayerArcTransition.test.tsx
```
Expected: 3 tests pass.

**Step 3: Commit**

```bash
git add frontend/src/components/PrayerArcTransition.tsx frontend/src/test/PrayerArcTransition.test.tsx
git commit -m "feat(#21): add PrayerArcTransition component with tests"
```

---

### Task 4: Integrate into `HostGamePage`

**Files:**
- Modify: `frontend/src/pages/HostGamePage.tsx:38` (GamePhase type)
- Modify: `frontend/src/pages/HostGamePage.tsx:126` (handleNextQuestion)
- Modify: `frontend/src/pages/HostGamePage.tsx:161-186` (leaderboard phase render)

**Step 1: Update `GamePhase` type (line 38)**

Old:
```ts
type GamePhase = "waiting" | "question" | "reveal" | "leaderboard" | "podium";
```

New:
```ts
type GamePhase = "waiting" | "question" | "reveal" | "leaderboard" | "arc_transition" | "podium";
```

**Step 2: Add import for `PrayerArcTransition` (top of file, after existing component imports)**

Add after line 11 (`import { ConfirmModal } ...`):
```ts
import { PrayerArcTransition } from "../components/PrayerArcTransition";
```

**Step 3: Replace `handleNextQuestion` (line 126)**

Old:
```ts
const handleNextQuestion = () => send({ type: "next_question", payload: {} });
```

New:
```ts
const handleNextQuestion = () => setPhase("arc_transition");
```

**Step 4: Add `arc_transition` phase render block — insert between the `podium` check (line 159) and the `leaderboard` check (line 161)**

After:
```tsx
  if (phase === "podium") {
    return <PodiumScreen entries={podium} onEnd={handleEndGame} endLabel="Back to Dashboard" />;
  }
```

Insert:
```tsx
  if (phase === "arc_transition") {
    return (
      <PrayerArcTransition
        onComplete={() => send({ type: "next_question", payload: {} })}
      />
    );
  }
```

**Step 5: Run full test suite to check for regressions**

```bash
docker compose exec frontend pnpm exec vitest run
```

Expected: All tests pass. Note: the existing test `"sends next_question via WS when host clicks Next Question"` will now FAIL because clicking the button no longer immediately calls `send` — it sets phase to `"arc_transition"` first. Fix this in the next step.

---

### Task 5: Update `HostGamePage` tests for new arc transition flow

**Files:**
- Modify: `frontend/src/test/HostGamePage.test.tsx`

The test `"sends next_question via WS when host clicks Next Question"` (line 107) clicks the button and asserts `mockSend` was called with `next_question`. With the arc transition phase in place, clicking the button now renders `<PrayerArcTransition>` instead of immediately sending. We need to verify the new behaviour: clicking Next Question renders the arc (shows prayer labels), and after the animation `onComplete` fires `send`.

**Step 1: Add fake timer setup to the file's existing `beforeEach`/`afterEach`, and update the failing test**

At the top of `frontend/src/test/HostGamePage.test.tsx`, the describe block's `beforeEach` currently only clears mocks. Update the failing test to use fake timers and advance past the animation:

Replace the existing test at lines 107–119:

```tsx
it("shows arc transition then sends next_question after animation", async () => {
  vi.useFakeTimers();
  renderHostGame();
  act(() => capturedOnMessage!(fakeQuestion));
  act(() =>
    capturedOnMessage!({
      type: "leaderboard",
      payload: { entries: [{ player_id: "p1", name: "Alice", score: 800, rank: 1 }] },
    }),
  );

  const btn = screen.getByRole("button", { name: /next question/i });
  await userEvent.click(btn);

  // Arc transition is now showing — prayer labels visible, send not yet called
  expect(screen.getByText("Fajr")).toBeInTheDocument();
  expect(mockSend).not.toHaveBeenCalled();

  // Advance past animation
  act(() => {
    vi.advanceTimersByTime(1600);
  });

  expect(mockSend).toHaveBeenCalledWith({ type: "next_question", payload: {} });
  vi.useRealTimers();
});
```

**Step 2: Run tests**

```bash
docker compose exec frontend pnpm exec vitest run src/test/HostGamePage.test.tsx
```
Expected: All 8 tests pass (the replaced test now has a new name, count stays the same).

**Step 3: Run all tests**

```bash
docker compose exec frontend pnpm exec vitest run
```
Expected: All tests pass.

**Step 4: Commit**

```bash
git add frontend/src/pages/HostGamePage.tsx frontend/src/test/HostGamePage.test.tsx
git commit -m "feat(#21): integrate PrayerArcTransition into HostGamePage"
```

---

### Task 6: Run full check suite and open PR

**Step 1: Run all checks**

```bash
./scripts/check.sh
```
Expected: `✓ all checks passed`

**Step 2: Push branch**

```bash
git push -u origin feat/21-prayer-arc-transition
```

**Step 3: Open PR targeting `release/v1.0.0`**

```bash
gh pr create \
  --base release/v1.0.0 \
  --title "feat(#21): prayer arc transition between questions" \
  --body "$(cat <<'EOF'
## Closes

Closes #21

## Summary

- New `PrayerArcTransition` component: flat-bottom SVG semicircle with `stroke-dashoffset` animation (1.5 s), 5 prayer dots (Fajr → Isha) that light up sequentially
- `HostGamePage` now sets `phase = "arc_transition"` when host clicks Next Question or Show Final Results; the `next_question` WS message fires only after the animation completes via `onComplete`
- Player screens unaffected — they see "Waiting for host…" ~1.6 s longer

## How to test

1. Start a game session as host
2. Play through a question to reach the leaderboard
3. Click **Next Question** — the prayer arc should animate before the next question appears
4. On the last question, click **Show Final Results** — arc plays before podium
5. Verify player screens remain on "Waiting for host…" during the arc
EOF
)"
```

**Step 4: Report the PR URL**
