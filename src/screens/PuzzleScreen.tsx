import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import type { RootStackParamList } from '../app/navigation';
import { getLevel } from '../content';
import { puzzleConfig } from '../features/puzzle/config';
import { GridView } from '../features/puzzle/components/GridView';
import { LetterWheel } from '../features/puzzle/components/LetterWheel';
import { deriveWheel } from '../features/puzzle/engine/wheel';
import { generateLayout } from '../features/puzzle/engine/layout';
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
  const startPuzzle = useGameStore((s) => s.startPuzzle);
  const addFoundWord = useGameStore((s) => s.addFoundWord);
  const setTimeRemaining = useGameStore((s) => s.setTimeRemaining);
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
        <GridView layout={layout} foundWords={foundWords} maxWidth={width - spacing.lg * 2} />
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
  wheelArea: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  endState: { gap: spacing.md, paddingBottom: spacing.md, alignItems: 'stretch' },
});
