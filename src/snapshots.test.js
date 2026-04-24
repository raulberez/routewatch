const { takeSnapshot, getAllSnapshots, getSnapshot, compareSnapshots, reset } = require('./snapshots');
const store = require('./store');

beforeEach(() => {
  store.reset();
  reset();
});

describe('takeSnapshot', () => {
  it('creates a snapshot with default label', () => {
    const snap = takeSnapshot();
    expect(snap.id).toBe(1);
    expect(snap.label).toBe('snapshot-1');
    expect(snap).toHaveProperty('timestamp');
    expect(snap).toHaveProperty('routes');
    expect(snap).toHaveProperty('stats');
  });

  it('creates a snapshot with a custom label', () => {
    const snap = takeSnapshot('before-deploy');
    expect(snap.label).toBe('before-deploy');
  });

  it('increments id for each snapshot', () => {
    const s1 = takeSnapshot();
    const s2 = takeSnapshot();
    expect(s2.id).toBe(s1.id + 1);
  });

  it('captures current route data', () => {
    store.record('GET', '/api/users', 200, 50);
    const snap = takeSnapshot();
    expect(snap.routeCount).toBe(1);
    expect(snap.routes['GET /api/users']).toBeDefined();
  });
});

describe('getAllSnapshots', () => {
  it('returns empty array initially', () => {
    expect(getAllSnapshots()).toEqual([]);
  });

  it('returns all taken snapshots', () => {
    takeSnapshot('a');
    takeSnapshot('b');
    expect(getAllSnapshots()).toHaveLength(2);
  });

  it('returns a copy, not the internal array', () => {
    const all = getAllSnapshots();
    all.push({ fake: true });
    expect(getAllSnapshots()).toHaveLength(0);
  });
});

describe('getSnapshot', () => {
  it('returns snapshot by id', () => {
    const snap = takeSnapshot('test');
    expect(getSnapshot(snap.id)).toEqual(snap);
  });

  it('returns null for unknown id', () => {
    expect(getSnapshot(999)).toBeNull();
  });
});

describe('compareSnapshots', () => {
  it('returns null if either snapshot does not exist', () => {
    takeSnapshot();
    expect(compareSnapshots(1, 99)).toBeNull();
  });

  it('computes delta between two snapshots', () => {
    store.record('GET', '/ping', 200, 10);
    takeSnapshot('before');
    store.record('GET', '/ping', 200, 10);
    store.record('GET', '/ping', 200, 10);
    takeSnapshot('after');

    const result = compareSnapshots(1, 2);
    expect(result).not.toBeNull();
    expect(result.diff['GET /ping'].delta).toBeGreaterThan(0);
  });

  it('shows new routes added between snapshots', () => {
    takeSnapshot('before');
    store.record('POST', '/new-route', 201, 20);
    takeSnapshot('after');

    const result = compareSnapshots(1, 2);
    expect(result.diff['POST /new-route'].countA).toBe(0);
    expect(result.diff['POST /new-route'].countB).toBeGreaterThan(0);
  });
});

describe('reset', () => {
  it('clears all snapshots', () => {
    takeSnapshot();
    takeSnapshot();
    reset();
    expect(getAllSnapshots()).toHaveLength(0);
  });
});
