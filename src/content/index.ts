/**
 * Content registry (DATA ONLY — no logic). See ARCHITECTURE.md §3.
 * This is a minimal seed for the project skeleton. The vertical slice
 * will flesh out the first theme/entity; later themes are added here as data.
 */
import type { Artifact, Companion, Entity, Level, Theme } from '../types';

export const themes: Theme[] = [
  {
    id: 'whispering-wood',
    name: 'The Whispering Wood',
    order: 0,
    entityIds: ['grizz-goblin', 'whisper-wisp'],
  },
];

export const entities: Entity[] = [
  {
    id: 'grizz-goblin',
    themeId: 'whispering-wood',
    name: 'Grizz the Goblin',
    bossLevelId: 'ww-grizz-boss',
    levelIds: ['ww-grizz-1', 'ww-grizz-2'],
    twist: 'timer',
    artifactId: 'time-slowing-crystal',
    // Grizz is the starter companion (GAME_DESIGN.md §8), not a boss reward here.
    dialogueId: 'grizz-intro',
  },
  {
    id: 'whisper-wisp',
    themeId: 'whispering-wood',
    name: 'Whisper Wisp',
    bossLevelId: 'ww-wisp-boss',
    levelIds: ['ww-wisp-1'],
    twist: 'darkness',
    dialogueId: 'wisp-intro',
  },
];

export const levels: Level[] = [
  {
    id: 'ww-grizz-boss',
    entityId: 'grizz-goblin',
    isBoss: true,
    twist: 'timer',
    // Gentle first trial: a single 4-letter pool (R,O,O,T) with short sub-words.
    words: ['ROOT', 'ROT', 'TOO'],
  },
  { id: 'ww-grizz-1', entityId: 'grizz-goblin', isBoss: false, words: ['BARK', 'ARK', 'BAR'] },
  { id: 'ww-grizz-2', entityId: 'grizz-goblin', isBoss: false, words: ['VINE', 'NINE', 'VEIN'] },
  {
    id: 'ww-wisp-boss',
    entityId: 'whisper-wisp',
    isBoss: true,
    twist: 'darkness',
    words: ['MIST', 'FOG', 'GO'],
  },
  { id: 'ww-wisp-1', entityId: 'whisper-wisp', isBoss: false, words: ['WISP', 'SPIN', 'PIN'] },
];

export const artifacts: Artifact[] = [
  {
    id: 'time-slowing-crystal',
    name: 'Time-Slowing Crystal',
    description: 'Grants extra seconds on timed trials.',
    effect: { kind: 'timeBonus', amount: 15 },
  },
];

export const companions: Companion[] = [
  {
    id: 'grizz',
    name: 'Grizz',
    barks: [
      'Ooo, wrong one! Thought that letter was mine...',
      'This is dangerous, friend. Very dangerous.',
      'Loot after? We split it, yes?',
    ],
    help: { kind: 'revealLetters', amount: 1 },
  },
];

export const getTheme = (id: string) => themes.find((t) => t.id === id);
export const getEntity = (id: string) => entities.find((e) => e.id === id);
export const getLevel = (id: string) => levels.find((l) => l.id === id);
export const getArtifact = (id: string) => artifacts.find((a) => a.id === id);
export const getCompanion = (id: string) => companions.find((c) => c.id === id);
