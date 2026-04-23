/**
 * Express router that mounts the RouteWatch dashboard UI and JSON stats endpoint.
 * Mount this router AFTER the routewatch middleware so all routes are captured.
 *
 * Usage:
 *   const { dashboardRouter } = require('./dashboardRouter');
 *   app.use('/__routewatch', dashboardRouter);
 */

const { Router } = require('express');
const { renderDashboard } = require('./dashboard');
const { getAll, reset } = require('./store');

function createDashboardRouter(options = {}) {
  const router = Router();
  const { prefix = '' } = options;

  // HTML dashboard
  router.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderDashboard());
  });

  // JSON stats API
  router.get('/stats', (req, res) => {
    res.json({
      routes: getAll(),
      generatedAt: new Date().toISOString(),
    });
  });

  // Reset stats
  router.delete('/stats', (req, res) => {
    reset();
    res.json({ ok: true, message: 'Stats reset.' });
  });

  return router;
}

module.exports = { createDashboardRouter };
