import { useState, useEffect, useCallback } from 'react';
import { getAllHighlights, getAllNotes, getAllBookmarks, deleteNote, type Highlight, type Note, type Bookmark, type Passage } from '@/db/queries';

type HighlightWithPassage = Highlight & { passage: Passage | null; bookTitle: string; chapterTitle: string };
type NoteWithPassage = Note & { passage: Passage | null; bookTitle: string; chapterTitle: string };
type BookmarkWithPassage = Bookmark & { passage: Passage | null; bookTitle: string; chapterTitle: string };

export function useNotes() {
  const [highlights, setHighlights] = useState<HighlightWithPassage[]>([]);
  const [notes, setNotes] = useState<NoteWithPassage[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkWithPassage[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const [h, n, bm] = await Promise.all([
      getAllHighlights(),
      getAllNotes(),
      getAllBookmarks(),
    ]);
    setHighlights(h);
    setNotes(n);
    setBookmarks(bm);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const removeNote = useCallback(async (id: string) => {
    await deleteNote(id);
    await reload();
  }, [reload]);

  return { highlights, notes, bookmarks, loading, reload, removeNote };
}
