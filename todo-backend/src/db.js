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

// Connection success
pool.on('connect', () => {
  console.log('[DB] Connected to PostgreSQL');
});

// Better error handling
pool.on('error', (err) => {
  console.error('[DB] Unexpected error:', err.message);
});

module.exports = pool;