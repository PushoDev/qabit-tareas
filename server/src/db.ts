import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { TASK_STATUSES } from './schemas.js'

export type Db = Database.Database

// Por defecto el archivo vive en server/data/ (ignorado por git). Los tests usan ':memory:'.
const DEFAULT_PATH = resolve(import.meta.dirname, '../data/tasks.db')

export function openDb(path: string = process.env.DB_PATH ?? DEFAULT_PATH): Db {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })
  const db = new Database(path)
  db.pragma('journal_mode = WAL')

  // CHECK en la base: aunque alguien se salte la API, no entra un estado inválido.
  const statuses = TASK_STATUSES.map((s) => `'${s}'`).join(', ')
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT NOT NULL,
      assignee   TEXT NOT NULL,
      status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (${statuses})),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);
  `)
  return db
}
