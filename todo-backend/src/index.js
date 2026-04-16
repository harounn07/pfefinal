require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db');

const authRouter = require('./routes/auth');
const todosRouter = require('./routes/todos');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: corsOrigin === '*' ? true : corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

// ── PUBLIC ROUTES ─────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[HEALTH] DB check failed:', err.message);
    res.status(503).json({
      status: 'error',
      error: 'Database unreachable',
      timestamp: new Date().toISOString(),
    });
  }
});

app.use('/api/auth', authRouter);

// ── PROTECTED ROUTES ──────────────────────────────
app.use('/api/todos', authMiddleware, todosRouter);

// ── 404 HANDLER ───────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
  });
});

// ── GLOBAL ERROR HANDLER ──────────────────────────
app.use((err, req, res, next) => {
  console.error('[Unhandled error]', err);
  res.status(500).json({
    error: 'Internal server error',
  });
});

// ── INIT DATABASE ─────────────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id         SERIAL PRIMARY KEY,
      title      TEXT NOT NULL,
      completed  BOOLEAN NOT NULL DEFAULT FALSE,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  console.log('[DB] Schema ready');
}

// ── START SERVER ONLY IF NOT TEST ─────────────────
if (process.env.NODE_ENV !== 'test') {
  // Start the server first so health checks work
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Listening on port ${PORT}`);
  });

  // Then try to init DB (with retries)
  (async function retryInitDB(attempts = 5, delay = 3000) {
    for (let i = 1; i <= attempts; i++) {
      try {
        await initDB();
        return;
      } catch (err) {
        console.error(`[DB] Init attempt ${i}/${attempts} failed:`, err.message);
        if (i < attempts) {
          console.log(`[DB] Retrying in ${delay / 1000}s...`);
          await new Promise((r) => setTimeout(r, delay));
        } else {
          console.error('[DB] All init attempts failed. Server running but DB unavailable.');
        }
      }
    }
  })();
}

// ── EXPORT FOR TESTING ────────────────────────────
module.exports = app;