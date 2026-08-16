const Database = require('better-sqlite3');
const path = require('path');

// Guarantees questionBank.db is always created/read in the same directory as db.js
const dbPath = path.join(__dirname, 'questionBank.db');
const db = new Database(dbPath, { verbose: console.log });

db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer INTEGER
    )
`);

module.exports = db;