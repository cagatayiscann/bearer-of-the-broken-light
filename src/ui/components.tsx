import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type TextProps,
  type ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from './theme';

export function Screen({ style, children, ...rest }: ViewProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={[styles.screen, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}

type AppTextProps = TextProps & {
  variant?: 'title' | 'heading' | 'body' | 'small';
  muted?: boolean;
};

export function AppText({ variant = 'body', muted, style, ...rest }: AppTextProps) {
  return (
    <Text
      style={[
        { fontSize: font[variant], color: muted ? colors.textMuted : colors.text },
        variant === 'title' || variant === 'heading' ? styles.bold : null,
        style,
      ]}
      {...rest}
    />
  );
}

type AppButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'ghost';
};

export function AppButton({ title, variant = 'primary', style, ...rest }: AppButtonProps) {
  return (
    <Pressable
      style={(state) => [
        styles.button,
        variant === 'primary' ? styles.buttonPrimary : styles.buttonGhost,
        state.pressed && styles.buttonPressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      <Text
        style={[
          styles.buttonText,
          variant === 'ghost' && { color: colors.text },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1, padding: spacing.lg, backgroundColor: colors.bg },
  bold: { fontWeight: '700' },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: { backgroundColor: colors.accent },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: '#1A1206', fontWeight: '700', fontSize: font.body },
});
