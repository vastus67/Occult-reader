export const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    coverAsset TEXT,
    sortOrder INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    bookId TEXT NOT NULL,
    number INTEGER NOT NULL,
    title TEXT NOT NULL,
    FOREIGN KEY (bookId) REFERENCES books(id)
  );

  CREATE TABLE IF NOT EXISTS passages (
    id TEXT PRIMARY KEY,
    bookId TEXT NOT NULL,
    chapterId TEXT NOT NULL,
    number INTEGER NOT NULL,
    text TEXT NOT NULL,
    normalizedText TEXT NOT NULL,
    FOREIGN KEY (bookId) REFERENCES books(id),
    FOREIGN KEY (chapterId) REFERENCES chapters(id)
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS passages_fts USING fts5(
    passageId UNINDEXED,
    bookId UNINDEXED,
    chapterId UNINDEXED,
    text,
    content=passages,
    content_rowid=rowid
  );

  CREATE TABLE IF NOT EXISTS highlights (
    id TEXT PRIMARY KEY,
    passageId TEXT NOT NULL,
    colorKey TEXT NOT NULL DEFAULT 'yellow',
    createdAt TEXT NOT NULL,
    FOREIGN KEY (passageId) REFERENCES passages(id)
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    passageId TEXT NOT NULL,
    text TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (passageId) REFERENCES passages(id)
  );

  CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY,
    passageId TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (passageId) REFERENCES passages(id)
  );

  CREATE TABLE IF NOT EXISTS reading_state (
    bookId TEXT PRIMARY KEY,
    chapterId TEXT,
    passageId TEXT,
    scrollOffset REAL NOT NULL DEFAULT 0,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (bookId) REFERENCES books(id)
  );

  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    appliedAt TEXT NOT NULL
  );
`;
