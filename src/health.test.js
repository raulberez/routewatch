const { getHealth, isHealthy, getUptime } = require('./health');
const store = require('./store');
const rateLimit = require('./rateLimit');

beforeEach(() => {
  store.reset();
  rateLimit.reset();
});

describe('getUptime', () => {
  it('returns a non-negative number', () => {
    const uptime = getUptime();
    expect(typeof uptime).toBe('number');
    expect(uptime).toBeGreaterThanOrEqual(0);
  });
});

describe('getHealth', () => {
  it('returns ok status when no routes are throttled', () => {
    const health = getHealth();
    expect(health.status).toBe('ok');
  });

  it('includes expected fields', () => {
    const health = getHealth();
    expect(health).toHaveProperty('status');
    expect(health).toHaveProperty('uptime');
    expect(health).toHaveProperty('startedAt');
    expect(health).toHaveProperty('totalRoutesTracked');
    expect(health).toHaveProperty('throttledRoutes');
    expect(health).toHaveProperty('timestamp');
  });

  it('reflects total routes tracked from store', () => {
    store.record('GET', '/api/users', 200, 42);
    store.record('POST', '/api/items', 201, 30);
    const health = getHealth();
    expect(health.totalRoutesTracked).toBe(2);
  });

  it('returns degraded status when routes are throttled', () => {
    rateLimit.configure({ windowMs: 1000, max: 1 });
    rateLimit.record('GET /throttled');
    rateLimit.record('GET /throttled');
    const health = getHealth();
    expect(health.status).toBe('degraded');
    expect(health.throttledRoutes).toBeGreaterThan(0);
  });
});

describe('isHealthy', () => {
  it('returns true when status is ok', () => {
    expect(isHealthy()).toBe(true);
  });

  it('returns false when throttled routes exist', () => {
    rateLimit.configure({ windowMs: 1000, max: 1 });
    rateLimit.record('GET /busy');
    rateLimit.record('GET /busy');
    expect(isHealthy()).toBe(false);
  });
});
