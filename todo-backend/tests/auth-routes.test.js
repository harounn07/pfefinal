const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../src/db', () => ({
  query: jest.fn()
}));
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const db = require('../src/db');
const authRouter = require('../src/routes/auth');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth Routes', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'testsecret';
    process.env.JWT_EXPIRES_IN = '7d';
  });

  // ───────────── REGISTER ─────────────

  it('should fail register if missing email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: '12345678' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Email and password are required');
  });

  it('should fail register if missing password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Email and password are required');
  });

  it('should fail register if missing both fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Email and password are required');
  });

  it('should fail register if password too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: '1234' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Password must be at least 8 characters');
  });

  it('should fail register if email already exists', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'existing@test.com', password: '12345678' });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe('An account with this email already exists');
  });

  it('should register user successfully', async () => {
    // No existing user
    db.query.mockResolvedValueOnce({ rows: [] });
    // INSERT returns new user
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: 'new@test.com', created_at: '2026-01-01' }]
    });
    bcrypt.hash.mockResolvedValueOnce('hashedpassword');
    jwt.sign.mockReturnValueOnce('fake-jwt-token');

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@test.com', password: '12345678' });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBe('fake-jwt-token');
    expect(res.body.user.email).toBe('new@test.com');
  });

  it('should return 500 if register query fails', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'fail@test.com', password: '12345678' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Registration failed');
  });

  // ───────────── LOGIN ─────────────

  it('should fail login if missing email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: '12345678' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Email and password are required');
  });

  it('should fail login if missing password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Email and password are required');
  });

  it('should fail login if user not found', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    bcrypt.compare.mockResolvedValueOnce(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'no@test.com', password: '12345678' });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('should fail login if password is wrong', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: 'user@test.com', password_hash: 'hashed' }]
    });
    bcrypt.compare.mockResolvedValueOnce(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('should login successfully with correct credentials', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: 'user@test.com', password_hash: 'hashed' }]
    });
    bcrypt.compare.mockResolvedValueOnce(true);
    jwt.sign.mockReturnValueOnce('login-jwt-token');

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'correctpassword' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe('login-jwt-token');
    expect(res.body.user.email).toBe('user@test.com');
  });

  it('should return 500 if login query fails', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fail@test.com', password: '12345678' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Login failed');
  });

});
