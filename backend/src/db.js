// ─────────────────────────────────────────────────────────
// SQLite – Base de datos liviana para usuarios (POC)
// ─────────────────────────────────────────────────────────
const Database = require('better-sqlite3');
const path     = require('path');

const DB_PATH = path.join(__dirname, '..', 'portal.db');
let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

/** Crea tabla y carga usuarios de ejemplo si no existen. */
function initDb() {
  const conn = getDb();

  conn.exec(`
    CREATE TABLE IF NOT EXISTS users (
      email  TEXT PRIMARY KEY,
      role   TEXT NOT NULL CHECK(role IN ('commercial','ops')),
      active INTEGER NOT NULL DEFAULT 1
    );
  `);

  const insert = conn.prepare(
    'INSERT OR IGNORE INTO users (email, role, active) VALUES (?, ?, 1)'
  );

  insert.run('comercial@empresa.com', 'commercial');
  insert.run('ops@empresa.com',       'ops');

  console.log('✔  Base de datos inicializada');
}

/** Busca un usuario activo por email. */
function findUserByEmail(email) {
  return getDb()
    .prepare('SELECT email, role, active FROM users WHERE email = ? AND active = 1')
    .get(email);
}

module.exports = { initDb, getDb, findUserByEmail };
