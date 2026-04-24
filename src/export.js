/**
 * export.js — utilities for exporting route stats as JSON or CSV
 */

const { getAll } = require('./store');
const { getRouteStat } = require('./stats');

/**
 * Export all recorded route stats as a JSON string.
 * @returns {string}
 */
function exportJSON() {
  const routes = getAll();
  const stats = routes.map(([method, path]) => getRouteStat(method, path));
  return JSON.stringify(stats, null, 2);
}

/**
 * Export all recorded route stats as a CSV string.
 * Columns: method, path, hits, avgDuration, lastSeen
 * @returns {string}
 */
function exportCSV() {
  const routes = getAll();
  const header = 'method,path,hits,avgDuration,lastSeen';

  if (routes.length === 0) {
    return header + '\n';
  }

  const rows = routes.map(([method, path]) => {
    const stat = getRouteStat(method, path);
    const avgDuration =
      typeof stat.avgDuration === 'number'
        ? stat.avgDuration.toFixed(2)
        : '';
    const lastSeen = stat.lastSeen ? new Date(stat.lastSeen).toISOString() : '';
    // Escape path in case it contains commas
    const safePath = `"${stat.path}"`;
    return [stat.method, safePath, stat.hits, avgDuration, lastSeen].join(',');
  });

  return [header, ...rows].join('\n') + '\n';
}

module.exports = { exportJSON, exportCSV };
