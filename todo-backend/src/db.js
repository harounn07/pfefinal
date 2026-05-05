const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false
});

// Connection successs
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('[DB] PostgreSQL READY ✅');
  } catch (err) {
    console.error('[DB] Connection failed ❌', err.message);
  }
})();

// Better error handling
pool.on('error', (err) => {
  console.error('[DB] Unexpected error:', err.message);
});

module.exports = pool;