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

  it('should return 401 if no authorization header', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authorization header missing' });
  });

  it('should return 401 if scheme is not Bearer', () => {
    const req = { headers: { authorization: 'Basic sometoken' } };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid authorization format' });
  });

  it('should return 401 if token is missing after Bearer', () => {
    const req = { headers: { authorization: 'Bearer' } };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid authorization format' });
  });

  it('should return 500 if JWT_SECRET is not defined', () => {
    delete process.env.JWT_SECRET;

    const req = { headers: { authorization: 'Bearer validtoken' } };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Server configuration error' });
  });

  it('should return 401 if token is expired', () => {
    const err = new Error('jwt expired');
    err.name = 'TokenExpiredError';
    jwt.verify.mockImplementation(() => { throw err; });

    const req = { headers: { authorization: 'Bearer expiredtoken' } };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token expired, please log in again' });
  });

  it('should return 401 if token is malformed (JsonWebTokenError)', () => {
    const err = new Error('jwt malformed');
    err.name = 'JsonWebTokenError';
    jwt.verify.mockImplementation(() => { throw err; });

    const req = { headers: { authorization: 'Bearer badtoken' } };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('should return 500 on unexpected error', () => {
    const err = new Error('Something weird happened');
    err.name = 'UnknownError';
    jwt.verify.mockImplementation(() => { throw err; });

    const req = { headers: { authorization: 'Bearer invalid' } };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal authentication error' });
  });

  it('should call next and set req.user if token is valid', () => {
    jwt.verify.mockReturnValue({ id: 1, email: 'test@test.com' });

    const req = { headers: { authorization: 'Bearer validtoken' } };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 1, email: 'test@test.com' });
  });
});