process.env.NODE_ENV = 'test';

jest.mock('../src/db', () => ({
  query: jest.fn(),
  on: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/index');

describe('Auth integration', () => {

  it('POST /api/auth/register fails with empty body', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});

    expect(res.statusCode).toBe(400);
  });

  it('POST /api/auth/login fails with empty body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.statusCode).toBe(400);
  });

});
