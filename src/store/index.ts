import { create } from 'zustand';
import { getReadingState, saveReadingState } from '@/db/queries';

export type Theme = 'dracula' | 'candle';
export type ReaderMode = 'scroll' | 'paginated';
export type FontFamily = 'serif' | 'sans' | 'mono';

interface AppSettings {
  theme: Theme;
  readerMode: ReaderMode;
  fontSize: number;
  lineHeight: number;
  margin: number;
  fontFamily: FontFamily;
  verseMode: boolean;
}

interface ReadingProgress {
  [bookId: string]: {
    chapterId?: string;
    passageId?: string;
    scrollOffset: number;
  };
}

interface AppStore extends AppSettings {
  isSeeding: boolean;
  seedProgress: number;
  seedTotal: number;
  readingProgress: ReadingProgress;
  setTheme: (theme: Theme) => void;
  setReaderMode: (mode: ReaderMode) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (lh: number) => void;
  setMargin: (margin: number) => void;
  setFontFamily: (family: FontFamily) => void;
  setVerseMode: (enabled: boolean) => void;
  setSeeding: (seeding: boolean) => void;
  setSeedProgress: (progress: number, total: number) => void;
  updateReadingProgress: (bookId: string, chapterId: string, passageId: string, scrollOffset: number) => void;
  loadReadingProgress: (bookId: string) => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  theme: 'dracula',
  readerMode: 'scroll',
  fontSize: 16,
  lineHeight: 1.6,
  margin: 16,
  fontFamily: 'serif',
  verseMode: true,
  isSeeding: false,
  seedProgress: 0,
  seedTotal: 0,
  readingProgress: {},

  setTheme: (theme) => set({ theme }),
  setReaderMode: (readerMode) => set({ readerMode }),
  setFontSize: (fontSize) => set({ fontSize }),
  setLineHeight: (lineHeight) => set({ lineHeight }),
  setMargin: (margin) => set({ margin }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setVerseMode: (verseMode) => set({ verseMode }),
  setSeeding: (isSeeding) => set({ isSeeding }),
  setSeedProgress: (seedProgress, seedTotal) => set({ seedProgress, seedTotal }),

  updateReadingProgress: async (bookId, chapterId, passageId, scrollOffset) => {
    set((state) => ({
      readingProgress: {
        ...state.readingProgress,
        [bookId]: { chapterId, passageId, scrollOffset },
      },
    }));
    await saveReadingState({
      bookId,
      chapterId,
      passageId,
      scrollOffset,
      updatedAt: new Date().toISOString(),
    });
  },

  loadReadingProgress: async (bookId) => {
    const state = await getReadingState(bookId);
    if (state) {
      set((prev) => ({
        readingProgress: {
          ...prev.readingProgress,
          [bookId]: {
            chapterId: state.chapterId,
            passageId: state.passageId,
            scrollOffset: state.scrollOffset,
          },
        },
      }));
    }
  },
}));
