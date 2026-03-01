import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';

interface Props {
  progress: number;
  total: number;
  message: string;
}

export function LoadingScreen({ progress, total, message }: Props) {
  const pct = total > 0 ? (progress / total) * 100 : 0;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Occult Library</Text>
      <Text style={styles.symbol}>◉</Text>
      <ActivityIndicator color={colors.primary} size="large" style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
      {total > 0 && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
      )}
      {total > 0 && (
        <Text style={styles.progressText}>{progress} / {total}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.md,
    letterSpacing: 2,
  },
  symbol: {
    fontSize: 72,
    color: colors.comment,
    marginBottom: spacing.xl,
  },
  spinner: {
    marginBottom: spacing.md,
  },
  message: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
  },
});
