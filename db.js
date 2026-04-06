const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'eduregister.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("DB Connection Failed", err);
  } else {
    console.log("SQLite (Local DB) Connected");
    
    // Create the students table if it doesn't already exist
    db.run(`CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_en TEXT,
      class TEXT,
      division TEXT
    )`);
  }
});

// Create a wrapper to make mapping syntax match mysql2 (so students.js doesn't need changes)
const wrappedDb = {
  query: function(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      db.all(sql, params, function(err, rows) {
        if (callback) callback(err, rows);
      });
    } else {
      db.run(sql, params, function(err) {
        if (callback) callback(err, { insertId: this.lastID, changes: this.changes });
      });
    }
  }
};

module.exports = wrappedDb;
