const { capture, getAll, getById, filter, reset, size } = require('./replay');

function makeReq(overrides = {}) {
  return {
    method: 'GET',
    path: '/api/test',
    query: {},
    headers: { 'content-type': 'application/json' },
    body: null,
    ...overrides
  };
}

beforeEach(() => reset());

describe('capture', () => {
  it('stores a request entry', () => {
    const entry = capture(makeReq());
    expect(entry).toHaveProperty('id');
    expect(entry.method).toBe('GET');
    expect(entry.path).toBe('/api/test');
    expect(entry).toHaveProperty('capturedAt');
  });

  it('increments size', () => {
    capture(makeReq());
    capture(makeReq());
    expect(size()).toBe(2);
  });
});

describe('getAll', () => {
  it('returns all captured entries', () => {
    capture(makeReq({ path: '/a' }));
    capture(makeReq({ path: '/b' }));
    const all = getAll();
    expect(all).toHaveLength(2);
    expect(all[0].path).toBe('/a');
  });

  it('returns a copy, not the internal array', () => {
    const all = getAll();
    all.push({ fake: true });
    expect(size()).toBe(0);
  });
});

describe('getById', () => {
  it('returns the correct entry', () => {
    const entry = capture(makeReq({ path: '/find-me' }));
    const found = getById(entry.id);
    expect(found).not.toBeNull();
    expect(found.path).toBe('/find-me');
  });

  it('returns null for unknown id', () => {
    expect(getById('nope')).toBeNull();
  });
});

describe('filter', () => {
  beforeEach(() => {
    capture(makeReq({ method: 'GET', path: '/users' }));
    capture(makeReq({ method: 'POST', path: '/users' }));
    capture(makeReq({ method: 'GET', path: '/items' }));
  });

  it('filters by method', () => {
    const results = filter({ method: 'POST' });
    expect(results).toHaveLength(1);
    expect(results[0].method).toBe('POST');
  });

  it('filters by path', () => {
    const results = filter({ path: '/users' });
    expect(results).toHaveLength(2);
  });

  it('filters by method and path', () => {
    const results = filter({ method: 'GET', path: '/items' });
    expect(results).toHaveLength(1);
  });

  it('returns all when no filter given', () => {
    expect(filter()).toHaveLength(3);
  });
});

describe('reset', () => {
  it('clears all entries', () => {
    capture(makeReq());
    reset();
    expect(size()).toBe(0);
  });
});
