import { getDatabase } from './migrate';
import { normalizeText } from '@/utils/normalize';

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  tags: string[];
  coverAsset?: string;
  sortOrder: number;
}

export interface Chapter {
  id: string;
  bookId: string;
  number: number;
  title: string;
}

export interface Passage {
  id: string;
  bookId: string;
  chapterId: string;
  number: number;
  text: string;
  normalizedText: string;
}

export interface Highlight {
  id: string;
  passageId: string;
  colorKey: string;
  createdAt: string;
}

export interface Note {
  id: string;
  passageId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  passageId: string;
  createdAt: string;
}

export interface ReadingState {
  bookId: string;
  chapterId?: string;
  passageId?: string;
  scrollOffset: number;
  updatedAt: string;
}

export interface SearchResult {
  passageId: string;
  bookId: string;
  chapterId: string;
  passageNumber: number;
  text: string;
  bookTitle: string;
  chapterTitle: string;
  snippet: string;
}

// Books
export async function getAllBooks(): Promise<Book[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM books ORDER BY sortOrder ASC'
  );
  return rows.map((r) => ({ ...r, tags: JSON.parse(r.tags) }));
}

export async function getBook(id: string): Promise<Book | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>('SELECT * FROM books WHERE id = ?', [id]);
  if (!row) return null;
  return { ...row, tags: JSON.parse(row.tags) };
}

// Chapters
export async function getChapters(bookId: string): Promise<Chapter[]> {
  const db = await getDatabase();
  return db.getAllAsync<Chapter>(
    'SELECT * FROM chapters WHERE bookId = ? ORDER BY number ASC',
    [bookId]
  );
}

// Passages
export async function getPassages(chapterId: string): Promise<Passage[]> {
  const db = await getDatabase();
  return db.getAllAsync<Passage>(
    'SELECT * FROM passages WHERE chapterId = ? ORDER BY number ASC',
    [chapterId]
  );
}

export async function getPassage(id: string): Promise<Passage | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Passage>('SELECT * FROM passages WHERE id = ?', [id]);
}

// Full-text search
export async function searchPassages(query: string, bookId?: string): Promise<SearchResult[]> {
  const db = await getDatabase();
  const normalizedQuery = normalizeText(query);

  try {
    // Try FTS5 first
    const ftsQuery = normalizedQuery
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => `"${w.replace(/"/g, '""')}"*`)
      .join(' ');

    let sql: string;
    let params: any[];

    if (bookId) {
      sql = `
        SELECT p.id as passageId, p.bookId, p.chapterId, p.number as passageNumber,
               p.text, b.title as bookTitle, c.title as chapterTitle
        FROM passages_fts f
        JOIN passages p ON p.id = f.passageId
        JOIN books b ON b.id = p.bookId
        JOIN chapters c ON c.id = p.chapterId
        WHERE passages_fts MATCH ? AND p.bookId = ?
        ORDER BY rank
        LIMIT 50
      `;
      params = [ftsQuery, bookId];
    } else {
      sql = `
        SELECT p.id as passageId, p.bookId, p.chapterId, p.number as passageNumber,
               p.text, b.title as bookTitle, c.title as chapterTitle
        FROM passages_fts f
        JOIN passages p ON p.id = f.passageId
        JOIN books b ON b.id = p.bookId
        JOIN chapters c ON c.id = p.chapterId
        WHERE passages_fts MATCH ?
        ORDER BY rank
        LIMIT 50
      `;
      params = [ftsQuery];
    }

    const rows = await db.getAllAsync<any>(sql, params);
    return rows.map((r) => ({
      ...r,
      snippet: r.text.substring(0, 120) + (r.text.length > 120 ? '…' : ''),
    }));
  } catch {
    // Fallback to LIKE
    const likeQuery = `%${normalizedQuery}%`;
    let sql: string;
    let params: any[];

    if (bookId) {
      sql = `
        SELECT p.id as passageId, p.bookId, p.chapterId, p.number as passageNumber,
               p.text, b.title as bookTitle, c.title as chapterTitle
        FROM passages p
        JOIN books b ON b.id = p.bookId
        JOIN chapters c ON c.id = p.chapterId
        WHERE p.normalizedText LIKE ? AND p.bookId = ?
        LIMIT 50
      `;
      params = [likeQuery, bookId];
    } else {
      sql = `
        SELECT p.id as passageId, p.bookId, p.chapterId, p.number as passageNumber,
               p.text, b.title as bookTitle, c.title as chapterTitle
        FROM passages p
        JOIN books b ON b.id = p.bookId
        JOIN chapters c ON c.id = p.chapterId
        WHERE p.normalizedText LIKE ?
        LIMIT 50
      `;
      params = [likeQuery];
    }

    const rows = await db.getAllAsync<any>(sql, params);
    return rows.map((r) => ({
      ...r,
      snippet: r.text.substring(0, 120) + (r.text.length > 120 ? '…' : ''),
    }));
  }
}

