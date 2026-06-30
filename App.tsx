import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/app/navigation';
import { useGameStore } from './src/store/useGameStore';
import { colors } from './src/ui/theme';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bgElevated,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

export default function App() {
  // Apply offline camp decay on launch, and track foreground/background
  // transitions to drive Shadow Fatigue decay (GAME_DESIGN.md §9).
  React.useEffect(() => {
    const { applyOfflineDecay, markClosed } = useGameStore.getState();
    applyOfflineDecay();

    const onChange = (state: AppStateStatus) => {
      if (state === 'active') useGameStore.getState().applyOfflineDecay();
      else useGameStore.getState().markClosed();
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
