import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('occult_library.db');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  return db;
}

export async function runMigrations(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(CREATE_TABLES_SQL);
}
