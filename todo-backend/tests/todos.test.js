const request = require('supertest');
const express = require('express');

// MOCK DB BEFORE IMPORT
jest.mock('../src/db', () => ({
  query: jest.fn().mockResolvedValue({ rows: [] })
}));

const todosRouter = require('../src/routes/todos');

const app = express();
app.use(express.json());

// mock auth
app.use((req, res, next) => {
  req.user = { id: 1 };
  next();
});

app.use('/api/todos', todosRouter);

describe('Todos Routes', () => {
  it('GET /api/todos should return 200', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.statusCode).toBe(200);
  });

  it('POST /api/todos should create todo', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'Test todo' });

    expect(res.statusCode).toBe(201);
  });
});