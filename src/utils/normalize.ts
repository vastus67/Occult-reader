export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildSearchQuery(query: string): string {
  return normalizeText(query);
}

export function highlightSnippet(text: string, query: string, maxLength: number = 150): string {
  if (!text) return '';
  const normalized = text.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return text.substring(0, maxLength) + (text.length > maxLength ? '…' : '');
  const idx = normalized.indexOf(q);
  if (idx === -1) {
    return text.substring(0, maxLength) + (text.length > maxLength ? '…' : '');
  }
  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + q.length + 90);
  const snippet = (start > 0 ? '…' : '') + text.substring(start, end) + (end < text.length ? '…' : '');
  return snippet;
}
