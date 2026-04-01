require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const pool       = require('./db');
const authRouter  = require('./routes/auth');
const todosRouter = require('./routes/todos');
const authMiddleware = require('./middleware/auth');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Global middleware ──────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// ── Public routes (no token needed) ───────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);

// ── Protected routes (token required) ─────────────────────
app.use('/api/todos', authMiddleware, todosRouter);

// ── 404 handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Unhandled error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Create tables then start server ───────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL       PRIMARY KEY,
      email         TEXT         NOT NULL UNIQUE,
      password_hash TEXT         NOT NULL,
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id         SERIAL       PRIMARY KEY,
      title      TEXT         NOT NULL,
      completed  BOOLEAN      NOT NULL DEFAULT FALSE,
      user_id    INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);

  console.log('[DB] Schema ready');
}

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[Server] Listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[DB] Init failed:', err.message);
    process.exit(1);
  });