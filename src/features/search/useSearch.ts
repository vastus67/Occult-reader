import { useState, useCallback } from 'react';
import { searchPassages } from '@/db/queries';
import type { SearchResult } from '@/db/queries';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | undefined>();

  const search = useCallback(async (q: string, bookId?: string) => {
    const bookFilter = bookId !== undefined ? bookId : selectedBookId;
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await searchPassages(q, bookFilter);
      setResults(res);
    } finally {
      setLoading(false);
    }
  }, [selectedBookId]);

  const handleQueryChange = useCallback((q: string) => {
    setQuery(q);
    search(q);
  }, [search]);

  return { query, results, loading, selectedBookId, setSelectedBookId, handleQueryChange, search };
}
