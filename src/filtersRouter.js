/**
 * filtersRouter.js — Express router exposing filter/search endpoints
 */

const { Router } = require('express');
const { filterRecords, filterRoutes } = require('./filters');

function createFiltersRouter() {
  const router = Router();

  /**
   * GET /filters/records
   * Query params: method, status, pathContains, minDuration, maxDuration, since
   */
  router.get('/records', (req, res) => {
    try {
      const { method, status, pathContains, minDuration, maxDuration, since } = req.query;
      const records = filterRecords({
        ...(method        && { method }),
        ...(status        && { status: Number(status) }),
        ...(pathContains  && { pathContains }),
        ...(minDuration   && { minDuration: Number(minDuration) }),
        ...(maxDuration   && { maxDuration: Number(maxDuration) }),
        ...(since         && { since }),
      });
      res.json({ count: records.length, records });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  /**
   * GET /filters/routes
   * Same query params as /records but returns unique method+route pairs.
   */
  router.get('/routes', (req, res) => {
    try {
      const { method, status, pathContains, minDuration, maxDuration, since } = req.query;
      const routes = filterRoutes({
        ...(method        && { method }),
        ...(status        && { status: Number(status) }),
        ...(pathContains  && { pathContains }),
        ...(minDuration   && { minDuration: Number(minDuration) }),
        ...(maxDuration   && { maxDuration: Number(maxDuration) }),
        ...(since         && { since }),
      });
      res.json({ count: routes.length, routes });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}

module.exports = { createFiltersRouter };
