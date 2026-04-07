require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("DB Connection Failed", err);
  } else {
    console.log("PostgreSQL (Supabase) Connected");
    
    // Create the students table if it doesn't already exist
    client.query(`CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name_en VARCHAR(255),
      class VARCHAR(50),
      division VARCHAR(50)
    )`, (err, result) => {
      release();
      if (err) {
        console.error("Error creating table", err.stack);
      }
    });
  }
});

// Create a wrapper to make mapping syntax simple
const wrappedDb = {
  query: function(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    // Replace MySQL/SQLite (?) placeholders with PostgreSQL ($1, $2) placeholders
    let index = 1;
    let pgSql = sql.replace(/\?/g, () => '$' + index++);

    pool.query(pgSql, params, function(err, result) {
      if (callback) {
        if (err) return callback(err, null);
        callback(null, result.rows ? result.rows : result);
      }
    });
  }
};

module.exports = wrappedDb;
