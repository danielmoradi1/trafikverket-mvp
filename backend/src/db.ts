import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = path.join(__dirname, '../data/train.db')
let db: Database.Database

export function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }
  return db
}

export function initDb(): void {
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT NOT NULL UNIQUE COLLATE NOCASE,
      email      TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password   TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS train_stations (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      location_signature    TEXT    NOT NULL UNIQUE,
      advertised_name       TEXT    NOT NULL,
      short_name            TEXT,
      primary_location_code TEXT,
      lat                   REAL,
      lng                   REAL,
      platform_lines        TEXT,
      advertised            INTEGER NOT NULL DEFAULT 1,
      prognosticated        INTEGER NOT NULL DEFAULT 0,
      modified_time         TEXT
    );
  `)

  console.log('Database initialized')
}