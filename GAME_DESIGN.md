# GAME DESIGN — Working Title: *Bearer of the Broken Light*

> This is the single source of truth for the game's vision and design rules.
> When in doubt, this document wins. Update it whenever a design decision changes.
> Companion doc: `ARCHITECTURE.md` (how we build it), `AGENTS.md` (how the AI should work).

---

## 1. One-line pitch

A *World of Wonders*-style word puzzle game wrapped in a *Lord of the Rings*-style journey:
the player crosses fantastical regions, each guarded by creatures who set word puzzles,
and earns companions and artifacts along the way.

---

## 2. Core strategic decisions (LOCKED)

These are settled. Do not silently change them. If a change is needed, update this section explicitly.

| Decision | Value | Why it matters |
|----------|-------|----------------|
| **Business model** | **Retention-driven** (ads + IAP), NOT premium/story | All content/length/loop decisions follow from this. |
| **Word language** | **English** | Targets the global market required for ad revenue. All words, lore, dialogue in English. |
| **Engine** | React Native + **Expo** | Asset management, OTA updates, TestFlight ease. |
| **State** | **Zustand** (with persist) | Simple, scalable, good for this scope. |
| **Build order** | **Vertical slice first**, then horizontal content expansion | Kill the "is it fun?" risk before mass-producing content. |

---

## 3. The central tension (READ THIS FIRST)

A narrative epic (finite, authored) and an ad-revenue casual game (infinite, retention-driven)
pull in opposite directions. We resolve it with a **two-layer content model** (Section 5)
and an **endless mode beyond the story ending** (Section 6).

**Design consequence:** stress mechanics (timers, letter-scramble, darkness) are *seasoning, not the main course.*
The bulk of play must be **relaxed flow**. Twists appear only in rare, special "boss" encounters.

---

## 4. Content hierarchy

```
Game
└── ~10 Themes            (e.g. "Whispering Wood", "Ash Desert", "Drowned City")
     └── 3–5 Entities / theme   (e.g. Goblin, Dryad, Shadow Weaver)
          └── 5–8 Levels / entity   (the puzzles)
```

Rough volume target: `10 themes × 4 entities × 6 levels ≈ 240 puzzles` at launch,
extendable via content packs (data-only updates).

### Biome arc (LOCKED — launch order)

The journey runs as one continuous world map from the forest edge to the source
of the broken light. Themes unlock in this order; each is a region on the map.

| # | Theme | Feel |
|---|-------|------|
| 1 | **Whispering Wood** | Forest start; calm onboarding. |
| 2 | **Drowned Fen** | Misty swamp/marsh. |
| 3 | **Ash Desert** | Scorched dunes and ruins. |
| 4 | **Frostpeak** | Frozen mountains. |
| 5 | **Sunken City** | Drowned ruins by dark water. |
| 6 | **Ember Deep** | Underground caverns, lava glow. |
| 7 | **The Shattered Spire** | Finale — the source of the broken light. |

> The map shows the whole arc (a visible end point = motivation, §6). Unreached
> regions stay fogged silhouettes; only the current region's nodes are playable.

---

## 5. The two-layer content model (CORE PRINCIPLE)

This is how we get "lots of content" without writing "lots of story."

### Layer A — Story layer (sparse, hand-authored)
- Only the **first level of each entity** is a full narrative "boss" encounter.
- Has dialogue, a signature twist mechanic, companion moment, artifact reward.
- High production value. This is the memorable, shareable part.

### Layer B — Content layer (dense, data-driven)
- The remaining 5–7 levels per entity are **classic, relaxed, twist-free** word puzzles.
- Differ only by **word-list data (JSON)** — no new code, no new story.
- This is the "grind body" that sustains retention and ad impressions.

> Rule of thumb: **few mechanics, lots of data.** A twist is a *mechanic* (code).
> A level is *data* (a word list + metadata). Never let level count drive code count.

---

## 6. Progression, map & the "grind" loop

### Map / roadmap
- A node-based journey map (Candy Crush / LotR map feel).
- **Completed nodes** light up / gain color; **unreached nodes** are fogged silhouettes.
- The story has a **visible end point** (motivation), BUT...

