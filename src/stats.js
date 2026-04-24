/**
 * Computes summary statistics from raw route records.
 */

'use strict';

const { getAll } = require('./store');

/**
 * Returns aggregated stats for all recorded routes.
 * @returns {Object[]} array of route stat objects
 */
function getStats() {
  const records = getAll();
  const map = {};

  for (const entry of records) {
    const key = `${entry.method}:${entry.path}`;
    if (!map[key]) {
      map[key] = {
        method: entry.method,
        path: entry.path,
        count: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: -Infinity,
        statusCodes: {},
      };
    }

    const stat = map[key];
    stat.count += 1;
    stat.totalDuration += entry.duration;
    if (entry.duration < stat.minDuration) stat.minDuration = entry.duration;
    if (entry.duration > stat.maxDuration) stat.maxDuration = entry.duration;

    const code = String(entry.status);
    stat.statusCodes[code] = (stat.statusCodes[code] || 0) + 1;
  }

  return Object.values(map).map((stat) => ({
    ...stat,
    avgDuration:
      stat.count > 0 ? Math.round(stat.totalDuration / stat.count) : 0,
    minDuration: stat.minDuration === Infinity ? 0 : stat.minDuration,
    maxDuration: stat.maxDuration === -Infinity ? 0 : stat.maxDuration,
  }));
}

/**
 * Returns stats for a single route.
 * @param {string} method - HTTP method
 * @param {string} path - route path
 * @returns {Object|null}
 */
function getRouteStat(method, path) {
  return (
    getStats().find(
      (s) => s.method === method.toUpperCase() && s.path === path
    ) || null
  );
}

module.exports = { getStats, getRouteStat };
