import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors } from '@/theme/tokens';

interface Props extends ViewProps {
  variant?: 'background' | 'surface' | 'card';
}

export function ThemedView({ variant = 'background', style, ...props }: Props) {
  return (
    <View
      style={[styles.base, styles[variant], style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  background: {
    backgroundColor: colors.background,
  },
  surface: {
    backgroundColor: colors.surface,
  },
  card: {
    backgroundColor: colors.card,
  },
});
