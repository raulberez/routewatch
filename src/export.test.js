const { exportJSON, exportCSV } = require('./export');
const { record, reset } = require('./store');

beforeEach(() => {
  reset();
});

describe('exportJSON', () => {
  it('returns an empty JSON array when no routes recorded', () => {
    const result = exportJSON();
    const parsed = JSON.parse(result);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(0);
  });

  it('returns JSON with stats for recorded routes', () => {
    record('GET', '/api/users', 120);
    record('GET', '/api/users', 80);
    record('POST', '/api/users', 200);

    const result = exportJSON();
    const parsed = JSON.parse(result);

    expect(parsed).toHaveLength(2);

    const getRoute = parsed.find(r => r.method === 'GET' && r.path === '/api/users');
    expect(getRoute).toBeDefined();
    expect(getRoute.hits).toBe(2);
    expect(getRoute.avgDuration).toBeCloseTo(100, 1);

    const postRoute = parsed.find(r => r.method === 'POST' && r.path === '/api/users');
    expect(postRoute).toBeDefined();
    expect(postRoute.hits).toBe(1);
  });
});

describe('exportCSV', () => {
  it('returns only the header row when no routes recorded', () => {
    const result = exportCSV();
    const lines = result.trim().split('\n');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe('method,path,hits,avgDuration,lastSeen');
  });

  it('returns header + data rows for recorded routes', () => {
    record('GET', '/health', 10);
    record('DELETE', '/api/item', 55);

    const result = exportCSV();
    const lines = result.trim().split('\n');

    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('method,path,hits,avgDuration,lastSeen');

    const dataLines = lines.slice(1);
    const hasGet = dataLines.some(l => l.startsWith('GET,'));
    const hasDelete = dataLines.some(l => l.startsWith('DELETE,'));
    expect(hasGet).toBe(true);
    expect(hasDelete).toBe(true);
  });

  it('includes a valid ISO date in the lastSeen column', () => {
    record('GET', '/ping', 5);
    const result = exportCSV();
    const dataLine = result.trim().split('\n')[1];
    const cols = dataLine.split(',');
    // lastSeen is last column
    const lastSeen = cols[cols.length - 1];
    expect(() => new Date(lastSeen).toISOString()).not.toThrow();
  });
});
