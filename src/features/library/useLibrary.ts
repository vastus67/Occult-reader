import { useState, useEffect } from 'react';
import { getAllBooks } from '@/db/queries';
import type { Book } from '@/db/queries';
import { useAppStore } from '@/store';

export function useLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isSeeding } = useAppStore();

  useEffect(() => {
    if (isSeeding) return;
    setLoading(true);
    getAllBooks()
      .then(setBooks)
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [isSeeding]);

  return { books, loading, error };
}
