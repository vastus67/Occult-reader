import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Passage } from '@/db/queries';
import { colors, spacing, radius, typography } from '@/theme/tokens';

interface Props {
  passage: Passage;
  isHighlighted?: boolean;
  isBookmarked?: boolean;
  verseMode?: boolean;
  fontSize?: number;
  lineHeight?: number;
  fontFamily?: string;
  textColor?: string;
  onPress?: () => void;
}

export function PassageView({
  passage,
  isHighlighted = false,
  isBookmarked = false,
  verseMode = true,
  fontSize = 16,
  lineHeight = 1.6,
  fontFamily = 'serif',
  textColor = colors.textPrimary,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        isHighlighted && { backgroundColor: colors.highlights.yellow },
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        {verseMode && (
          <Text style={styles.number}>{passage.number}</Text>
        )}
        <Text
          style={[
            styles.text,
            {
              fontSize,
              lineHeight: fontSize * lineHeight,
              color: textColor,
              fontFamily: fontFamily === 'serif' ? 'Georgia' : fontFamily === 'mono' ? 'Courier New' : undefined,
            },
          ]}
        >
          {passage.text}
        </Text>
        {isBookmarked && <Text style={styles.bookmark}>🔖</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  number: {
    width: 28,
    fontSize: typography.fontSizes.xs,
    fontWeight: '700',
    color: colors.comment,
    paddingTop: 3,
  },
  text: {
    flex: 1,
  },
  bookmark: {
    paddingLeft: 4,
    paddingTop: 2,
  },
});
