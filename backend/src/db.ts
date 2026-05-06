import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// Sökväg till SQLite-filen på disk
const DB_PATH = path.join(__dirname, '../data/train.db')
// singelton anslutning
let db: Database.Database

// Öppnar den databasanslutning och returnerar den
export function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }
  return db
}

// Initialize the database and create tables if they don't exist
export function initDb(): void {
  const db = getDb()
  // Användartabell
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT NOT NULL UNIQUE COLLATE NOCASE,
      email      TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password   TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
  
  // Stationstabell
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