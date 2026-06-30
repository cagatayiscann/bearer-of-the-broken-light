import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '../app/navigation';
import { FatigueBar } from '../features/monetization/components/FatigueBar';
import { monetizationConfig } from '../features/monetization/config';
import { showRewardedAd } from '../features/monetization/AdService';
import { useGameStore } from '../store/useGameStore';
import { AppButton, AppText, Screen } from '../ui/components';
import { colors, radius, spacing } from '../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Palantir'>;

type Result = { kind: 'success' | 'cancel' | 'fail'; message: string } | null;

/**
 * The Seeing Stone is the primary rewarded-ad surface (GAME_DESIGN.md §9).
 * Framing: "channel energy from distant realms" — a BONUS, never a punishment.
 */
export function PalantirScreen(_props: Props) {
  const fatigue = useGameStore((s) => s.fatigue);
  const shards = useGameStore((s) => s.shards);
  const adsRemoved = useGameStore((s) => s.adsRemoved);
  const reduceFatigue = useGameStore((s) => s.reduceFatigue);
  const addShards = useGameStore((s) => s.addShards);

  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<Result>(null);

  const { fatigueReduction, shardReward } = monetizationConfig.palantir;

  const channel = async () => {
    setBusy(true);
    setResult(null);

    const watched = adsRemoved ? true : await showRewardedAd();
    setBusy(false);

    if (!watched) {
      setResult({
        kind: 'cancel',
        message: 'The vision fades. No energy was channeled.',
      });
      return;
    }

    reduceFatigue(fatigueReduction);
    addShards(shardReward);
    setResult({
      kind: 'success',
      message: adsRemoved
        ? `Light steadied (−${fatigueReduction} fatigue) · +${shardReward} shard`
        : `Energy channeled! −${fatigueReduction} fatigue · +${shardReward} shard`,
    });
  };

  const buttonTitle = busy
    ? 'Channeling…'
    : adsRemoved
      ? 'Channel Energy (no ad)'
      : 'Channel Energy (watch)';

  return (
    <Screen style={styles.container}>
      <View style={styles.orb}>
        <AppText variant="heading" style={{ color: colors.accentSoft, textAlign: 'center' }}>
          The Seeing Stone
        </AppText>
        <AppText muted style={styles.lore}>
          Gaze into distant realms. Watching the living world steadies the light within — an
          optional bonus, never a toll on your journey.
        </AppText>
      </View>

      <View style={styles.card}>
        <FatigueBar fatigue={fatigue} />
        <AppText variant="small" muted>
          Artifact shards held: {shards}
        </AppText>
      </View>

      {result && (
        <AppText
          variant="small"
          style={{
            textAlign: 'center',
            color: result.kind === 'success' ? colors.success : colors.textMuted,
          }}
        >
          {result.message}
        </AppText>
      )}

      <AppButton title={buttonTitle} disabled={busy} onPress={channel} />

      <AppText variant="small" muted style={styles.hint}>
        Each channel lowers fatigue by {fatigueReduction} and grants {shardReward} shard.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  orb: {
    minHeight: 180,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  lore: { textAlign: 'center', lineHeight: 22 },
  card: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  hint: { textAlign: 'center' },
});
