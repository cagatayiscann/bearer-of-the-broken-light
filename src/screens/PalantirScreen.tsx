import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '../app/navigation';
import { showRewardedAd } from '../features/monetization/AdService';
import { useGameStore } from '../store/useGameStore';
import { AppButton, AppText, Screen } from '../ui/components';
import { colors, radius, spacing } from '../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Palantir'>;

/**
 * The Seeing Stone is the primary rewarded-ad surface (GAME_DESIGN.md §9).
 * Framing: "channel energy from distant realms" — a BONUS, never a punishment.
 */
export function PalantirScreen(_props: Props) {
  const fatigue = useGameStore((s) => s.fatigue);
  const reduceFatigue = useGameStore((s) => s.reduceFatigue);
  const addShards = useGameStore((s) => s.addShards);
  const [busy, setBusy] = React.useState(false);

  const channel = async () => {
    setBusy(true);
    const watched = await showRewardedAd();
    setBusy(false);
    if (watched) {
      reduceFatigue(40);
      addShards(1);
    }
  };

  return (
    <Screen style={{ gap: spacing.lg }}>
      <View style={styles.orb}>
        <AppText muted style={{ textAlign: 'center' }}>
          Gaze into distant realms. Watching the living world steadies the light within.
        </AppText>
      </View>

      <AppText variant="small" muted>
        Current Shadow Fatigue: {Math.round(fatigue)} / 100
      </AppText>

      <AppButton
        title={busy ? 'Channeling…' : 'Channel Energy (watch)'}
        disabled={busy}
        onPress={channel}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  orb: {
    height: 220,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
});
