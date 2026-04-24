const { filterRecords, filterRoutes } = require('./filters');
const store = require('./store');

beforeEach(() => {
  store.reset();
  // seed some records
  store.record({ method: 'GET',  route: '/users',   status: 200, duration: 45,  timestamp: '2024-01-01T10:00:00.000Z' });
  store.record({ method: 'POST', route: '/users',   status: 201, duration: 120, timestamp: '2024-01-01T10:01:00.000Z' });
  store.record({ method: 'GET',  route: '/users/1', status: 404, duration: 10,  timestamp: '2024-01-01T10:02:00.000Z' });
  store.record({ method: 'GET',  route: '/health',  status: 200, duration: 5,   timestamp: '2024-01-01T10:03:00.000Z' });
  store.record({ method: 'DELETE', route: '/users/1', status: 204, duration: 30, timestamp: '2024-01-02T09:00:00.000Z' });
});

describe('filterRecords', () => {
  test('filters by method', () => {
    const result = filterRecords({ method: 'GET' });
    expect(result).toHaveLength(3);
    result.forEach((r) => expect(r.method).toBe('GET'));
  });

  test('filters by status', () => {
    const result = filterRecords({ status: 200 });
    expect(result).toHaveLength(2);
    result.forEach((r) => expect(r.status).toBe(200));
  });

  test('filters by pathContains', () => {
    const result = filterRecords({ pathContains: '/users' });
    expect(result).toHaveLength(4);
  });

  test('filters by minDuration', () => {
    const result = filterRecords({ minDuration: 40 });
    expect(result).toHaveLength(2);
  });

  test('filters by maxDuration', () => {
    const result = filterRecords({ maxDuration: 20 });
    expect(result).toHaveLength(2);
  });

  test('filters by since', () => {
    const result = filterRecords({ since: '2024-01-02T00:00:00.000Z' });
    expect(result).toHaveLength(1);
    expect(result[0].method).toBe('DELETE');
  });

  test('combines multiple filters', () => {
    const result = filterRecords({ method: 'GET', status: 200 });
    expect(result).toHaveLength(2);
  });

  test('returns all records when no options given', () => {
    expect(filterRecords()).toHaveLength(5);
  });
});

describe('filterRoutes', () => {
  test('returns unique method+route pairs', () => {
    const result = filterRoutes({ method: 'GET' });
    expect(result).toHaveLength(3);
    result.forEach((r) => expect(r.method).toBe('GET'));
  });

  test('deduplicates identical routes', () => {
    store.record({ method: 'GET', route: '/health', status: 200, duration: 3, timestamp: new Date().toISOString() });
    const result = filterRoutes({ method: 'GET', pathContains: '/health' });
    expect(result).toHaveLength(1);
  });
});
