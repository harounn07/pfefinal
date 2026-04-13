// ✅ MOCKS MUST BE FIRST
jest.mock('../src/db', () => ({
  query: jest.fn(),
}));

const request = require('supertest');
const express = require('express');

const db = require('../src/db');
const todosRouter = require('../src/routes/todos');

const app = express();
app.use(express.json());

// ✅ FAKE AUTH (CRITICAL)
app.use((req, res, next) => {
  req.user = { id: 1 };
  next();
});

app.use('/api/todos', todosRouter);

describe('Todos Routes', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ───────────── GET TODOS ─────────────
  it('should return todos list', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, title: 'test', completed: false }]
    });

    const res = await request(app).get('/api/todos');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(0);
  });

  // ───────────── CREATE TODO ─────────────
  it('should create todo', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, title: 'new', completed: false }]
    });

    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'new' });

    expect(res.statusCode).toBe(201);
  });

  it('should fail if title missing', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({});

    expect(res.statusCode).toBe(400);
  });

  // ───────────── UPDATE TODO ─────────────
  it('should update todo', async () => {
    db.query
      // 1st call: SELECT to check if todo exists — must return rows with a match
      .mockResolvedValueOnce({
        rows: [{ id: 1, title: 'old', completed: false }]
      })
      // 2nd call: UPDATE RETURNING * — returns the updated todo
      .mockResolvedValueOnce({
        rows: [{ id: 1, title: 'updated', completed: true }]
      });

    const res = await request(app)
      .put('/api/todos/1')
      .send({ title: 'updated', completed: true });

    expect(res.statusCode).toBe(200);
  });

  it('should return 404 if todo not found', async () => {
    // SELECT returns no rows → 404
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .put('/api/todos/999')
      .send({ title: 'x' });

    expect(res.statusCode).toBe(404);
  });

  // ───────────── DELETE TODO ─────────────
  it('should delete todo', async () => {
    // DELETE only makes ONE query, return rows with the deleted item
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1 }]
    });

    const res = await request(app)
      .delete('/api/todos/1');

    expect(res.statusCode).toBe(200);
  });

  it('should return 404 if delete not found', async () => {
    // DELETE only makes ONE query, return empty rows → 404
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/api/todos/999');

    expect(res.statusCode).toBe(404);
  });

});