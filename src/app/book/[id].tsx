import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getBook, getChapters } from '@/db/queries';
import type { Book, Chapter } from '@/db/queries';
import { colors, spacing, radius, typography } from '@/theme/tokens';
import { useAppStore } from '@/store';
import { BOOK_REGISTRY } from '@/content/registry';

export default function BookOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { verseMode, setVerseMode, readingProgress } = useAppStore();
  const progress = readingProgress[id];
  const meta = BOOK_REGISTRY.find((b) => b.id === id);

  useEffect(() => {
    Promise.all([getBook(id), getChapters(id)])
      .then(([b, chs]) => {
        setBook(b);
        setChapters(chs);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }
  if (!book) {
    return <View style={styles.center}><Text style={styles.errorText}>Book not found</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>
        {meta?.translator && <Text style={styles.translator}>Trans. {meta.translator}</Text>}
        <View style={styles.tags}>
          {book.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.description}>{book.description}</Text>

      <View style={styles.controls}>
        {progress && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => router.push(`/reader/${id}`)}
          >
            <Text style={styles.primaryButtonText}>Continue Reading</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, progress ? styles.secondaryButton : styles.primaryButton]}
          onPress={() => router.push(`/reader/${id}`)}
        >
          <Text style={progress ? styles.secondaryButtonText : styles.primaryButtonText}>
            {progress ? 'Start from Beginning' : 'Start Reading'}
          </Text>
        </TouchableOpacity>

        <View style={styles.verseModeRow}>
          <Text style={styles.verseModeLabel}>Verse Mode (passage numbers)</Text>
          <TouchableOpacity
            style={[styles.toggle, verseMode && styles.toggleActive]}
            onPress={() => setVerseMode(!verseMode)}
          >
            <Text style={styles.toggleText}>{verseMode ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Table of Contents</Text>
      {chapters.map((ch) => (
        <TouchableOpacity
          key={ch.id}
          style={styles.chapterRow}
          onPress={() => router.push({ pathname: `/reader/${id}`, params: { chapterId: ch.id } })}
        >
          <Text style={styles.chapterNum}>{ch.number}</Text>
          <Text style={styles.chapterTitle}>{ch.title}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { color: colors.textSecondary },
  header: { marginBottom: spacing.lg },
  title: { fontSize: typography.fontSizes.xl, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.xs },
  author: { fontSize: typography.fontSizes.md, color: colors.textSecondary, marginBottom: spacing.xs },
  translator: { fontSize: typography.fontSizes.sm, color: colors.comment, marginBottom: spacing.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: { backgroundColor: colors.currentLine, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  tagText: { fontSize: typography.fontSizes.xs, color: colors.cyan },
  description: { fontSize: typography.fontSizes.base, color: colors.textSecondary, lineHeight: typography.fontSizes.base * 1.6, marginBottom: spacing.xl },
  controls: { marginBottom: spacing.xl, gap: spacing.sm },
  button: { borderRadius: radius.md, paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg, alignItems: 'center' },
  primaryButton: { backgroundColor: colors.primary },
  secondaryButton: { borderWidth: 1, borderColor: colors.primary },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: typography.fontSizes.base },
  secondaryButtonText: { color: colors.primary, fontWeight: '700', fontSize: typography.fontSizes.base },
  verseModeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.sm, backgroundColor: colors.card, borderRadius: radius.md },
  verseModeLabel: { color: colors.textSecondary, fontSize: typography.fontSizes.sm },
  toggle: { backgroundColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
  toggleActive: { backgroundColor: colors.primary },
  toggleText: { color: '#fff', fontSize: typography.fontSizes.xs, fontWeight: '700' },
  sectionTitle: { fontSize: typography.fontSizes.lg, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  chapterRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, marginBottom: spacing.xs, backgroundColor: colors.card, borderRadius: radius.md },
  chapterNum: { width: 32, color: colors.comment, fontSize: typography.fontSizes.sm, fontWeight: '700' },
  chapterTitle: { flex: 1, color: colors.textPrimary, fontSize: typography.fontSizes.base },
  chevron: { color: colors.textMuted, fontSize: 20 },
});
