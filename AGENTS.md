# AGENTS.md — How the AI should work on this project

> Cursor reads this file automatically as context. Keep it short and enforceable.
> Read `GAME_DESIGN.md` (vision) and `ARCHITECTURE.md` (build) before any non-trivial task.

---

## Project in one line

A retention-driven, English-language, *World of Wonders*-style word puzzle game with a
*Lord of the Rings*-style journey (themes → entities → levels), built in React Native + Expo + Zustand + TypeScript.

---

## Non-negotiable design invariants

Do not violate these without an explicit instruction to change the design docs first:

1. **Retention-driven, not premium.** Decisions favor long-term engagement and ad/IAP revenue.
2. **English words only.** All words, lore, dialogue in English.
3. **Two-layer content.** Boss levels = authored story + twist. Other levels = relaxed, data-only.
4. **Few mechanics, lots of data.** A level is JSON, not code. New code only for a genuinely new twist.
5. **Stress is seasoning.** Timers/scramble/darkness appear only in rare boss levels; bulk play is calm flow.
6. **Ads are an optional reward, never a punishment.** Shadow Fatigue gates *bonuses*, it does not penalize.
7. **Vertical slice before horizontal content.** Prove "it's fun" with one of everything before scaling.

---

## Workflow rules

- **Small, vertical tasks.** One feature loop at a time (e.g. "the timer twist", "the map fog state").
- **Keep logic pure & testable.** Puzzle engine has no React; it's unit-tested. Put feel-based numbers
  (timer length, hint counts, fatigue rate) in config, not hardcoded.
- **Respect the folder boundaries** in `ARCHITECTURE.md`: `content/` and `data/` are logic-free.
- **Type-first.** Define/extend types in `src/types/` before wiring features to data.
- **After substantive edits**, run type-check + lint and fix what you introduced.

## Self-evaluation honesty (critical)

- You **may** verify: types, lint, unit tests, build success, log output.
- You **may not** claim a puzzle is "fun", a timer "feels right", or touch "feels good" — that is
  validated by a human on a real device. Flag these for manual testing instead of self-rating them.

## Scope discipline

- This game's scope is already large. **Do not add new systems** (e.g. a sci-fi/space mode) unless
  the user explicitly asks. If you think something is out of scope, say so before building it.
- Prefer extending existing systems with data over inventing new ones.

## Communication

- When a request conflicts with a design invariant, stop and point it out before coding.
- Keep the design docs current: if a decision changes, update `GAME_DESIGN.md` in the same change.
