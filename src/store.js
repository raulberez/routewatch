/**
 * In-memory store for route usage statistics.
 * Tracks hit counts, response times, and status codes per route.
 */

const store = new Map();

const DEFAULT_ENTRY = () => ({
  hits: 0,
  totalResponseTime: 0,
  avgResponseTime: 0,
  statusCodes: {},
  lastHit: null,
});

function record(method, path, statusCode, responseTimeMs) {
  const key = `${method.toUpperCase()} ${path}`;

  if (!store.has(key)) {
    store.set(key, DEFAULT_ENTRY());
  }

  const entry = store.get(key);
  entry.hits += 1;
  entry.totalResponseTime += responseTimeMs;
  entry.avgResponseTime = Math.round(entry.totalResponseTime / entry.hits);
  entry.statusCodes[statusCode] = (entry.statusCodes[statusCode] || 0) + 1;
  entry.lastHit = new Date().toISOString();

  store.set(key, entry);
}

function getAll() {
  const result = {};
  for (const [key, value] of store.entries()) {
    result[key] = { ...value };
  }
  return result;
}

function getRoute(method, path) {
  const key = `${method.toUpperCase()} ${path}`;
  return store.has(key) ? { ...store.get(key) } : null;
}

function reset() {
  store.clear();
}

function size() {
  return store.size;
}

module.exports = { record, getAll, getRoute, reset, size };
