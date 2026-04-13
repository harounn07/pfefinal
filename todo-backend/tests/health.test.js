process.env.NODE_ENV = 'test';

jest.mock('../src/db', () => ({
  query: jest.fn(),
  on: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/index');

describe('Health endpoint', () => {

  it('GET /health returns status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

});