// Highlights
export async function getHighlightsForBook(bookId: string): Promise<(Highlight & { passage: Passage | null })[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(`
    SELECT h.*, p.text as passageText, p.bookId, p.chapterId, p.number as passageNumber
    FROM highlights h
    LEFT JOIN passages p ON p.id = h.passageId
    WHERE p.bookId = ?
    ORDER BY h.createdAt DESC
  `, [bookId]);
  return rows.map((r) => ({
    id: r.id,
    passageId: r.passageId,
    colorKey: r.colorKey,
    createdAt: r.createdAt,
    passage: r.passageText ? {
      id: r.passageId,
      bookId: r.bookId,
      chapterId: r.chapterId,
      number: r.passageNumber,
      text: r.passageText,
      normalizedText: '',
    } : null,
  }));
}

export async function getAllHighlights(): Promise<(Highlight & { passage: Passage | null; bookTitle: string; chapterTitle: string })[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(`
    SELECT h.*, p.text as passageText, p.bookId, p.chapterId, p.number as passageNumber,
           b.title as bookTitle, c.title as chapterTitle
    FROM highlights h
    LEFT JOIN passages p ON p.id = h.passageId
    LEFT JOIN books b ON b.id = p.bookId
    LEFT JOIN chapters c ON c.id = p.chapterId
    ORDER BY h.createdAt DESC
  `);
  return rows.map((r) => ({
    id: r.id,
    passageId: r.passageId,
    colorKey: r.colorKey,
    createdAt: r.createdAt,
    bookTitle: r.bookTitle || '',
    chapterTitle: r.chapterTitle || '',
    passage: r.passageText ? {
      id: r.passageId,
      bookId: r.bookId,
      chapterId: r.chapterId,
      number: r.passageNumber,
      text: r.passageText,
      normalizedText: '',
    } : null,
  }));
}

export async function addHighlight(passageId: string, colorKey: string): Promise<string> {
  const db = await getDatabase();
  const id = `h_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  await db.runAsync(
    'INSERT OR REPLACE INTO highlights (id, passageId, colorKey, createdAt) VALUES (?, ?, ?, ?)',
    [id, passageId, colorKey, new Date().toISOString()]
  );
  return id;
}

export async function removeHighlight(passageId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM highlights WHERE passageId = ?', [passageId]);
}

// Notes
export async function getAllNotes(): Promise<(Note & { passage: Passage | null; bookTitle: string; chapterTitle: string })[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(`
    SELECT n.*, p.text as passageText, p.bookId, p.chapterId, p.number as passageNumber,
           b.title as bookTitle, c.title as chapterTitle
    FROM notes n
    LEFT JOIN passages p ON p.id = n.passageId
    LEFT JOIN books b ON b.id = p.bookId
    LEFT JOIN chapters c ON c.id = p.chapterId
    ORDER BY n.createdAt DESC
  `);
  return rows.map((r) => ({
    id: r.id,
    passageId: r.passageId,
    text: r.text,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    bookTitle: r.bookTitle || '',
    chapterTitle: r.chapterTitle || '',
    passage: r.passageText ? {
      id: r.passageId,
      bookId: r.bookId,
      chapterId: r.chapterId,
      number: r.passageNumber,
      text: r.passageText,
      normalizedText: '',
    } : null,
  }));
}

export async function addNote(passageId: string, text: string): Promise<string> {
  const db = await getDatabase();
  const id = `n_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO notes (id, passageId, text, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
    [id, passageId, text, now, now]
  );
  return id;
}

