process.env.NODE_ENV = 'test';

jest.mock('../src/db', () => ({
  query: jest.fn(),
  on: jest.fn(),
}));

const request = require('supertest');
const db = require('../src/db');
const app = require('../src/index');

describe('Health endpoint', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /health returns status ok when DB responds', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });

    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /health returns 503 when DB fails', async () => {
    db.query.mockRejectedValueOnce(new Error('DB down'));

    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get('/health');
    spy.mockRestore();

    expect(res.statusCode).toBe(503);
    expect(res.body.status).toBe('error');
    expect(res.body.error).toBe('Database unreachable');
  });
});