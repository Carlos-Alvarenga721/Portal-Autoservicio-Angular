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

  // Migra roles legacy ops/commercial hacia operador/soporte.
  conn.exec(`
    CREATE TABLE IF NOT EXISTS users_new (
      email  TEXT PRIMARY KEY,
      role   TEXT NOT NULL CHECK(role IN ('soporte','operador')),
      active INTEGER NOT NULL DEFAULT 1
    );
  `);

  const currentTable = conn.prepare(`
    SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'
  `).get();

  if (currentTable) {
    conn.exec(`
      INSERT OR REPLACE INTO users_new (email, role, active)
      SELECT
        email,
        CASE
          WHEN role = 'ops' THEN 'operador'
          WHEN role = 'commercial' THEN 'soporte'
          ELSE role
        END,
        active
      FROM users;
    `);

    conn.exec(`
      DROP TABLE users;
      ALTER TABLE users_new RENAME TO users;
    `);
  } else {
    conn.exec(`
      ALTER TABLE users_new RENAME TO users;
    `);
  }

  conn.exec(`
    CREATE TABLE IF NOT EXISTS users (
      email  TEXT PRIMARY KEY,
      role   TEXT NOT NULL CHECK(role IN ('soporte','operador')),
      active INTEGER NOT NULL DEFAULT 1
    );
  `);

  const insert = conn.prepare(
    'INSERT OR IGNORE INTO users (email, role, active) VALUES (?, ?, 1)'
  );

  insert.run('soporte@empresa.com',  'soporte');
  insert.run('operador@empresa.com', 'operador');

  console.log('✔  Base de datos inicializada');
}

/** Busca un usuario activo por email. */
function findUserByEmail(email) {
  return getDb()
    .prepare('SELECT email, role, active FROM users WHERE email = ? AND active = 1')
    .get(email);
}

module.exports = { initDb, getDb, findUserByEmail };