export async function updateNote(id: string, text: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE notes SET text = ?, updatedAt = ? WHERE id = ?', [
    text,
    new Date().toISOString(),
    id,
  ]);
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
}

// Bookmarks
export async function getAllBookmarks(): Promise<(Bookmark & { passage: Passage | null; bookTitle: string; chapterTitle: string })[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(`
    SELECT bm.*, p.text as passageText, p.bookId, p.chapterId, p.number as passageNumber,
           b.title as bookTitle, c.title as chapterTitle
    FROM bookmarks bm
    LEFT JOIN passages p ON p.id = bm.passageId
    LEFT JOIN books b ON b.id = p.bookId
    LEFT JOIN chapters c ON c.id = p.chapterId
    ORDER BY bm.createdAt DESC
  `);
  return rows.map((r) => ({
    id: r.id,
    passageId: r.passageId,
    createdAt: r.createdAt,
    bookTitle: r.bookTitle || '',
    chapterTitle: r.chapterTitle || '',
    passage: r.passageText ? {
      id: r.passageId,
      bookId: r.bookId,
      chapterId: r.chapterId,
      number: r.passageNumber,
      text: r.passageText,
      normalizedText: '',
    } : null,
  }));
}

export async function addBookmark(passageId: string): Promise<string> {
  const db = await getDatabase();
  const id = `bm_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  await db.runAsync(
    'INSERT OR REPLACE INTO bookmarks (id, passageId, createdAt) VALUES (?, ?, ?)',
    [id, passageId, new Date().toISOString()]
  );
  return id;
}

export async function removeBookmark(passageId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM bookmarks WHERE passageId = ?', [passageId]);
}

export async function isBookmarked(passageId: string): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM bookmarks WHERE passageId = ?',
    [passageId]
  );
  return (row?.count ?? 0) > 0;
}

// Reading state
export async function getReadingState(bookId: string): Promise<ReadingState | null> {
  const db = await getDatabase();
  return db.getFirstAsync<ReadingState>(
    'SELECT * FROM reading_state WHERE bookId = ?',
    [bookId]
  );
}

export async function saveReadingState(state: ReadingState): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO reading_state (bookId, chapterId, passageId, scrollOffset, updatedAt)
     VALUES (?, ?, ?, ?, ?)`,
    [state.bookId, state.chapterId ?? null, state.passageId ?? null, state.scrollOffset, state.updatedAt]
  );
}

// Seed data
export async function isSeeded(): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM books'
  );
  return (row?.count ?? 0) > 0;
}

export async function seedBook(
  book: Book,
  chapters: Array<{ id?: string; number: number; title: string; passages: Array<{ number: number; text: string }> }>
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO books (id, title, author, description, tags, coverAsset, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [book.id, book.title, book.author, book.description, JSON.stringify(book.tags), book.coverAsset ?? null, book.sortOrder]
  );

  for (const chapter of chapters) {
    const chapterId = `${book.id}_ch${chapter.number}`;
    await db.runAsync(
      'INSERT OR REPLACE INTO chapters (id, bookId, number, title) VALUES (?, ?, ?, ?)',
      [chapterId, book.id, chapter.number, chapter.title]
    );

    for (const passage of chapter.passages) {
      const passageId = `${chapterId}_p${passage.number}`;
      const normalized = normalizeText(passage.text);
      await db.runAsync(
        'INSERT OR REPLACE INTO passages (id, bookId, chapterId, number, text, normalizedText) VALUES (?, ?, ?, ?, ?, ?)',
        [passageId, book.id, chapterId, passage.number, passage.text, normalized]
      );
      await db.runAsync(
        'INSERT OR REPLACE INTO passages_fts (passageId, bookId, chapterId, text) VALUES (?, ?, ?, ?)',
        [passageId, book.id, chapterId, normalized]
      );
    }
  }
}
