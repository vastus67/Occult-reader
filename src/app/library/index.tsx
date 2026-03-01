import React, { useEffect, useState } from 'react';
import {
  View, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getAllBooks } from '@/db/queries';
import type { Book } from '@/db/queries';
import { colors, spacing, typography } from '@/theme/tokens';
import { BookCard } from '@/components/BookCard';
import { useAppStore } from '@/store';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function LibraryScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSeeding, seedProgress, seedTotal } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (!isSeeding) {
      getAllBooks()
        .then(setBooks)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isSeeding]);

  if (isSeeding) {
    return <LoadingScreen progress={seedProgress} total={seedTotal} message="Building your library…" />;
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={(b) => b.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <BookCard book={item} onPress={() => router.push(`/book/${item.id}`)} />
        )}
      />
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/library')}>
          <Text style={[styles.tabIcon, styles.tabActive]}>📚</Text>
          <Text style={[styles.tabLabel, styles.tabActive]}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/search')}>
          <Text style={styles.tabIcon}>🔍</Text>
          <Text style={styles.tabLabel}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/notes')}>
          <Text style={styles.tabIcon}>📝</Text>
          <Text style={styles.tabLabel}>Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/sources')}>
          <Text style={styles.tabIcon}>ℹ️</Text>
          <Text style={styles.tabLabel}>Sources</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: 80 },
  row: { justifyContent: 'space-between' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 16,
    paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 22 },
  tabLabel: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  tabActive: { color: colors.primary },
});
