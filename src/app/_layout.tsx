import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useAppStore } from '@/store';
import { runMigrations } from '@/db/migrate';
import { isSeeded, seedBook } from '@/db/queries';
import { BOOK_REGISTRY } from '@/content/registry';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

const bookContentFiles: Record<string, any> = {
  kybalion: require('../../content/kybalion/chapters.json'),
  corpus_hermeticum: require('../../content/corpus_hermeticum/chapters.json'),
  occult_philosophy: require('../../content/occult_philosophy/chapters.json'),
  lesser_key: require('../../content/lesser_key/chapters.json'),
  discoverie_witchcraft: require('../../content/discoverie_witchcraft/chapters.json'),
};

export default function RootLayout() {
  const { setSeeding, setSeedProgress } = useAppStore();

  useEffect(() => {
    async function init() {
      try {
        await runMigrations();
        const seeded = await isSeeded();
        if (!seeded) {
          setSeeding(true);
          const total = BOOK_REGISTRY.length;
          for (let i = 0; i < BOOK_REGISTRY.length; i++) {
            const meta = BOOK_REGISTRY[i];
            setSeedProgress(i, total);
            const content = bookContentFiles[meta.id];
            if (content) {
              await seedBook(
                {
                  id: meta.id,
                  title: meta.title,
                  author: meta.author,
                  description: meta.description,
                  tags: meta.tags,
                  coverAsset: meta.coverAsset,
                  sortOrder: meta.sortOrder,
                },
                content.chapters
              );
            }
          }
          setSeedProgress(total, total);
          setSeeding(false);
        }
      } catch (e) {
        console.error('Init error:', e);
        setSeeding(false);
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    init();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { color: colors.textPrimary },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="library/index" options={{ title: 'Occult Library', headerLargeTitle: true }} />
        <Stack.Screen name="book/[id]" options={{ title: '' }} />
        <Stack.Screen name="reader/[id]" options={{ title: '', headerTransparent: true }} />
        <Stack.Screen name="search/index" options={{ title: 'Search' }} />
        <Stack.Screen name="notes/index" options={{ title: 'Notes & Highlights' }} />
        <Stack.Screen name="sources/index" options={{ title: 'Sources & Legal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
