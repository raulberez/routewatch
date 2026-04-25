const { Router } = require('express');
const cors = require('./cors');

function createCorsRouter() {
  const router = Router();

  // GET /routewatch/cors/config
  router.get('/config', (req, res) => {
    res.json(cors.getConfig());
  });

  // POST /routewatch/cors/config
  router.post('/config', (req, res) => {
    const { allowedOrigins, trackOrigins } = req.body;
    const update = {};
    if (Array.isArray(allowedOrigins)) update.allowedOrigins = allowedOrigins;
    if (typeof trackOrigins === 'boolean') update.trackOrigins = trackOrigins;
    cors.configure(update);
    res.json({ ok: true, config: cors.getConfig() });
  });

  // GET /routewatch/cors/origins
  router.get('/origins', (req, res) => {
    res.json(cors.getAllOrigins());
  });

  // GET /routewatch/cors/origins/:method/:route
  router.get('/origins/:method/*', (req, res) => {
    const { method } = req.params;
    const route = '/' + req.params[0];
    const origins = cors.getOrigins(route, method);
    res.json({ route, method: method.toUpperCase(), origins });
  });

  // POST /routewatch/cors/check
  router.post('/check', (req, res) => {
    const { origin } = req.body;
    if (!origin) return res.status(400).json({ error: 'origin is required' });
    res.json({ origin, allowed: cors.isAllowed(origin) });
  });

  return router;
}

module.exports = { createCorsRouter };
