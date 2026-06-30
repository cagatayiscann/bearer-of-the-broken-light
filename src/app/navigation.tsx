import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { CampScreen } from '../screens/CampScreen';
import { EncounterScreen } from '../screens/EncounterScreen';
import { MainMenuScreen } from '../screens/MainMenuScreen';
import { MapScreen } from '../screens/MapScreen';
import { PalantirScreen } from '../screens/PalantirScreen';
import { PuzzleScreen } from '../screens/PuzzleScreen';
import { RewardScreen } from '../screens/RewardScreen';
import { colors } from '../ui/theme';

export type RootStackParamList = {
  MainMenu: undefined;
  Map: undefined;
  Encounter: { entityId: string };
  Puzzle: { levelId: string };
  Reward: { levelId: string; entityId: string };
  Camp: undefined;
  Palantir: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainMenu"
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgElevated },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen
        name="MainMenu"
        component={MainMenuScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Map" component={MapScreen} options={{ title: 'The Journey' }} />
      <Stack.Screen name="Encounter" component={EncounterScreen} options={{ title: '', headerTransparent: true, contentStyle: { backgroundColor: 'transparent' } }} />
      <Stack.Screen
        name="Puzzle"
        component={PuzzleScreen}
        options={{
          title: 'Word Trial',
          headerTransparent: true,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen
        name="Reward"
        component={RewardScreen}
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen name="Camp" component={CampScreen} options={{ title: 'Camp' }} />
      <Stack.Screen name="Palantir" component={PalantirScreen} options={{ title: 'Seeing Stone' }} />
    </Stack.Navigator>
  );
}
