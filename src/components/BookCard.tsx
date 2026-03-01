import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import type { Book } from '@/db/queries';
import { colors, spacing, radius, typography } from '@/theme/tokens';

const COVER_COLORS: Record<string, string> = {
  kybalion: '#4a1942',
  corpus_hermeticum: '#1a2a4a',
  occult_philosophy: '#1a3a2a',
  lesser_key: '#3a1a1a',
  discoverie_witchcraft: '#2a2a1a',
};

const COVER_SYMBOLS: Record<string, string> = {
  kybalion: '☿',
  corpus_hermeticum: '⊕',
  occult_philosophy: '✦',
  lesser_key: '⬡',
  discoverie_witchcraft: '🌿',
};

interface Props {
  book: Book;
  onPress: () => void;
}

export function BookCard({ book, onPress }: Props) {
  const bgColor = COVER_COLORS[book.id] || colors.card;
  const symbol = COVER_SYMBOLS[book.id] || '◉';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.cover, { backgroundColor: bgColor }]}>
        <Text style={styles.symbol}>{symbol}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.author} numberOfLines={1}>{book.author}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  cover: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 56,
    color: 'rgba(255,255,255,0.7)',
  },
  info: {
    padding: spacing.sm,
  },
  title: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  author: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
});
