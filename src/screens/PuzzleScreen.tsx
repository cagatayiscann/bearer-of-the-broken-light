import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '../app/navigation';
import { getLevel } from '../content';
import { useGameStore } from '../store/useGameStore';
import { AppButton, AppText, Screen } from '../ui/components';
import { colors, radius, spacing } from '../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Puzzle'>;

/**
 * Placeholder puzzle screen. The real word-grid engine lands in the
 * vertical slice (features/puzzle/engine). For now this lets us walk the
 * full flow end-to-end: enter -> "solve" -> reward.
 */
export function PuzzleScreen({ navigation, route }: Props) {
  const level = getLevel(route.params.levelId);
  const foundWords = useGameStore((s) => s.foundWords);
  const startPuzzle = useGameStore((s) => s.startPuzzle);
  const addFoundWord = useGameStore((s) => s.addFoundWord);
  const endPuzzle = useGameStore((s) => s.endPuzzle);

  React.useEffect(() => {
    if (level) startPuzzle(level.id, level.twist === 'timer' ? 60 : null);
    return () => endPuzzle();
  }, [level, startPuzzle, endPuzzle]);

  if (!level) {
    return (
      <Screen>
        <AppText>Unknown puzzle.</AppText>
      </Screen>
    );
  }

  const allFound = level.words.every((w) => foundWords.includes(w));

  return (
    <Screen style={styles.container}>
      <View style={styles.gridPlaceholder}>
        <AppText muted>Word grid engine — coming in the vertical slice.</AppText>
      </View>

      <View style={styles.words}>
        {level.words.map((word) => {
          const found = foundWords.includes(word);
          return (
            <AppButton
              key={word}
              title={found ? word : '• • •'}
              variant={found ? 'ghost' : 'primary'}
              onPress={() => addFoundWord(word)}
            />
          );
        })}
      </View>

      <AppButton
        title="Complete Trial"
        disabled={!allFound}
        style={!allFound ? styles.disabled : undefined}
        onPress={() =>
          navigation.replace('Reward', { levelId: level.id, entityId: level.entityId })
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'space-between' },
  gridPlaceholder: {
    flex: 1,
    margin: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  words: { gap: spacing.sm, marginVertical: spacing.md },
  disabled: { opacity: 0.4 },
});
