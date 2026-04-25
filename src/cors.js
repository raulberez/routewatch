/**
 * cors.js — CORS configuration and per-route origin tracking for routewatch
 */

const store = new Map();

let globalConfig = {
  allowedOrigins: ['*'],
  trackOrigins: true,
};

function configure(options = {}) {
  globalConfig = { ...globalConfig, ...options };
}

function getConfig() {
  return { ...globalConfig };
}

function recordOrigin(route, method, origin) {
  if (!globalConfig.trackOrigins) return;
  const key = `${method.toUpperCase()}:${route}`;
  if (!store.has(key)) {
    store.set(key, new Set());
  }
  if (origin) {
    store.get(key).add(origin);
  }
}

function getOrigins(route, method) {
  const key = `${method.toUpperCase()}:${route}`;
  const origins = store.get(key);
  return origins ? Array.from(origins) : [];
}

function getAllOrigins() {
  const result = {};
  for (const [key, origins] of store.entries()) {
    result[key] = Array.from(origins);
  }
  return result;
}

function isAllowed(origin) {
  const { allowedOrigins } = globalConfig;
  if (allowedOrigins.includes('*')) return true;
  return allowedOrigins.includes(origin);
}

function reset() {
  store.clear();
  globalConfig = { allowedOrigins: ['*'], trackOrigins: true };
}

module.exports = { configure, getConfig, recordOrigin, getOrigins, getAllOrigins, isAllowed, reset };
