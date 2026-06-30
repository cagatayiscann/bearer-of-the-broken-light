/**
 * Core type contracts — the spine of the data-driven content model.
 * See ARCHITECTURE.md §5. Mechanics are code; levels are data.
 */

export type TwistId =
  | 'timer'
  | 'scramble'
  | 'fire'
  | 'darkness'
  | 'lying'
  | 'loop';

/** A region of the journey. Contains several entities. */
export interface Theme {
  id: string;
  name: string;
  /** Display order on the world map (lower = earlier). */
  order: number;
  entityIds: string[];
  /** Theme this one depends on; undefined means available from the start. */
  unlockAfterThemeId?: string;
}

/** A creature that guards part of a theme and sets puzzles. */
export interface Entity {
  id: string;
  themeId: string;
  name: string;
  portrait?: string;
  /** Layer A: the authored, twist-bearing "boss" level. */
  bossLevelId: string;
  /** Layer B: relaxed, data-only levels. */
  levelIds: string[];
  /** Only boss levels normally carry a twist. */
  twist?: TwistId;
  artifactId?: string;
  companionId?: string;
  dialogueId?: string;
}

/** A single puzzle. Layer B levels are pure data (just a word list). */
export interface Level {
  id: string;
  entityId: string;
  isBoss: boolean;
  /** The words that make up the grid. This is the DATA that scales. */
  words: string[];
  gridLayout?: GridSpec;
  /** Usually undefined for Layer B levels. */
  twist?: TwistId;
}

/** Optional explicit grid placement; if absent, the engine auto-lays-out words. */
export interface GridSpec {
  rows: number;
  cols: number;
  placements: WordPlacement[];
}

export interface WordPlacement {
  word: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
}

export interface ArtifactEffect {
  kind: 'timeBonus' | 'revealLetter' | 'fireWard' | 'lightInDarkness' | 'fatigueResist';
  /** Magnitude of the effect; meaning depends on kind. */
  amount?: number;
}

export interface Artifact {
  id: string;
  name: string;
  description: string;
  effect: ArtifactEffect;
}

export interface CompanionHelp {
  /** What a single "Companion Boost" does in a puzzle. */
  kind: 'revealLetters' | 'addTime' | 'miniGame';
  amount?: number;
}

export interface Companion {
  id: string;
  name: string;
  /** Generic interjections shown occasionally during play. */
  barks: string[];
  help: CompanionHelp;
}
