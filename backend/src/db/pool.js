// src/db/pool.js — MySQL2 connection pool
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               process.env.DB_PORT     || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'nexuslaw',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
  dateStrings:        true,   // Return DATE columns as 'YYYY-MM-DD' strings, not JS Date objects
});

// Test connection on startup
pool.getConnection()
  .then((conn) => {
    console.log('✅  MySQL connected — database:', process.env.DB_NAME);
    conn.release();
  })
  .catch((err) => {
    console.error('❌  MySQL connection failed:', err.message);
    process.exit(1);
  });

module.exports = pool;
