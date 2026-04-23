const { record, getAll, getRoute, reset, size } = require('./store');

beforeEach(() => {
  reset();
});

describe('store.record', () => {
  test('creates a new entry on first hit', () => {
    record('GET', '/api/users', 200, 42);
    expect(size()).toBe(1);
  });

  test('increments hit count on repeated calls', () => {
    record('GET', '/api/users', 200, 10);
    record('GET', '/api/users', 200, 20);
    const entry = getRoute('GET', '/api/users');
    expect(entry.hits).toBe(2);
  });

  test('calculates average response time correctly', () => {
    record('GET', '/api/users', 200, 100);
    record('GET', '/api/users', 200, 200);
    const entry = getRoute('GET', '/api/users');
    expect(entry.avgResponseTime).toBe(150);
  });

  test('tracks status codes separately', () => {
    record('GET', '/api/users', 200, 10);
    record('GET', '/api/users', 404, 5);
    record('GET', '/api/users', 200, 8);
    const entry = getRoute('GET', '/api/users');
    expect(entry.statusCodes[200]).toBe(2);
    expect(entry.statusCodes[404]).toBe(1);
  });

  test('treats different methods as different routes', () => {
    record('GET', '/api/users', 200, 10);
    record('POST', '/api/users', 201, 20);
    expect(size()).toBe(2);
  });

  test('sets lastHit to a valid ISO string', () => {
    record('DELETE', '/api/users/1', 204, 15);
    const entry = getRoute('DELETE', '/api/users/1');
    expect(new Date(entry.lastHit).toISOString()).toBe(entry.lastHit);
  });
});

describe('store.getAll', () => {
  test('returns all recorded routes', () => {
    record('GET', '/a', 200, 1);
    record('POST', '/b', 201, 2);
    const all = getAll();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all['GET /a']).toBeDefined();
    expect(all['POST /b']).toBeDefined();
  });

  test('returns empty object when store is empty', () => {
    expect(getAll()).toEqual({});
  });
});

describe('store.getRoute', () => {
  test('returns null for unknown route', () => {
    expect(getRoute('GET', '/nope')).toBeNull();
  });
});
