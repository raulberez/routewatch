/**
 * rateLimit.js
 * Tracks request rates per route and detects bursts within a time window.
 */

const windows = {};

const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 100;

let config = {
  windowMs: DEFAULT_WINDOW_MS,
  maxRequests: DEFAULT_MAX_REQUESTS,
};

function configure(options = {}) {
  config = { ...config, ...options };
}

function record(route, method, timestamp = Date.now()) {
  const key = `${method}:${route}`;
  if (!windows[key]) {
    windows[key] = [];
  }
  windows[key].push(timestamp);
  // prune old entries outside the window
  const cutoff = timestamp - config.windowMs;
  windows[key] = windows[key].filter((t) => t >= cutoff);
}

function getRate(route, method, now = Date.now()) {
  const key = `${method}:${route}`;
  if (!windows[key]) return 0;
  const cutoff = now - config.windowMs;
  return windows[key].filter((t) => t >= cutoff).length;
}

function isThrottled(route, method, now = Date.now()) {
  return getRate(route, method, now) > config.maxRequests;
}

function getAllRates(now = Date.now()) {
  const cutoff = now - config.windowMs;
  return Object.entries(windows).map(([key, timestamps]) => {
    const [method, ...routeParts] = key.split(':');
    const route = routeParts.join(':');
    const count = timestamps.filter((t) => t >= cutoff).length;
    return { route, method, count, throttled: count > config.maxRequests };
  });
}

function reset() {
  for (const key in windows) {
    delete windows[key];
  }
  config = { windowMs: DEFAULT_WINDOW_MS, maxRequests: DEFAULT_MAX_REQUESTS };
}

module.exports = { configure, record, getRate, isThrottled, getAllRates, reset };
