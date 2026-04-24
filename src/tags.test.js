const { setTags, getTags, getRoutesByTag, getAllTags, removeTags, reset } = require('./tags');

beforeEach(() => reset());

describe('setTags / getTags', () => {
  test('sets and retrieves tags for a route', () => {
    setTags('GET /api/users', ['public', 'v1']);
    expect(getTags('GET /api/users')).toEqual(['public', 'v1']);
  });

  test('returns empty array for unknown route', () => {
    expect(getTags('POST /unknown')).toEqual([]);
  });

  test('deduplicates tags', () => {
    setTags('GET /api/items', ['v1', 'v1', 'public']);
    expect(getTags('GET /api/items')).toEqual(['v1', 'public']);
  });

  test('trims whitespace from tags', () => {
    setTags('GET /api/items', ['  v1  ', ' public']);
    expect(getTags('GET /api/items')).toEqual(['v1', 'public']);
  });

  test('throws on invalid routeKey', () => {
    expect(() => setTags('', ['v1'])).toThrow();
    expect(() => setTags(null, ['v1'])).toThrow();
  });

  test('throws if tags is not an array', () => {
    expect(() => setTags('GET /x', 'v1')).toThrow();
  });
});

describe('getRoutesByTag', () => {
  test('returns routes matching a tag', () => {
    setTags('GET /api/users', ['public', 'v1']);
    setTags('POST /api/users', ['private', 'v1']);
    setTags('GET /api/health', ['public']);
    expect(getRoutesByTag('public').sort()).toEqual(['GET /api/health', 'GET /api/users']);
    expect(getRoutesByTag('v1').sort()).toEqual(['GET /api/users', 'POST /api/users']);
  });

  test('returns empty array when no routes match', () => {
    expect(getRoutesByTag('nonexistent')).toEqual([]);
  });
});

describe('getAllTags', () => {
  test('returns all tagged routes as an object', () => {
    setTags('GET /a', ['x']);
    setTags('POST /b', ['y', 'z']);
    const all = getAllTags();
    expect(all['GET /a']).toEqual(['x']);
    expect(all['POST /b']).toEqual(['y', 'z']);
  });

  test('returns empty object when no tags set', () => {
    expect(getAllTags()).toEqual({});
  });
});

describe('removeTags', () => {
  test('removes tags for a route', () => {
    setTags('GET /api/users', ['v1']);
    removeTags('GET /api/users');
    expect(getTags('GET /api/users')).toEqual([]);
  });

  test('returns false for unknown route', () => {
    expect(removeTags('GET /nope')).toBe(false);
  });
});

describe('reset', () => {
  test('clears all tags', () => {
    setTags('GET /x', ['a']);
    reset();
    expect(getAllTags()).toEqual({});
  });
});
