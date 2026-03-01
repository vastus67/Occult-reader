import { useState, useEffect, useCallback } from 'react';
import { getPassages, addHighlight, removeHighlight, addBookmark, removeBookmark, isBookmarked } from '@/db/queries';
import type { Passage } from '@/db/queries';

export function useReader(chapterId: string) {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlights, setHighlights] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!chapterId) return;
    setLoading(true);
    getPassages(chapterId)
      .then(setPassages)
      .finally(() => setLoading(false));
  }, [chapterId]);

  const toggleHighlight = useCallback(async (passageId: string, colorKey = 'yellow') => {
    if (highlights.has(passageId)) {
      await removeHighlight(passageId);
      setHighlights((prev) => { const s = new Set(prev); s.delete(passageId); return s; });
    } else {
      await addHighlight(passageId, colorKey);
      setHighlights((prev) => new Set(prev).add(passageId));
    }
  }, [highlights]);

  const toggleBookmark = useCallback(async (passageId: string) => {
    if (bookmarks.has(passageId)) {
      await removeBookmark(passageId);
      setBookmarks((prev) => { const s = new Set(prev); s.delete(passageId); return s; });
    } else {
      await addBookmark(passageId);
      setBookmarks((prev) => new Set(prev).add(passageId));
    }
  }, [bookmarks]);

  return { passages, loading, highlights, bookmarks, toggleHighlight, toggleBookmark };
}
