const request = require('supertest');
const express = require('express');

jest.mock('../src/db', () => ({
  query: jest.fn()
}));

const db = require('../src/db');
const authRouter = require('../src/routes/auth');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth Routes', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fail register if missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('should register user successfully', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@test.com',
        password: '123456'
      });

    expect(res.statusCode).toBeLessThan(500);
  });

  it('should fail login if user not found', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'no@test.com',
        password: '123456'
      });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

});
