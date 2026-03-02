# Prayer Arc Transition — Design Doc

**Issue:** #21
**Date:** 2026-03-01
**Branch:** feat/21-prayer-arc-transition (off `release/v1.0.0`)

## Problem

When the host clicks "Next Question" or "Show Final Results", the next screen renders immediately with no branded transition. This feels abrupt and misses an opportunity for a polished Ramadan-themed moment.

## Solution

A `PrayerArcTransition` component renders a flat-bottom semicircle SVG that animates left → right over 1.5 s, lighting up each of the 5 daily prayer labels as the stroke passes through them. After completion, the host's WS `next_question` message fires and the question/podium fades in normally.

## Architecture

### New file: `frontend/src/components/PrayerArcTransition.tsx`

- Props: `onComplete: () => void`
- SVG viewBox `0 0 400 220`, flat-bottom semicircle path from `(20, 200)` to `(380, 200)`, peak at `(200, 20)`
- Arc animated via CSS `stroke-dashoffset`: `totalLength → 0` over 1500 ms
- 5 dots at angles 180°, 135°, 90°, 45°, 0° (Fajr, Dhuhr, Asr, Maghrib, Isha)
- Dot positions computed via trig: `cx = centerX + r·cos(angle)`, `cy = centerY - r·sin(angle)`
- Each dot lights up via `setTimeout` at `(dotIndex / 4) * 1500 ms`
- `onComplete` called at 1600 ms (1500 ms animation + 100 ms buffer)
- Dark background `#1a0a2e` matching game UI, gold arc stroke `#f5c842`

### Modified: `frontend/src/pages/HostGamePage.tsx`

- Add `"arc_transition"` to `GamePhase` type
- "Next Question" and "Show Final Results" button handler sets `phase = "arc_transition"` instead of directly calling `send(next_question)`
- Render `<PrayerArcTransition onComplete={() => send({ type: "next_question", payload: {} })} />` when `phase === "arc_transition"`

## Data Flow

```
Host clicks button
  → phase = "arc_transition"
  → <PrayerArcTransition> renders, arc animates, dots light up
  → onComplete() fires at 1600ms
  → WS next_question sent to server
  → Server broadcasts question/game_over to all clients
  → phase updates (question | podium) via WS message handler
  → fade-in renders next screen
```

## Player screens

Unaffected. Players see "Waiting for host…" until the `question` WS message arrives, which now just fires ~1.6 s later than before.

## Testing

Vitest + React Testing Library:
- Render `<PrayerArcTransition onComplete={vi.fn()} />`
- Assert 5 prayer labels render (Fajr, Dhuhr, Asr, Maghrib, Isha)
- Use `vi.useFakeTimers()`, advance by 1600 ms, assert `onComplete` called once

## Approach chosen

CSS `stroke-dashoffset` animation + `setTimeout` for dot lighting. No new dependencies. Matches issue spec exactly.
