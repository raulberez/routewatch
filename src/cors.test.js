const cors = require('./cors');

beforeEach(() => {
  cors.reset();
});

describe('configure / getConfig', () => {
  test('returns default config', () => {
    const cfg = cors.getConfig();
    expect(cfg.allowedOrigins).toEqual(['*']);
    expect(cfg.trackOrigins).toBe(true);
  });

  test('merges new config', () => {
    cors.configure({ allowedOrigins: ['https://example.com'], trackOrigins: false });
    const cfg = cors.getConfig();
    expect(cfg.allowedOrigins).toEqual(['https://example.com']);
    expect(cfg.trackOrigins).toBe(false);
  });
});

describe('recordOrigin / getOrigins', () => {
  test('records origins per route+method', () => {
    cors.recordOrigin('/api/users', 'GET', 'https://app.io');
    cors.recordOrigin('/api/users', 'GET', 'https://other.io');
    const origins = cors.getOrigins('/api/users', 'GET');
    expect(origins).toContain('https://app.io');
    expect(origins).toContain('https://other.io');
    expect(origins).toHaveLength(2);
  });

  test('deduplicates same origin', () => {
    cors.recordOrigin('/api/test', 'POST', 'https://dup.io');
    cors.recordOrigin('/api/test', 'POST', 'https://dup.io');
    expect(cors.getOrigins('/api/test', 'POST')).toHaveLength(1);
  });

  test('returns empty array for unknown route', () => {
    expect(cors.getOrigins('/nope', 'GET')).toEqual([]);
  });

  test('does not record when trackOrigins is false', () => {
    cors.configure({ trackOrigins: false });
    cors.recordOrigin('/api/silent', 'GET', 'https://ignored.io');
    expect(cors.getOrigins('/api/silent', 'GET')).toEqual([]);
  });
});

describe('getAllOrigins', () => {
  test('returns all tracked routes', () => {
    cors.recordOrigin('/a', 'GET', 'https://x.io');
    cors.recordOrigin('/b', 'POST', 'https://y.io');
    const all = cors.getAllOrigins();
    expect(all['GET:/a']).toContain('https://x.io');
    expect(all['POST:/b']).toContain('https://y.io');
  });
});

describe('isAllowed', () => {
  test('allows all when wildcard', () => {
    expect(cors.isAllowed('https://anything.com')).toBe(true);
  });

  test('allows listed origin', () => {
    cors.configure({ allowedOrigins: ['https://safe.io'] });
    expect(cors.isAllowed('https://safe.io')).toBe(true);
  });

  test('blocks unlisted origin', () => {
    cors.configure({ allowedOrigins: ['https://safe.io'] });
    expect(cors.isAllowed('https://evil.io')).toBe(false);
  });
});
