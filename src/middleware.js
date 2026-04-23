const { recordRequest } = require('./store');

/**
 * RouteWatch middleware factory
 * @param {Object} options - configuration options
 * @param {boolean} options.logToConsole - whether to log requests to console (default: false)
 * @param {string[]} options.ignore - list of path prefixes to ignore
 * @returns Express middleware function
 */
function routewatch(options = {}) {
  const { logToConsole = false, ignore = [] } = options;

  return function routewatchMiddleware(req, res, next) {
    const shouldIgnore = ignore.some((prefix) => req.path.startsWith(prefix));

    if (shouldIgnore) {
      return next();
    }

    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const entry = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        timestamp: new Date().toISOString(),
      };

      recordRequest(entry);

      if (logToConsole) {
        console.log(
          `[routewatch] ${entry.method} ${entry.path} → ${entry.statusCode} (${duration}ms)`
        );
      }
    });

    next();
  };
}

module.exports = routewatch;
