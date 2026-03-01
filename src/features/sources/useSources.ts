import { BOOK_REGISTRY } from '@/content/registry';
import type { BookMeta } from '@/content/registry';

export function useSources() {
  return {
    books: BOOK_REGISTRY as BookMeta[],
  };
}
