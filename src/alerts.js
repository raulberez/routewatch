/**
 * alerts.js
 * Defines threshold-based alerting for route usage anomalies.
 * Alerts are triggered when a route exceeds a configured request count
 * or error rate within a rolling time window.
 */

const alerts = [];
const thresholds = {};

/**
 * Configure a threshold alert for a given route.
 * @param {string} route - e.g. 'GET /api/users'
 * @param {{ maxRequests?: number, maxErrorRate?: number, windowMs?: number }} options
 */
function setThreshold(route, options = {}) {
  thresholds[route] = {
    maxRequests: options.maxRequests ?? null,
    maxErrorRate: options.maxErrorRate ?? null,
    windowMs: options.windowMs ?? 60_000,
  };
}

/**
 * Evaluate a route stat against configured thresholds.
 * Pushes an alert object if a threshold is breached.
 * @param {string} route
 * @param {{ count: number, errors: number, timestamps: number[] }} stat
 * @returns {object|null} alert object or null
 */
function evaluate(route, stat) {
  const cfg = thresholds[route];
  if (!cfg) return null;

  const now = Date.now();
  const windowStart = now - cfg.windowMs;
  const recentTimestamps = (stat.timestamps || []).filter((t) => t >= windowStart);
  const recentCount = recentTimestamps.length;
  const errorRate = stat.count > 0 ? stat.errors / stat.count : 0;

  let reason = null;

  if (cfg.maxRequests !== null && recentCount > cfg.maxRequests) {
    reason = `request count ${recentCount} exceeds threshold ${cfg.maxRequests} in last ${cfg.windowMs}ms`;
  } else if (cfg.maxErrorRate !== null && errorRate > cfg.maxErrorRate) {
    reason = `error rate ${(errorRate * 100).toFixed(1)}% exceeds threshold ${(cfg.maxErrorRate * 100).toFixed(1)}%`;
  }

  if (!reason) return null;

  const alert = { route, reason, triggeredAt: now };
  alerts.push(alert);
  return alert;
}

/**
 * Return all recorded alerts.
 */
function getAlerts() {
  return [...alerts];
}

/**
 * Clear all alerts and thresholds (useful for testing).
 */
function reset() {
  alerts.length = 0;
  Object.keys(thresholds).forEach((k) => delete thresholds[k]);
}

module.exports = { setThreshold, evaluate, getAlerts, reset };
