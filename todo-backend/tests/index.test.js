process.env.NODE_ENV = 'test';

jest.mock('../src/db', () => ({
  query: jest.fn(),
  on: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/index');

describe('Server (index.js)', () => {

  it('GET /health should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET unknown route should return 404', async () => {
    const res = await request(app).get('/this-does-not-exist');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toContain('not found');
  });

  it('POST unknown route should return 404', async () => {
    const res = await request(app).post('/random-path');
    expect(res.statusCode).toBe(404);
  });

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
});
