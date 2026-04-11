const express = require('express');
const router = express.Router();
const pool = require('../db');

// ── Utils ─────────────────────────────────────
function isValidId(id) {
  return Number.isInteger(Number.parseInt(id, 10));
}

// ── GET /api/todos ────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error('[GET /todos]', err.message);
    return res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// ── POST /api/todos ───────────────────────────
router.post('/', async (req, res) => {
  const { title } = req.body;

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO todos (title, user_id) VALUES ($1, $2) RETURNING *',
      [title.trim(), req.user.id]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[POST /todos]', err.message);
    return res.status(500).json({ error: 'Failed to create todo' });
  }
});

// ── PUT /api/todos/:id ────────────────────────
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const existing = await pool.query(
      'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const current = existing.rows[0];

    const newTitle =
      typeof title === 'string' ? title.trim() : current.title;

    const newCompleted =
      typeof completed === 'boolean'
        ? completed
        : current.completed;

    const result = await pool.query(
      `UPDATE todos
       SET title = $1, completed = $2
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [newTitle, newCompleted, id, req.user.id]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('[PUT /todos/:id]', err.message);
    return res.status(500).json({ error: 'Failed to update todo' });
  }
});

// ── DELETE /api/todos/:id ─────────────────────
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    return res.json({
      message: 'Todo deleted',
      id: result.rows[0].id,
    });
  } catch (err) {
    console.error('[DELETE /todos/:id]', err.message);
    return res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = router;