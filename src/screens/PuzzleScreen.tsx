import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import type { RootStackParamList } from '../app/navigation';
import { getCompanion, getLevel } from '../content';
import { puzzleConfig } from '../features/puzzle/config';
import { GridView } from '../features/puzzle/components/GridView';
import { LetterWheel } from '../features/puzzle/components/LetterWheel';
import { deriveWheel } from '../features/puzzle/engine/wheel';
import { generateLayout } from '../features/puzzle/engine/layout';
import { pickHintCells } from '../features/puzzle/engine/hints';
import { classifyGuess } from '../features/puzzle/engine/wheel';
import { normalizeWord } from '../features/puzzle/engine/wordGrid';
import { useGameStore } from '../store/useGameStore';
import { AppButton, AppText, Screen } from '../ui/components';
import { colors, radius, spacing } from '../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Puzzle'>;

type Flash = { text: string; tone: 'good' | 'bad' } | null;

export function PuzzleScreen({ navigation, route }: Props) {
  const level = getLevel(route.params.levelId);
  const { width } = useWindowDimensions();

  const foundWords = useGameStore((s) => s.foundWords);
  const timeRemaining = useGameStore((s) => s.timeRemaining);
  const hintCells = useGameStore((s) => s.hintCells);
  const boostsUsed = useGameStore((s) => s.boostsUsed);
  const activeCompanionIds = useGameStore((s) => s.activeCompanionIds);
  const startPuzzle = useGameStore((s) => s.startPuzzle);
  const addFoundWord = useGameStore((s) => s.addFoundWord);
  const setTimeRemaining = useGameStore((s) => s.setTimeRemaining);
  const revealHintCells = useGameStore((s) => s.revealHintCells);
  const useBoost = useGameStore((s) => s.useBoost);
  const endPuzzle = useGameStore((s) => s.endPuzzle);
  const hasArtifact = useGameStore((s) => s.hasArtifact);

  const [preview, setPreview] = React.useState('');
  const [flash, setFlash] = React.useState<Flash>(null);

  const isTimed = level?.twist === 'timer';

  // Derive the (deterministic) layout + wheel from level DATA via the pure engine.
  const layout = React.useMemo(() => (level ? generateLayout(level.words) : null), [level]);
  const wheel = React.useMemo(() => (level ? deriveWheel(level.words) : []), [level]);

  React.useEffect(() => {
    if (!level) return;
    let seconds: number | null = null;
    if (isTimed) {
      seconds = puzzleConfig.timer.baseSeconds;
      // Artifact effect: the Time-Slowing Crystal grants extra seconds.
      if (hasArtifact(puzzleConfig.timeBonusArtifactId)) {
        seconds += puzzleConfig.timer.crystalBonusSeconds;
      }
    }
    startPuzzle(level.id, seconds);
    return () => endPuzzle();
  }, [level, isTimed, startPuzzle, endPuzzle, hasArtifact]);

  const allFound = !!level && level.words.every((w) => foundWords.includes(normalizeWord(w)));
  const timeUp = isTimed && timeRemaining !== null && timeRemaining <= 0 && !allFound;

  // Countdown for timed (boss) trials.
  React.useEffect(() => {
    if (!isTimed || allFound || timeRemaining === null || timeRemaining <= 0) return;
    const id = setInterval(() => {
      const current = useGameStore.getState().timeRemaining;
      if (current === null) return;
      setTimeRemaining(Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isTimed, allFound, timeRemaining, setTimeRemaining]);

  const showFlash = React.useCallback((text: string, tone: 'good' | 'bad') => {
    setFlash({ text, tone });
    setTimeout(() => setFlash(null), 900);
  }, []);

  // The first active companion that can offer a boost (GAME_DESIGN.md §8).
  const boostCompanion = React.useMemo(() => {
    for (const id of activeCompanionIds) {
      const c = getCompanion(id);
      if (c) return c;
    }
    return undefined;
  }, [activeCompanionIds]);

  const boostAvailable =
    !!boostCompanion &&
    boostsUsed < puzzleConfig.companion.boostsPerPuzzle &&
    !allFound &&
    !timeUp;

  const onBoost = React.useCallback(() => {
    if (!level || !layout || !boostCompanion || !boostAvailable) return;
    const help = boostCompanion.help;
    if (help.kind === 'revealLetters') {
      const keys = pickHintCells(layout, foundWords, hintCells, help.amount ?? 1);
      if (keys.length === 0) return;
      revealHintCells(keys);
    } else if (help.kind === 'addTime') {
      if (timeRemaining === null) return;
      setTimeRemaining(timeRemaining + (help.amount ?? 10));
    } else {
      return; // miniGame not implemented yet
    }
    useBoost();
    const bark = boostCompanion.barks[Math.floor(Math.random() * boostCompanion.barks.length)];
    if (bark) showFlash(bark, 'good');
  }, [
    level,
    layout,
    boostCompanion,
    boostAvailable,
    foundWords,
    hintCells,
    timeRemaining,
    revealHintCells,
    setTimeRemaining,
    useBoost,
    showFlash,
  ]);

  const onWord = React.useCallback(
    (raw: string) => {
      if (!level || timeUp) return;
      const result = classifyGuess(raw, level.words, foundWords);
      if (result === 'valid') {
        addFoundWord(normalizeWord(raw));
        showFlash(normalizeWord(raw), 'good');
      } else if (result === 'duplicate') {
        showFlash('Already found', 'good');
      } else if (raw.length >= 2) {
        showFlash('Not a word here', 'bad');
      }
    },
    [level, foundWords, addFoundWord, showFlash, timeUp],
  );

  if (!level || !layout) {
    return (
      <Screen>
        <AppText>Unknown puzzle.</AppText>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <AppText muted>
          {foundWords.length}/{level.words.length} words
        </AppText>
        {isTimed && (
          <AppText
            variant="heading"
            style={{ color: timeRemaining !== null && timeRemaining <= 10 ? colors.danger : colors.accentSoft }}
          >
            {Math.max(0, timeRemaining ?? 0)}s
          </AppText>
        )}
      </View>

      <View style={styles.gridArea}>
        <GridView
          layout={layout}
          foundWords={foundWords}
          hintCells={hintCells}
          maxWidth={width - spacing.lg * 2}
        />
      </View>

      <View style={styles.previewRow}>
        <View style={[styles.previewPill, flash?.tone === 'bad' && styles.previewBad, flash?.tone === 'good' && styles.previewGood]}>
          <AppText variant="heading" style={styles.previewText}>
            {flash ? flash.text : preview || ' '}
          </AppText>
        </View>
      </View>

      {timeUp ? (
        <View style={styles.endState}>
          <AppText variant="heading" style={{ color: colors.danger }}>
            The light dims...
          </AppText>
          <AppButton
            title="Try Again"
            onPress={() => {
              let seconds = puzzleConfig.timer.baseSeconds;
              if (hasArtifact(puzzleConfig.timeBonusArtifactId)) {
                seconds += puzzleConfig.timer.crystalBonusSeconds;
              }
              startPuzzle(level.id, seconds);
            }}
          />
        </View>
      ) : allFound ? (
        <View style={styles.endState}>
          <AppButton
            title="Complete Trial"
            onPress={() => navigation.replace('Reward', { levelId: level.id, entityId: level.entityId })}
          />
        </View>
      ) : (
        <View style={styles.wheelArea}>
          {boostCompanion && (
            <AppButton
              title={
                boostAvailable
                  ? `${boostCompanion.name}'s Help`
                  : `${boostCompanion.name}'s Help (used)`
              }
              variant="ghost"
              disabled={!boostAvailable}
              style={!boostAvailable ? styles.boostUsed : styles.boost}
              onPress={onBoost}
            />
          )}
          <LetterWheel letters={wheel} onWord={onWord} onPreview={setPreview} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'space-between' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridArea: { flex: 1, justifyContent: 'center' },
  previewRow: { alignItems: 'center', marginBottom: spacing.sm },
  previewPill: {
    minWidth: 140,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  previewGood: { borderColor: colors.success },
  previewBad: { borderColor: colors.danger },
  previewText: { letterSpacing: 2 },
  wheelArea: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md, gap: spacing.sm },
  boost: { alignSelf: 'center' },
  boostUsed: { alignSelf: 'center', opacity: 0.4 },
  endState: { gap: spacing.md, paddingBottom: spacing.md, alignItems: 'stretch' },
});