### Endless beyond the end (RETENTION SAFETY VALVE)
- The story ending = end of the *story*, NOT end of the *game*.
- Beyond it: **Daily Puzzle**, an **Endless "Wander the Realm" mode**, and **weekly events**.
- This prevents the "finished it, uninstalled" churn that kills finite games.

### Reward cadence (variable-reward loop)
- Per **level**: small reward (coins / stars / artifact shard).
- Per **entity**: large reward (artifact, sometimes a companion).
- Per **theme**: very large reward (new companion, new region unlock, lore beat).

---

## 7. Puzzle design

### Base mechanic
- *World of Wonders*-style word grid: swipe/connect letters to fill a crossword-like grid.
- Mobile-first: large touch targets, forgiving hit detection.

### Three layers in every puzzle
1. **Mechanic layer** — the grid + rules.
2. **Twist layer** — the entity's special "curse" (only in Layer-A boss levels).
3. **Story layer** — answer words tie to the entity's lore (Layer-A only).

### Signature twists (boss levels only — rare by design)
- **Fuse Sorcerer** — 60s timer; wrong letters drain time faster. Artifact: *Time-Slowing Crystal*.
- **Mindtwister Imp** — randomly swaps placed letters. Artifact: *Eye of Truth* (hint).
- **Fire Sprite** — only outer-ring words fillable; inner tiles burn. Artifact: *Flame Ward*.
- **Shadow Weaver** — dark grid; letters reveal under your finger (braille feel). Artifact: *Shadow Lantern*.
- **Lying Dragon** — some letters shown falsely; deduce truth from dialogue.
- **Loop Dryad** — failure loops with a new hint each time.

> Difficulty curve: first 3 entities = simple twists + generous hints.
> Mid = two twists combined. Late = multi-mechanic + artifact combos required.

---

## 8. Companions

- Earned by completing an entity's boss level with a high score.
- **Max 2 active at once** (avoid UI clutter / overpowered help).
- Each: ~8–10 generic barks + 3–4 puzzle-specific lines.
- Help is **limited per puzzle** (e.g. one "Companion Boost" = reveal 1–2 letters or a mini-game).
- Backstory unlocked via **campfire chats** (also serves the camp/offline loop, Section 9).

Starter companion: **Grizz** (goblin) — greedy, cowardly, clever, comic relief.

---

## 9. Monetization (retention-friendly)

> Guiding principle: **ads are an optional reward gate, never a punishment.**
> A good player should rarely *need* ads. Casual players opt in for boosts.

### "Shadow Fatigue" mechanic (reframed — NOT a punishment)
- Travelling dangerous paths slowly raises Shadow Fatigue.
- It must be framed as **"watch to gain a bonus,"** never **"you're penalized, pay to undo it."**
- Lower it via:
  - **Palantír / Seeing Stone** screen → "channel energy from distant realms" → **rewarded video** → fatigue drops + bonus shard. (This is the primary ad surface.)
  - **Camp (offline progression)** → game closed = party camps → fatigue decays in real time (e.g. ~10–15%/hr). Companions chat at the campfire.
  - **Daily free "Light Ritual"** + good puzzle scores (natural decay).

### Ad placements
- **Rewarded video** (primary): lower fatigue, extra hint/life, artifact upgrade, bonus puzzle.
- **Interstitial**: only at theme/entity transitions, optional, lore-framed.
- **Banner**: light, only on map / camp screens.

### IAP
- **Remove ads** / reduced fatigue rate (permanent).
- Companion skins / voice packs.
- Cosmetic + convenience, never pay-to-win on word answers.

### Daily engagement (the real retention engine)
- Daily Puzzle, login streak, limited-time events. These drive ad impressions far more than story.

---

## 10. Accessibility & polish (don't forget)

- Color-blind support: shape cues, not color-only signals.
- Juice: particle + artifact animation + short story beat after each puzzle (emotional payoff).
- Readable typography; scalable touch targets across screen sizes.

---

## 11. Open questions / parking lot

- Exact Shadow Fatigue rate (per how many puzzles does it fill?).
- Word source/dictionary for English grid generation (licensing vs. open word list).
- Theme names & order beyond the first.
- Whether companions stack mechanically with artifacts (synergy system).
