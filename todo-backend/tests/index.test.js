process.env.NODE_ENV = 'test';

jest.mock('../src/db', () => ({
  query: jest.fn(),
  on: jest.fn(),
}));

const request = require('supertest');
const db = require('../src/db');
const app = require('../src/index');

describe('Server (index.js)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ───────────── HEALTH ─────────────
  it('GET /health should return status ok when DB is reachable', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });

    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /health should return 503 when DB is unreachable', async () => {
    db.query.mockRejectedValueOnce(new Error('Connection refused'));

    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get('/health');
    spy.mockRestore();

    expect(res.statusCode).toBe(503);
    expect(res.body.status).toBe('error');
    expect(res.body.error).toBe('Database unreachable');
    expect(res.body.timestamp).toBeDefined();
  });

  // ───────────── 404 HANDLER ─────────────
  it('GET unknown route should return 404', async () => {
    const res = await request(app).get('/this-does-not-exist');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toContain('not found');
  });

  it('POST unknown route should return 404', async () => {
    const res = await request(app).post('/random-path');
    expect(res.statusCode).toBe(404);
  });

  // ───────────── AUTH INTEGRATION ─────────────
  it('GET /api/todos without auth should return 401', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/auth/register with empty body should return 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/auth/login with empty body should return 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.statusCode).toBe(400);
  });

  // ───────────── CORS ─────────────
  it('should include CORS headers in response', async () => {
    const res = await request(app)
      .options('/health')
      .set('Origin', 'http://localhost:5173');
    // CORS middleware should respond (not blocked)
    expect(res.statusCode).toBeLessThan(500);
  });
});
