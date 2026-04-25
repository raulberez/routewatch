/**
 * corsMiddleware.js — Express middleware that integrates CORS origin tracking
 * into the routewatch pipeline. Should be mounted before routewatch().
 */

const cors = require('./cors');

function corsMiddleware(options = {}) {
  if (Object.keys(options).length > 0) {
    cors.configure(options);
  }

  return function (req, res, next) {
    const origin = req.headers['origin'] || req.headers['referer'] || null;
    const route = req.path;
    const method = req.method;

    if (origin) {
      cors.recordOrigin(route, method, origin);
    }

    const config = cors.getConfig();

    // Set CORS headers when origin is present and not wildcard
    if (origin && !config.allowedOrigins.includes('*')) {
      if (cors.isAllowed(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
      } else {
        res.setHeader('X-RouteWatch-CORS-Blocked', 'true');
      }
    } else if (config.allowedOrigins.includes('*')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    next();
  };
}

module.exports = { corsMiddleware };
