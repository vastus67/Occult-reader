import { useState, useEffect } from 'react';
import { getBook, getChapters } from '@/db/queries';
import type { Book, Chapter } from '@/db/queries';

export function useBook(id: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getBook(id), getChapters(id)])
      .then(([b, chs]) => {
        setBook(b);
        setChapters(chs);
      })
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [id]);

  return { book, chapters, loading, error };
}
