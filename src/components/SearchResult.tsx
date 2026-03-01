import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import type { SearchResult } from '@/db/queries';
import { colors, spacing, radius, typography } from '@/theme/tokens';

interface Props {
  result: SearchResult;
  onPress: () => void;
}

export function SearchResultItem({ result, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.book}>{result.bookTitle}</Text>
      <Text style={styles.chapter}>{result.chapterTitle} · Passage {result.passageNumber}</Text>
      <Text style={styles.snippet}>{result.snippet}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  book: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  chapter: {
    fontSize: typography.fontSizes.xs,
    color: colors.comment,
    marginBottom: spacing.xs,
  },
  snippet: {
    fontSize: typography.fontSizes.sm,
    color: colors.textPrimary,
    lineHeight: typography.fontSizes.sm * 1.5,
  },
});
