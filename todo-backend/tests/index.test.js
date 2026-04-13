const request = require('supertest');
const app = require('../src/index');

describe('Server', () => {
  it('GET /health should work', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
  });

  it('GET unknown route should return 404', async () => {
    const res = await request(app).get('/unknown');
    expect(res.statusCode).toBe(404);
  });
});
