'use strict';

const { record, reset } = require('./store');
const { getStats, getRouteStat } = require('./stats');

beforeEach(() => {
  reset();
});

describe('getStats()', () => {
  test('returns empty array when no records exist', () => {
    expect(getStats()).toEqual([]);
  });

  test('aggregates count for repeated routes', () => {
    record({ method: 'GET', path: '/users', status: 200, duration: 10 });
    record({ method: 'GET', path: '/users', status: 200, duration: 20 });
    const stats = getStats();
    expect(stats).toHaveLength(1);
    expect(stats[0].count).toBe(2);
  });

  test('computes correct avgDuration', () => {
    record({ method: 'GET', path: '/ping', status: 200, duration: 10 });
    record({ method: 'GET', path: '/ping', status: 200, duration: 30 });
    const stats = getStats();
    expect(stats[0].avgDuration).toBe(20);
  });

  test('tracks minDuration and maxDuration', () => {
    record({ method: 'POST', path: '/items', status: 201, duration: 5 });
    record({ method: 'POST', path: '/items', status: 201, duration: 50 });
    const stats = getStats();
    expect(stats[0].minDuration).toBe(5);
    expect(stats[0].maxDuration).toBe(50);
  });

  test('tracks status code distribution', () => {
    record({ method: 'GET', path: '/users', status: 200, duration: 10 });
    record({ method: 'GET', path: '/users', status: 404, duration: 5 });
    const stats = getStats();
    expect(stats[0].statusCodes).toEqual({ '200': 1, '404': 1 });
  });

  test('treats different methods as separate routes', () => {
    record({ method: 'GET', path: '/items', status: 200, duration: 10 });
    record({ method: 'POST', path: '/items', status: 201, duration: 15 });
    expect(getStats()).toHaveLength(2);
  });
});

describe('getRouteStat()', () => {
  test('returns null when route not found', () => {
    expect(getRouteStat('GET', '/missing')).toBeNull();
  });

  test('returns correct stat for existing route', () => {
    record({ method: 'DELETE', path: '/items/1', status: 204, duration: 8 });
    const stat = getRouteStat('DELETE', '/items/1');
    expect(stat).not.toBeNull();
    expect(stat.count).toBe(1);
    expect(stat.method).toBe('DELETE');
  });

  test('is case-insensitive for method', () => {
    record({ method: 'GET', path: '/health', status: 200, duration: 2 });
    expect(getRouteStat('get', '/health')).not.toBeNull();
  });
});
