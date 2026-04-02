# General Islamic Rebrand — Design Spec

**Date:** 2026-04-01
**Goal:** Remove Ramadan-specific copy and class names, making Hilal a year-round Islamic quiz app while preserving all visual identity (crescent moons, lanterns, stars, geometric patterns, gold-on-purple palette, prayer arc transition, Arabic dua).

## What Changes

### 1. Landing Page Copy (`frontend/src/pages/LandingPage.tsx`)

| Location | Current | New |
|----------|---------|-----|
| Line 284 — tagline above title | `Ramadan 2026` | `Live Islamic Quiz` |
| Lines 305-312 — hero headline | `CELEBRATE` / `RAMADAN.` | `GATHER.` / `PLAY.` |
| Line 330-331 — hero headline continued | `QUIZ YOUR` / `WORLD.` | `QUIZ YOUR` / `WORLD.` (unchanged) |
| Line 349 — hero subtext | `A live multiplayer quiz game built for Ramadan nights. Challenge friends, test your knowledge, and compete in real time.` | `A live multiplayer quiz game for your community. Challenge friends, test your knowledge, and compete in real time.` |
| Line 490 — Kahoot comparison item | `No Ramadan theme` | `No Islamic design` |
| Line 530 — Hilal comparison item | `Built for Ramadan` | `Built for the Ummah` |
| Line 559 — feature strip label | `Ramadan-Themed` | `Islamic Design` |
| Line 560 — feature strip title | `Designed for the occasion` | `Designed with intention` |
| Line 561 — feature strip body | `Prayer arc transitions, crescent moon motifs, and golden design tokens — built with intention, not as an afterthought.` | `Prayer arc transitions, crescent moon motifs, and golden design tokens — crafted for the community, not as an afterthought.` |
| Line 664 — step 3 body | `Questions appear in real time. The prayer arc counts you in. Scores update live. Crown your Ramadan champion.` | `Questions appear in real time. The prayer arc counts you in. Scores update live. Crown your champion.` |
| Line 756 — CTA section | `Ramadan Mubarak. Enter a game code to join your host's session.` | `Assalamu Alaikum. Enter a game code to join your host's session.` |

### 2. CSS Class Renames (`frontend/src/index.css`)

| Current | New |
|---------|-----|
| `.bg-ramadan` (line 33) | `.bg-hilal` |
| `.ramadan-pattern` (line 40) | `.hilal-pattern` |

### 3. CSS Class References (all files using `ramadan-pattern` or `bg-ramadan`)

Every `className="ramadan-pattern"` becomes `className="hilal-pattern"`. Files affected:

- `frontend/src/App.tsx` (line 23)
- `frontend/src/pages/PlayerLobbyPage.tsx` (lines 105, 125, 160, 191)
- `frontend/src/pages/HostLobbyPage.tsx` (lines 107, 117)
- `frontend/src/pages/LoginPage.tsx` (line 41)
- `frontend/src/pages/RegisterPage.tsx` (line 48)
- `frontend/src/pages/AdminDashboardPage.tsx` (line 57)
- `frontend/src/pages/HostGamePage.tsx` (lines 230, 263, 294)
- `frontend/src/components/PodiumScreen.tsx` (line 195)
- `frontend/src/pages/JoinPage.tsx` (line 52)
- `frontend/src/pages/PlayerGamePage.tsx` (lines 181, 204, 234, 268, 332, 416)

Note: `bg-ramadan` does not appear to be used in any component — only defined in CSS. If confirmed during implementation, just rename the definition.

### 4. Test File (`frontend/src/test/SessionHistoryPage.test.tsx`)

The test data uses `"Ramadan Trivia"` as a quiz title. This is test fixture data, not user-facing copy. **Leave as-is** — quiz titles are user-created content and "Ramadan Trivia" is a valid quiz name.

## What Stays (Explicitly)

- All visual elements: crescent moons, lanterns, stars, geometric arabesque patterns
- Gold-on-deep-purple color palette (`#f5c842`, `#1a0a2e`, `#ff6b35`)
- Prayer Arc Transition component with prayer names (Fajr, Dhuhr, Asr, Maghrib, Isha)
- Arabic dua on podium screen ("ربِ زِدنِي علِماً")
- All animations (floating lanterns, twinkling stars, parallax crescent, confetti)
- Typography (Poppins)
- Audio files
- All layouts and component structure

## Scope

This is a **copy + class rename** pass. No new components, no layout changes, no color changes, no animation changes. The diff should be small and focused.
