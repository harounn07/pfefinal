const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST     || 'todo-db.cjsqwsq405r5.eu-north-1.rds.amazonaws.com',
  port:     parseInt(process.env.DB_PORT || '5432'),
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'devops123',
  database: process.env.DB_NAME     || 'todo-db',
});

pool.on('connect', () => {
  console.log('[DB] Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error:', err.message);
  process.exit(-1);
});

module.exports = pool;
