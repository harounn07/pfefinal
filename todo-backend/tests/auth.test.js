process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/index');

describe('API tests', () => {

  it('GET /health works', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/auth/register fails with empty body', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

});
