/**
 * alertsRouter.js
 * Express router exposing alert configuration and triggered alert history
 * via a simple REST API.
 */

const { Router } = require('express');
const { setThreshold, getAlerts, reset } = require('./alerts');
const { getRouteStat } = require('./stats');

/**
 * @returns {import('express').Router}
 */
function createAlertsRouter() {
  const router = Router();

  // GET /alerts — return all triggered alerts
  router.get('/', (_req, res) => {
    res.json({ alerts: getAlerts() });
  });

  // POST /alerts/threshold — set a threshold for a route
  // Body: { route: string, maxRequests?: number, maxErrorRate?: number, windowMs?: number }
  router.post('/threshold', (req, res) => {
    const { route, maxRequests, maxErrorRate, windowMs } = req.body || {};

    if (!route || typeof route !== 'string') {
      return res.status(400).json({ error: '"route" is required and must be a string' });
    }

    setThreshold(route, {
      ...(maxRequests !== undefined && { maxRequests }),
      ...(maxErrorRate !== undefined && { maxErrorRate }),
      ...(windowMs !== undefined && { windowMs }),
    });

    res.status(201).json({ message: `Threshold set for route "${route}"` });
  });

  // POST /alerts/evaluate — manually evaluate a route against its threshold
  // Body: { route: string }
  router.post('/evaluate', (req, res) => {
    const { route } = req.body || {};

    if (!route || typeof route !== 'string') {
      return res.status(400).json({ error: '"route" is required and must be a string' });
    }

    const stat = getRouteStat(route);
    if (!stat) {
      return res.status(404).json({ error: `No stats found for route "${route}"` });
    }

    const { evaluate } = require('./alerts');
    const alert = evaluate(route, stat);

    if (alert) {
      return res.status(200).json({ triggered: true, alert });
    }

    res.status(200).json({ triggered: false });
  });

  // DELETE /alerts — clear all alerts (useful for testing / dashboard resets)
  router.delete('/', (_req, res) => {
    reset();
    res.json({ message: 'All alerts and thresholds cleared' });
  });

  return router;
}

module.exports = { createAlertsRouter };
