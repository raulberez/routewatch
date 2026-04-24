/**
 * rateLimitRouter.js
 * Exposes rate limit data via REST endpoints.
 */

const { Router } = require('express');
const { getAllRates, getRate, isThrottled, configure, reset } = require('./rateLimit');

function createRateLimitRouter(options = {}) {
  const router = Router();

  // GET /ratelimit — list all route rates
  router.get('/', (req, res) => {
    const rates = getAllRates();
    res.json({ windowMs: options.windowMs || 60000, routes: rates });
  });

  // GET /ratelimit/check?route=/api/foo&method=GET — check a specific route
  router.get('/check', (req, res) => {
    const { route, method } = req.query;
    if (!route || !method) {
      return res.status(400).json({ error: 'route and method query params are required' });
    }
    const count = getRate(route, method.toUpperCase());
    const throttled = isThrottled(route, method.toUpperCase());
    res.json({ route, method: method.toUpperCase(), count, throttled });
  });

  // POST /ratelimit/configure — update window and max config
  router.post('/configure', (req, res) => {
    const { windowMs, maxRequests } = req.body || {};
    if (!windowMs && !maxRequests) {
      return res.status(400).json({ error: 'provide windowMs or maxRequests' });
    }
    configure({ ...(windowMs && { windowMs }), ...(maxRequests && { maxRequests }) });
    res.json({ success: true, windowMs, maxRequests });
  });

  // DELETE /ratelimit/reset — clear all rate data
  router.delete('/reset', (req, res) => {
    reset();
    res.json({ success: true, message: 'Rate limit data cleared' });
  });

  return router;
}

module.exports = { createRateLimitRouter };
