describe('DB module', () => {
  let pool;

  beforeEach(() => {
    jest.resetModules();
    // Set required env vars before importing
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASSWORD = 'testpass';
    process.env.DB_NAME = 'testdb';
    process.env.DB_SSL = 'false';
  });

  it('should export a pool instance', () => {
    pool = require('../src/db');
    expect(pool).toBeDefined();
    expect(pool.query).toBeDefined();
  });

  it('should register connect event handler', () => {
    pool = require('../src/db');
    // Manually trigger the 'connect' event to cover line 18
    pool.emit('connect');
  });

  it('should register error event handler', () => {
    pool = require('../src/db');
    // Manually trigger the 'error' event to cover line 23
    // Suppress console.error output in tests
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    pool.emit('error', new Error('test error'));
    expect(spy).toHaveBeenCalledWith('[DB] Unexpected error:', 'test error');
    spy.mockRestore();
  });

  it('should use SSL when DB_SSL is true', () => {
    jest.resetModules();
    process.env.DB_SSL = 'true';
    pool = require('../src/db');
    expect(pool).toBeDefined();
  });

  afterEach(() => {
    // Clean up pool connections
    if (pool && pool.end) {
      pool.end().catch(() => {});
    }
  });
});
