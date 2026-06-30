import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ImageBackground, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import type { RootStackParamList } from '../app/navigation';
import { getBiomeBackground } from '../assets/images';
import { getCompanion, getEntity, getLevel, getTheme } from '../content';
import { puzzleConfig } from '../features/puzzle/config';
import { GridView } from '../features/puzzle/components/GridView';
import { LetterWheel } from '../features/puzzle/components/LetterWheel';
import { deriveWheel, shuffleWheel, classifyGuess } from '../features/puzzle/engine/wheel';
import { generateLayout } from '../features/puzzle/engine/layout';
import { pickHintCells } from '../features/puzzle/engine/hints';
import { normalizeWord } from '../features/puzzle/engine/wordGrid';
import { useGameStore } from '../store/useGameStore';
import { AppButton, AppText, Screen } from '../ui/components';
import { colors, spacing } from '../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Puzzle'>;

type Flash = { text: string; tone: 'good' | 'bad' } | null;

export function PuzzleScreen({ navigation, route }: Props) {
  const level = getLevel(route.params.levelId);
  const entity = level ? getEntity(level.entityId) : undefined;
  const theme = entity ? getTheme(entity.themeId) : undefined;
  const biomeBackground = theme ? getBiomeBackground(theme.id) : undefined;
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
  const [wheelLetters, setWheelLetters] = React.useState<string[]>([]);

  const previewScale = useSharedValue(1);
  const previewAnim = useAnimatedStyle(() => ({
    transform: [{ scale: previewScale.value }],
  }));

  const isTimed = level?.twist === 'timer';
  const isDarkness = level?.twist === 'darkness';
  const layout = React.useMemo(() => (level ? generateLayout(level.words) : null), [level]);
  const timerUrgent = isTimed && timeRemaining !== null && timeRemaining <= 10;

  React.useLayoutEffect(() => {
    if (!entity || !level) return;
    navigation.setOptions({
      title: level.isBoss ? `${entity.name}'s Trial` : theme?.name ?? 'Word Trial',
      headerTransparent: true,
      headerStyle: { backgroundColor: 'transparent' },
      headerTintColor: colors.accentSoft,
      headerTitleStyle: { color: colors.text, fontWeight: '600' },
    });
  }, [navigation, entity, level, theme]);

  // Fresh wheel order each puzzle; parent owns shuffle (engine stays pure).
  React.useEffect(() => {
    if (!level) return;
    setWheelLetters(shuffleWheel(deriveWheel(level.words)));
  }, [level]);

  React.useEffect(() => {
    if (!level) return;
    let seconds: number | null = null;
    if (isTimed) {
      seconds = puzzleConfig.timer.baseSeconds;
      if (hasArtifact(puzzleConfig.timeBonusArtifactId)) {
        seconds += puzzleConfig.timer.crystalBonusSeconds;
      }
    }
    startPuzzle(level.id, seconds);
    return () => endPuzzle();
  }, [level, isTimed, startPuzzle, endPuzzle, hasArtifact]);

  const allFound = !!level && level.words.every((w) => foundWords.includes(normalizeWord(w)));
  const timeUp = isTimed && timeRemaining !== null && timeRemaining <= 0 && !allFound;

  React.useEffect(() => {
    if (!isTimed || allFound || timeRemaining === null || timeRemaining <= 0) return;
    const id = setInterval(() => {
      const current = useGameStore.getState().timeRemaining;
      if (current === null) return;
      setTimeRemaining(Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isTimed, allFound, timeRemaining, setTimeRemaining]);

  const pulsePreview = React.useCallback(
    (tone: 'good' | 'bad') => {
      const bump = tone === 'good' ? 1.12 : 1.06;
      previewScale.value = withSequence(
        withSpring(bump, { damping: 10, stiffness: 360 }),
        withSpring(1, { damping: 14, stiffness: 280 }),
      );
    },
    [previewScale],
  );

  const showFlash = React.useCallback(
    (text: string, tone: 'good' | 'bad') => {
      setFlash({ text, tone });
      pulsePreview(tone);
      setTimeout(() => setFlash(null), puzzleConfig.juice.flashDurationMs);
    },
    [pulsePreview],
  );

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
      return;
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

  const onShuffle = React.useCallback(() => {
    setWheelLetters((prev) => shuffleWheel(prev));
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

  const puzzleBody = (
    <>
      <View style={styles.hud}>
        <View style={styles.hudStat}>
          <AppText variant="small" style={styles.hudLabel}>
            Words found
          </AppText>
          <AppText variant="heading" style={styles.hudValue}>
            {foundWords.length}
            <AppText variant="small" style={styles.hudMuted}>
              {' '}
              / {level.words.length}
            </AppText>
          </AppText>
        </View>

        {isTimed && (
          <View style={[styles.hudStat, styles.hudStatRight]}>
            <AppText variant="small" style={styles.hudLabel}>
              Light fades
            </AppText>
            <AppText
              variant="heading"
              style={[styles.hudValue, timerUrgent && styles.hudValueUrgent]}
            >
              {Math.max(0, timeRemaining ?? 0)}s
            </AppText>
          </View>
        )}

        {isDarkness && !isTimed && (
          <View style={[styles.hudStat, styles.hudStatRight]}>
            <AppText variant="small" style={styles.hudLabel}>
              Mist shrouds
            </AppText>
            <AppText variant="heading" style={styles.hudValue}>
              Brush to read
            </AppText>
          </View>
        )}
      </View>

      <View style={styles.gridArea}>
        <GridView
          layout={layout}
          foundWords={foundWords}
          hintCells={hintCells}
          maxWidth={width - spacing.lg * 2}
          darkness={isDarkness}
        />
      </View>

      <View style={styles.previewRow}>
        <Animated.View
          style={[
            styles.previewWord,
            flash?.tone === 'bad' && styles.previewBad,
            flash?.tone === 'good' && styles.previewGood,
            previewAnim,
          ]}
        >
          <AppText
            variant="heading"
            style={[
              styles.previewText,
              flash?.tone === 'good' && styles.previewTextGood,
              flash?.tone === 'bad' && styles.previewTextBad,
            ]}
          >
            {flash ? flash.text : preview || '—'}
          </AppText>
        </Animated.View>
      </View>

      {timeUp ? (
        <View style={styles.endState}>
          <AppText variant="heading" style={{ color: colors.danger, textAlign: 'center' }}>
            The light dims...
          </AppText>
          <AppText muted style={{ textAlign: 'center', fontStyle: 'italic' }}>
            The forest holds its breath. Try once more.
          </AppText>
          <AppButton
            title="Relight the Trial"
            onPress={() => {
              let seconds = puzzleConfig.timer.baseSeconds;
              if (hasArtifact(puzzleConfig.timeBonusArtifactId)) {
                seconds += puzzleConfig.timer.crystalBonusSeconds;
              }
              startPuzzle(level.id, seconds);
              setWheelLetters(shuffleWheel(deriveWheel(level.words)));
            }}
          />
        </View>
      ) : allFound ? (
        <View style={styles.endState}>
          <AppButton
            title="Claim the Trial"
            onPress={() =>
              navigation.replace('Reward', { levelId: level.id, entityId: level.entityId })
            }
          />
        </View>
      ) : (
        <View style={styles.wheelArea}>
          <View style={styles.wheelActions}>
            {boostCompanion && (
              <AppButton
                title={
                  boostAvailable
                    ? `${boostCompanion.name}'s Aid`
                    : `${boostCompanion.name}'s Aid (spent)`
                }
                variant="ghost"
                disabled={!boostAvailable}
                style={[styles.actionBtn, !boostAvailable && styles.actionDisabled]}
                onPress={onBoost}
              />
            )}
            {puzzleConfig.wheel.shuffleEnabled && (
              <AppButton
                title="Scatter Runes"
                variant="ghost"
                style={styles.actionBtn}
                onPress={onShuffle}
              />
            )}
          </View>
          <AppText variant="small" style={styles.wheelHint}>
            {isDarkness
              ? 'Brush the grid to read letters, then trace the runes'
              : 'Trace the runes to spell a word'}
          </AppText>
          <LetterWheel letters={wheelLetters} onWord={onWord} onPreview={setPreview} />
        </View>
      )}
    </>
  );

  if (biomeBackground) {
    return (
      <ImageBackground source={biomeBackground} style={styles.background} resizeMode="cover">
        <View style={styles.scrimTop} pointerEvents="none" />
        <View style={styles.scrim} pointerEvents="none" />
        <Screen transparent style={styles.container}>
          {puzzleBody}
        </Screen>
      </ImageBackground>
    );
  }

  return <Screen style={styles.container}>{puzzleBody}</Screen>;
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(14, 11, 20, 0.42)',
  },
  scrimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(14, 11, 20, 0.55)',
  },
  container: { justifyContent: 'space-between', paddingTop: spacing.sm },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  hudStat: { gap: 2 },
  hudStatRight: { alignItems: 'flex-end' },
  hudLabel: {
    color: colors.accentSoft,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontSize: 11,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  hudValue: {
    color: colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  hudValueUrgent: { color: colors.danger },
  hudMuted: { color: colors.textMuted },
  gridArea: { flex: 1, justifyContent: 'center', paddingVertical: spacing.md },
  previewRow: { alignItems: 'center', marginBottom: spacing.sm, minHeight: 36 },
  previewWord: { alignItems: 'center', justifyContent: 'center' },
  previewGood: {},
  previewBad: {},
  previewText: {
    letterSpacing: 4,
    color: colors.accentSoft,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  previewTextGood: { color: colors.success },
  previewTextBad: { color: colors.danger },
  wheelArea: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.sm },
  wheelActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionBtn: { flexGrow: 1, minWidth: 120, backgroundColor: 'transparent', borderWidth: 0 },
  actionDisabled: { opacity: 0.4 },
  wheelHint: {
    textAlign: 'center',
    color: colors.textMuted,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  endState: { gap: spacing.md, paddingBottom: spacing.md, alignItems: 'stretch' },
});
