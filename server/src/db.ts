import Database, { type Database as DBType } from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { dirname } from 'path'

const DB_PATH = process.env.DB_PATH || 'data/photos.db'
mkdirSync(dirname(DB_PATH), { recursive: true })

const db: DBType = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS collections (
    id          TEXT PRIMARY KEY,
    user_id     TEXT,
    name        TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS photos (
    id            TEXT PRIMARY KEY,
    collection_id TEXT NOT NULL,
    filename      TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type     TEXT NOT NULL,
    size          INTEGER NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_photos_collection ON photos(collection_id);
`)

const collectionsCols = db.prepare('PRAGMA table_info(collections)').all() as { name: string }[]
if (!collectionsCols.some((c) => c.name === 'user_id')) {
  db.exec('ALTER TABLE collections ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE SET NULL')
}

db.exec('CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id)')

export default db