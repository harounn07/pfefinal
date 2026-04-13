const auth = require('../src/middleware/auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    return res;
  };

  beforeEach(() => {
    process.env.JWT_SECRET = 'testsecret';
    jest.clearAllMocks();
  });

  it('should return 401 if no token', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 500 if token is invalid (current behavior)', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const req = { headers: { authorization: 'Bearer invalid' } };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should call next if token is valid', () => {
    jwt.verify.mockReturnValue({ id: 1 });

    const req = { headers: { authorization: 'Bearer validtoken' } };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});