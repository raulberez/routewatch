const { configure, record, getRate, isThrottled, getAllRates, reset } = require('./rateLimit');

beforeEach(() => {
  reset();
});

describe('rateLimit', () => {
  test('getRate returns 0 for unknown route', () => {
    expect(getRate('/api/test', 'GET')).toBe(0);
  });

  test('record increments rate for a route', () => {
    record('/api/users', 'GET');
    record('/api/users', 'GET');
    expect(getRate('/api/users', 'GET')).toBe(2);
  });

  test('record distinguishes between methods', () => {
    record('/api/users', 'GET');
    record('/api/users', 'POST');
    expect(getRate('/api/users', 'GET')).toBe(1);
    expect(getRate('/api/users', 'POST')).toBe(1);
  });

  test('old entries outside window are pruned', () => {
    configure({ windowMs: 1000, maxRequests: 10 });
    const now = Date.now();
    record('/api/data', 'GET', now - 2000); // outside window
    record('/api/data', 'GET', now - 500);  // inside window
    expect(getRate('/api/data', 'GET', now)).toBe(1);
  });

  test('isThrottled returns false when under limit', () => {
    configure({ windowMs: 60000, maxRequests: 5 });
    for (let i = 0; i < 5; i++) record('/api/items', 'GET');
    expect(isThrottled('/api/items', 'GET')).toBe(false);
  });

  test('isThrottled returns true when over limit', () => {
    configure({ windowMs: 60000, maxRequests: 3 });
    for (let i = 0; i < 4; i++) record('/api/items', 'GET');
    expect(isThrottled('/api/items', 'GET')).toBe(true);
  });

  test('getAllRates returns entries for all recorded routes', () => {
    record('/api/a', 'GET');
    record('/api/b', 'POST');
    const rates = getAllRates();
    expect(rates.length).toBe(2);
    const routes = rates.map((r) => r.route);
    expect(routes).toContain('/api/a');
    expect(routes).toContain('/api/b');
  });

  test('getAllRates marks throttled routes correctly', () => {
    configure({ windowMs: 60000, maxRequests: 2 });
    record('/api/hot', 'GET');
    record('/api/hot', 'GET');
    record('/api/hot', 'GET');
    const rates = getAllRates();
    const hot = rates.find((r) => r.route === '/api/hot');
    expect(hot.throttled).toBe(true);
  });

  test('reset clears all state', () => {
    record('/api/x', 'DELETE');
    reset();
    expect(getRate('/api/x', 'DELETE')).toBe(0);
    expect(getAllRates().length).toBe(0);
  });
});
