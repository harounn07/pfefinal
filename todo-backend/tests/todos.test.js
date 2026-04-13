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

  it('should return 500 if GET /todos query fails', async () => {
    db.query.mockRejectedValueOnce(new Error('DB connection failed'));

    const res = await request(app).get('/api/todos');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to fetch todos');
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

  it('should fail if title is empty string', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: '   ' });

    expect(res.statusCode).toBe(400);
  });

  it('should fail if title is not a string', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: 123 });

    expect(res.statusCode).toBe(400);
  });

  it('should return 500 if POST /todos query fails', async () => {
    db.query.mockRejectedValueOnce(new Error('Insert failed'));

    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'valid title' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to create todo');
  });

  // ───────────── UPDATE TODO ─────────────
  it('should update todo', async () => {
    db.query
      // 1st call: SELECT to check if todo exists
      .mockResolvedValueOnce({
        rows: [{ id: 1, title: 'old', completed: false }]
      })
      // 2nd call: UPDATE RETURNING *
      .mockResolvedValueOnce({
        rows: [{ id: 1, title: 'updated', completed: true }]
      });

    const res = await request(app)
      .put('/api/todos/1')
      .send({ title: 'updated', completed: true });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('updated');
    expect(res.body.completed).toBe(true);
  });

  it('should return 404 if todo not found on update', async () => {
    // SELECT returns no rows → 404
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .put('/api/todos/999')
      .send({ title: 'x' });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Todo not found');
  });

  it('should return 400 if PUT id is invalid', async () => {
    const res = await request(app)
      .put('/api/todos/abc')
      .send({ title: 'x' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid ID');
  });

  it('should return 500 if PUT /todos/:id query fails', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .put('/api/todos/1')
      .send({ title: 'x' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to update todo');
  });

  it('should update only completed field when title not provided', async () => {
    db.query
      .mockResolvedValueOnce({
        rows: [{ id: 1, title: 'keep this', completed: false }]
      })
      .mockResolvedValueOnce({
        rows: [{ id: 1, title: 'keep this', completed: true }]
      });

    const res = await request(app)
      .put('/api/todos/1')
      .send({ completed: true });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('keep this');
    expect(res.body.completed).toBe(true);
  });

  // ───────────── DELETE TODO ─────────────
  it('should delete todo', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1 }]
    });

    const res = await request(app)
      .delete('/api/todos/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Todo deleted');
  });

  it('should return 404 if delete not found', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/api/todos/999');

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Todo not found');
  });

  it('should return 400 if DELETE id is invalid', async () => {
    const res = await request(app)
      .delete('/api/todos/abc');

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid ID');
  });

  it('should return 500 if DELETE /todos/:id query fails', async () => {
    db.query.mockRejectedValueOnce(new Error('DB delete error'));

    const res = await request(app)
      .delete('/api/todos/1');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to delete todo');
  });

});