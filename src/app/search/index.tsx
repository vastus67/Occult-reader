import React, { useState, useCallback } from 'react';
import {
  View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { searchPassages } from '@/db/queries';
import type { SearchResult } from '@/db/queries';
import { colors, spacing, radius, typography } from '@/theme/tokens';
import { BOOK_REGISTRY } from '@/content/registry';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<string | undefined>();
  const router = useRouter();

  const doSearch = useCallback(async (q: string, bookId?: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await searchPassages(q, bookId);
      setResults(res);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBookFilter = (bookId: string | undefined) => {
    setSelectedBook(bookId);
    doSearch(query, bookId);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search the library…"
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={(t) => { setQuery(t); doSearch(t, selectedBook); }}
        autoFocus
        returnKeyType="search"
        onSubmitEditing={() => doSearch(query, selectedBook)}
      />

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, !selectedBook && styles.filterChipActive]}
          onPress={() => handleBookFilter(undefined)}
        >
          <Text style={[styles.filterChipText, !selectedBook && styles.filterChipTextActive]}>All</Text>
        </TouchableOpacity>
        {BOOK_REGISTRY.map((b) => (
          <TouchableOpacity
            key={b.id}
            style={[styles.filterChip, selectedBook === b.id && styles.filterChipActive]}
            onPress={() => handleBookFilter(b.id)}
          >
            <Text style={[styles.filterChipText, selectedBook === b.id && styles.filterChipTextActive]} numberOfLines={1}>
              {b.title.split(' ').slice(0, 2).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />}

      <FlatList
        data={results}
        keyExtractor={(r) => r.passageId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.result}
            onPress={() => router.push({ pathname: `/reader/${item.bookId}`, params: { chapterId: item.chapterId } })}
          >
            <Text style={styles.resultBook}>{item.bookTitle}</Text>
            <Text style={styles.resultChapter}>{item.chapterTitle} · Passage {item.passageNumber}</Text>
            <Text style={styles.resultSnippet}>{item.snippet}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: spacing.md }}
        ListEmptyComponent={
          query.length >= 2 && !loading ? (
            <Text style={styles.empty}>No results found</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  input: {
    margin: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.fontSizes.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.xs, flexWrap: 'wrap', marginBottom: spacing.sm },
  filterChip: { backgroundColor: colors.card, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: typography.fontSizes.xs, color: colors.textSecondary },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },
  result: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  resultBook: { fontSize: typography.fontSizes.xs, color: colors.primary, fontWeight: '700', marginBottom: 2 },
  resultChapter: { fontSize: typography.fontSizes.xs, color: colors.comment, marginBottom: spacing.xs },
  resultSnippet: { fontSize: typography.fontSizes.sm, color: colors.textPrimary, lineHeight: typography.fontSizes.sm * 1.5 },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});
