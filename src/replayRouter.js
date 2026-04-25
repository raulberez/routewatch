const { Router } = require('express');
const replay = require('./replay');

/**
 * createReplayRouter
 * Mounts endpoints for browsing and replaying captured requests
 */
function createReplayRouter() {
  const router = Router();

  // GET /replay — list all captured entries
  router.get('/', (req, res) => {
    const { method, path: p } = req.query;
    const results = replay.filter({
      method: method || undefined,
      path: p || undefined
    });
    res.json({ count: results.length, entries: results });
  });

  // GET /replay/:id — get a single entry
  router.get('/:id', (req, res) => {
    const entry = replay.getById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(entry);
  });

  // POST /replay/:id/resend — simulate resending the request by returning its data
  router.post('/:id/resend', (req, res) => {
    const entry = replay.getById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({
      message: 'Replay payload ready',
      replayAt: new Date().toISOString(),
      request: {
        method: entry.method,
        path: entry.path,
        query: entry.query,
        headers: entry.headers,
        body: entry.body
      }
    });
  });

  // DELETE /replay — clear all captured entries
  router.delete('/', (req, res) => {
    const count = replay.size();
    replay.reset();
    res.json({ message: 'Replay log cleared', removed: count });
  });

  return router;
}

module.exports = { createReplayRouter };
