/**
 * filters.js — filter and search route records by method, status, path pattern, etc.
 */

const { getAll } = require('./store');

/**
 * Filter records by one or more criteria.
 * @param {Object} options
 * @param {string} [options.method]       - HTTP method (GET, POST, ...)
 * @param {number} [options.status]       - exact status code
 * @param {string} [options.pathContains] - substring match on route path
 * @param {number} [options.minDuration]  - minimum response time in ms
 * @param {number} [options.maxDuration]  - maximum response time in ms
 * @param {string} [options.since]        - ISO date string; only records after this time
 * @returns {Array}
 */
function filterRecords(options = {}) {
  const { method, status, pathContains, minDuration, maxDuration, since } = options;
  const sinceMs = since ? new Date(since).getTime() : null;

  return getAll().filter((rec) => {
    if (method && rec.method.toUpperCase() !== method.toUpperCase()) return false;
    if (status !== undefined && rec.status !== Number(status)) return false;
    if (pathContains && !rec.route.includes(pathContains)) return false;
    if (minDuration !== undefined && rec.duration < Number(minDuration)) return false;
    if (maxDuration !== undefined && rec.duration > Number(maxDuration)) return false;
    if (sinceMs && new Date(rec.timestamp).getTime() < sinceMs) return false;
    return true;
  });
}

/**
 * Return unique routes that match the given criteria.
 */
function filterRoutes(options = {}) {
  const records = filterRecords(options);
  const seen = new Set();
  return records
    .map((r) => ({ method: r.method, route: r.route }))
    .filter(({ method, route }) => {
      const key = `${method}:${route}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

module.exports = { filterRecords, filterRoutes };
