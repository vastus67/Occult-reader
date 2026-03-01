import { normalizeText } from './normalize';

export function buildFtsQuery(rawQuery: string): string {
  const normalized = normalizeText(rawQuery);
  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `"${w.replace(/"/g, '""')}"*`)
    .join(' ');
}

export function buildLikeQuery(rawQuery: string): string {
  return `%${normalizeText(rawQuery)}%`;
}
