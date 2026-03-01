import { useState, useEffect, useCallback } from 'react';
import { getAllHighlights, getAllNotes, getAllBookmarks, deleteNote } from '@/db/queries';

export function useNotes() {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
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
