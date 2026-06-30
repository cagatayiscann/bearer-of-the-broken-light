# ARCHITECTURE

> How we build *Bearer of the Broken Light*. Pairs with `GAME_DESIGN.md` (what we build).
> Keep this honest: if the code drifts from this doc, fix one of them.

---

## 1. Tech stack

| Concern | Choice | Notes |
|---------|--------|-------|
| Framework | React Native + **Expo** | Managed workflow first; eject only if forced. |
| Language | **TypeScript** (strict) | Types are the contract for data-driven content. |
| State | **Zustand** + `persist` middleware | Slices per domain (Section 4). |
| Navigation | **React Navigation** (native stack) | Menu → Map → Encounter → Puzzle → Reward. |
| Storage | **AsyncStorage** via zustand persist | Save/load progress, inventory, fatigue. |
| Audio | `expo-av` | SFX + music; consider ElevenLabs-generated tracks later. |
| Ads | **expo-ads / AdMob** (rewarded, interstitial, banner) | Behind a thin `AdService` wrapper. |
| Animation | `react-native-reanimated` + `react-native-gesture-handler` | Grid swipe gestures, juice. |

---

## 2. Guiding architectural principle

**Data-driven content.** (Mirrors the two-layer model in `GAME_DESIGN.md` §5.)

- A **mechanic / twist** = code (a reusable component or rule).
- A **level** = data (a JSON record: word list + metadata).
- Adding 100 levels must be a data task, NOT a code task.
- Adding a new twist is the only thing that should require new code.

If you find yourself writing a new component per level, stop — you broke the principle.

---

## 3. Folder structure

```
src/
  app/                 # Navigation, root providers, theme
  screens/             # MainMenu, Map, Encounter, Puzzle, Reward, Camp, Palantir
  features/
    puzzle/            # Core word-grid engine (mechanic layer)
      engine/          # Grid model, word validation, scoring (pure, testable)
      twists/          # One module per twist (timer, scramble, darkness, ...)
      components/      # Grid UI, tiles, letter wheel
    encounter/         # Entity intro, dialogue runner
    companions/        # Companion definitions, bark/help logic
    artifacts/         # Artifact definitions + effects (mechanical hooks)
    map/               # Roadmap nodes, fog/unlock state
    monetization/      # AdService wrapper, Shadow Fatigue, camp/offline decay
  store/               # Zustand slices (Section 4)
  content/             # DATA ONLY — no logic
    themes/            # theme definitions
    entities/          # entity definitions (which twist, which artifact, dialogue ref)
    levels/            # level data (word lists) — the bulk grows here
    dialogue/          # companion + entity lines
  data/                # word source / dictionary, generators
  ui/                  # Shared primitives (Button, Card, Text, etc.)
  audio/               # SFX + music manager
  types/               # Shared TS types (the content contract)
  utils/
assets/                # images, fonts, audio files
```

> `content/` and `data/` must stay logic-free. Logic lives in `features/`.

---

## 4. State (Zustand slices)

Split the store into domain slices, combined into one store:

- **progressSlice** — current theme/entity/level, completed nodes, map fog state.
- **inventorySlice** — artifacts owned, shards, coins/stars.
- **companionSlice** — unlocked companions, active party (max 2), boost cooldowns.
- **puzzleSlice** — transient state of the active puzzle (grid, found words, timer).
- **fatigueSlice** — Shadow Fatigue value, last-closed timestamp (for offline decay).
- **settingsSlice** — audio, accessibility (color-blind cues), ad/IAP flags.

Persisted: progress, inventory, companions, fatigue, settings.
NOT persisted: transient puzzleSlice (rebuilt from level data on entry).

---

## 5. Core type contracts (the spine of data-driven design)

Sketch (final types live in `src/types/`):

```ts
type Theme   = { id; name; order; entityIds: string[]; unlockRule };
type Entity  = {
  id; themeId; name; portrait;
  bossLevelId: string;          // Layer A (story) level
  levelIds: string[];           // Layer B (relaxed) levels
  twist?: TwistId;              // only boss levels carry a twist
  artifactId?: string;
  companionId?: string;
  dialogueId?: string;
};
type Level   = {
  id; entityId; isBoss: boolean;
  words: string[];              // the grid content (DATA)
  gridLayout?: GridSpec;
  twist?: TwistId;              // usually undefined for Layer B
};
type Twist     = { id; apply(puzzleCtx): void };   // code
type Artifact  = { id; name; effect: ArtifactEffect };
type Companion = { id; name; barks: string[]; help: CompanionHelp };
```

The puzzle engine consumes `Level` data and (optionally) one `Twist`. Everything else is content.

---

## 6. Puzzle engine boundaries

- **Pure core** (`features/puzzle/engine/`): grid model, word matching, scoring — no React, fully unit-testable.
- **Twists** plug into the engine via a small hook interface; each twist is isolated and toggleable.
- **UI** subscribes to engine state; gestures feed input back. Keep render and logic separate.

This separation is what lets the AI (and you) test logic without a device.

---

## 7. What the AI CAN and CANNOT self-test (important)

- **CAN**: run unit tests on the pure engine, type-check, lint, read logs, catch build errors.
- **CANNOT** reliably judge: "is this puzzle fun?", timer tightness, touch feel, juice, difficulty.
  → **Game feel is validated by a human (you) on a real device.** Do not trust AI self-rating of fun.

Implication: invest in making the engine pure/testable so the AI's verifiable surface is large,
and keep feel-based tuning (timers, hint counts, fatigue rate) in easily-editable config.

---

## 8. Build order (vertical slice → horizontal expansion)

**Vertical slice (do this first):** one of everything, playable end-to-end.
- 1 theme, 1 entity, that entity's boss level + 2 relaxed levels.
- Working word-grid engine + 1 twist (timer).
- 1 companion (with dialogue), 1 artifact (with a real effect).
- Map screen (1 node open, rest fogged), save/load, 1 rewarded-ad surface.

**Horizontal slices (only after the slice is fun):** multiply proven systems via DATA.
- More entities/themes (new word lists, reuse engine), more companions/artifacts.
- New code only when adding a genuinely new twist.

---

## 9. Testing

- Unit tests for `features/puzzle/engine/` (word validation, scoring, grid fill).
- Snapshot/logic tests for store slices (progress, fatigue decay math).
- Manual device passes for feel (the AI cannot replace this).
