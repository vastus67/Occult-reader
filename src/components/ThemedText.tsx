import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, typography } from '@/theme/tokens';

interface Props extends TextProps {
  variant?: 'primary' | 'secondary' | 'muted' | 'heading';
}

export function ThemedText({ variant = 'primary', style, ...props }: Props) {
  return (
    <Text
      style={[styles.base, styles[variant], style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: typography.fontSizes.base,
  },
  primary: {
    color: colors.textPrimary,
  },
  secondary: {
    color: colors.textSecondary,
  },
  muted: {
    color: colors.textMuted,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
  },
});
