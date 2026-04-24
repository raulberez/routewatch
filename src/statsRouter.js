'use strict';

const { Router } = require('express');
const { getStats, getRouteStat } = require('./stats');

/**
 * Creates an Express router that exposes route statistics as JSON.
 *
 * Endpoints:
 *   GET /stats          — all aggregated route stats
 *   GET /stats/:method/*path — stats for a specific method + path
 */
function createStatsRouter() {
  const router = Router();

  // GET /stats
  router.get('/', (req, res) => {
    const stats = getStats();
    res.json({
      total: stats.reduce((sum, s) => sum + s.count, 0),
      routes: stats.length,
      data: stats,
    });
  });

  // GET /stats/:method/*  e.g. /stats/GET/users/profile
  router.get('/:method/*', (req, res) => {
    const method = req.params.method.toUpperCase();
    // Express wildcard gives the rest of the path in req.params[0]
    const path = '/' + (req.params[0] || '');
    const stat = getRouteStat(method, path);

    if (!stat) {
      return res.status(404).json({
        error: `No stats found for ${method} ${path}`,
      });
    }

    res.json(stat);
  });

  return router;
}

module.exports = { createStatsRouter };
