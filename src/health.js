// health.js — tracks uptime and basic health metrics for routewatch

const { size } = require('./store');
const { getAllRates } = require('./rateLimit');

const startedAt = Date.now();

function getUptime() {
  return Math.floor((Date.now() - startedAt) / 1000);
}

function getHealth() {
  let throttledCount = 0;

  try {
    const rates = getAllRates();
    throttledCount = Object.values(rates).filter(r => r.throttled).length;
  } catch (_) {
    // rateLimit may not be configured
  }

  const totalRoutes = size();
  const uptimeSeconds = getUptime();

  const status = throttledCount > 0 ? 'degraded' : 'ok';

  return {
    status,
    uptime: uptimeSeconds,
    startedAt: new Date(startedAt).toISOString(),
    totalRoutesTracked: totalRoutes,
    throttledRoutes: throttledCount,
    timestamp: new Date().toISOString(),
  };
}

function isHealthy() {
  return getHealth().status === 'ok';
}

module.exports = { getHealth, isHealthy, getUptime };
