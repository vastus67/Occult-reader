import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native';
import { getAllHighlights, getAllNotes, getAllBookmarks, deleteNote } from '@/db/queries';
import { colors, spacing, radius, typography } from '@/theme/tokens';
import { BOOK_REGISTRY } from '@/content/registry';

type Tab = 'highlights' | 'notes' | 'bookmarks';

export default function NotesScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('notes');
  const [highlights, setHighlights] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [filterBookId, setFilterBookId] = useState<string | undefined>();

  const reload = useCallback(async () => {
    const [h, n, bm] = await Promise.all([getAllHighlights(), getAllNotes(), getAllBookmarks()]);
    setHighlights(h);
    setNotes(n);
    setBookmarks(bm);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const exportNotes = async () => {
    const data = notes.map((n) => ({
      book: n.bookTitle,
      chapter: n.chapterTitle,
      passage: n.passage?.text,
      note: n.text,
      createdAt: n.createdAt,
    }));
    const text = JSON.stringify(data, null, 2);
    await Share.share({ message: text, title: 'Occult Library Notes' });
  };

  const getFilteredData = () => {
    const filterTitle = filterBookId ? BOOK_REGISTRY.find((b) => b.id === filterBookId)?.title : undefined;
    const filter = (arr: any[]) => filterTitle ? arr.filter((i) => i.bookTitle === filterTitle) : arr;
    if (activeTab === 'highlights') return filter(highlights);
    if (activeTab === 'notes') return filter(notes);
    return filter(bookmarks);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.cardBook}>{item.bookTitle}</Text>
      <Text style={styles.cardChapter}>{item.chapterTitle} · Passage {item.passage?.number}</Text>
      {item.passage && (
        <Text style={styles.cardPassage} numberOfLines={3}>"{item.passage.text}"</Text>
      )}
      {activeTab === 'notes' && <Text style={styles.cardNote}>{item.text}</Text>}
      {activeTab === 'notes' && (
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Delete Note', 'Are you sure?', [
              { text: 'Cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => { await deleteNote(item.id); reload(); },
              },
            ]);
          }}
        >
          <Text style={styles.deleteBtn}>Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {(['notes', 'highlights', 'bookmarks'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.chip, !filterBookId && styles.chipActive]}
          onPress={() => setFilterBookId(undefined)}
        >
          <Text style={[styles.chipText, !filterBookId && styles.chipTextActive]}>All</Text>
        </TouchableOpacity>
        {BOOK_REGISTRY.map((b) => (
          <TouchableOpacity
            key={b.id}
            style={[styles.chip, filterBookId === b.id && styles.chipActive]}
            onPress={() => setFilterBookId(b.id)}
          >
            <Text style={[styles.chipText, filterBookId === b.id && styles.chipTextActive]} numberOfLines={1}>
              {b.title.split(' ').slice(0, 2).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'notes' && notes.length > 0 && (
        <TouchableOpacity style={styles.exportBtn} onPress={exportNotes}>
          <Text style={styles.exportBtnText}>Export Notes</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={getFilteredData()}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
        ListEmptyComponent={<Text style={styles.empty}>No {activeTab} yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, padding: spacing.xs },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.md },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontSize: typography.fontSizes.sm },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  filterRow: { flexDirection: 'row', padding: spacing.sm, gap: spacing.xs, flexWrap: 'wrap' },
  chip: { backgroundColor: colors.card, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: typography.fontSizes.xs, color: colors.textSecondary },
  chipTextActive: { color: '#fff' },
  exportBtn: { marginHorizontal: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.card, padding: spacing.sm, borderRadius: radius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.primary },
  exportBtnText: { color: colors.primary, fontWeight: '700', fontSize: typography.fontSizes.sm },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  cardBook: { fontSize: typography.fontSizes.xs, color: colors.primary, fontWeight: '700', marginBottom: 2 },
  cardChapter: { fontSize: typography.fontSizes.xs, color: colors.comment, marginBottom: spacing.xs },
  cardPassage: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, fontStyle: 'italic', marginBottom: spacing.xs },
  cardNote: { fontSize: typography.fontSizes.base, color: colors.textPrimary, marginTop: spacing.xs },
  deleteBtn: { color: colors.red, fontSize: typography.fontSizes.xs, marginTop: spacing.xs },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});
