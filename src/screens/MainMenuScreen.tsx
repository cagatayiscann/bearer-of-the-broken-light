import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '../app/navigation';
import { AppButton, AppText, Screen } from '../ui/components';
import { colors, spacing } from '../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MainMenu'>;

export function MainMenuScreen({ navigation }: Props) {
  return (
    <Screen style={styles.container}>
      <View style={styles.titleBlock}>
        <AppText variant="title" style={styles.title}>
          Bearer of the Broken Light
        </AppText>
        <AppText muted style={styles.subtitle}>
          A journey of words through a fading realm.
        </AppText>
      </View>

      <View style={styles.menu}>
        <AppButton title="Begin the Journey" onPress={() => navigation.navigate('Map')} />
        <AppButton title="Camp" variant="ghost" onPress={() => navigation.navigate('Camp')} />
        <AppButton
          title="Seeing Stone"
          variant="ghost"
          onPress={() => navigation.navigate('Palantir')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'space-between' },
  titleBlock: { marginTop: spacing.xl * 2, alignItems: 'center' },
  title: { color: colors.accentSoft, textAlign: 'center' },
  subtitle: { marginTop: spacing.sm, textAlign: 'center' },
  menu: { gap: spacing.md, marginBottom: spacing.xl },
});
