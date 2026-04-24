const { setThreshold, evaluate, getAlerts, reset } = require('./alerts');

beforeEach(() => {
  reset();
});

describe('setThreshold / evaluate', () => {
  test('returns null when no threshold is configured for a route', () => {
    const result = evaluate('GET /api/items', { count: 100, errors: 0, timestamps: [] });
    expect(result).toBeNull();
  });

  test('triggers alert when recent request count exceeds maxRequests', () => {
    setThreshold('GET /api/users', { maxRequests: 5, windowMs: 60_000 });

    const now = Date.now();
    const timestamps = Array.from({ length: 8 }, (_, i) => now - i * 1000);

    const alert = evaluate('GET /api/users', { count: 8, errors: 0, timestamps });

    expect(alert).not.toBeNull();
    expect(alert.route).toBe('GET /api/users');
    expect(alert.reason).toMatch(/request count 8 exceeds threshold 5/);
    expect(alert.triggeredAt).toBeLessThanOrEqual(Date.now());
  });

  test('does not trigger when recent count is within threshold', () => {
    setThreshold('GET /api/users', { maxRequests: 10, windowMs: 60_000 });

    const now = Date.now();
    const timestamps = Array.from({ length: 3 }, (_, i) => now - i * 1000);

    const alert = evaluate('GET /api/users', { count: 3, errors: 0, timestamps });
    expect(alert).toBeNull();
  });

  test('triggers alert when error rate exceeds maxErrorRate', () => {
    setThreshold('POST /api/login', { maxErrorRate: 0.2, windowMs: 60_000 });

    const alert = evaluate('POST /api/login', { count: 10, errors: 5, timestamps: [] });

    expect(alert).not.toBeNull();
    expect(alert.reason).toMatch(/error rate 50.0% exceeds threshold 20.0%/);
  });

  test('does not trigger when error rate is within threshold', () => {
    setThreshold('POST /api/login', { maxErrorRate: 0.5, windowMs: 60_000 });

    const alert = evaluate('POST /api/login', { count: 10, errors: 2, timestamps: [] });
    expect(alert).toBeNull();
  });

  test('ignores timestamps outside the time window', () => {
    setThreshold('GET /api/data', { maxRequests: 3, windowMs: 5_000 });

    const now = Date.now();
    // 2 recent + 5 old (outside 5s window)
    const timestamps = [
      now - 1000,
      now - 2000,
      now - 10_000,
      now - 20_000,
      now - 30_000,
      now - 40_000,
      now - 50_000,
    ];

    const alert = evaluate('GET /api/data', { count: 7, errors: 0, timestamps });
    expect(alert).toBeNull();
  });
});

describe('getAlerts', () => {
  test('accumulates multiple alerts', () => {
    setThreshold('GET /api/users', { maxRequests: 1, windowMs: 60_000 });

    const now = Date.now();
    const timestamps = [now - 100, now - 200];

    evaluate('GET /api/users', { count: 2, errors: 0, timestamps });
    evaluate('GET /api/users', { count: 3, errors: 0, timestamps: [...timestamps, now - 300] });

    expect(getAlerts()).toHaveLength(2);
  });

  test('reset clears alerts and thresholds', () => {
    setThreshold('GET /api/users', { maxRequests: 1, windowMs: 60_000 });
    evaluate('GET /api/users', { count: 5, errors: 0, timestamps: [Date.now()] });

    reset();

    expect(getAlerts()).toHaveLength(0);
    // threshold should be gone too
    const alert = evaluate('GET /api/users', { count: 99, errors: 0, timestamps: [] });
    expect(alert).toBeNull();
  });
});
