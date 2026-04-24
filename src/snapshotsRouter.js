// snapshotsRouter.js — HTTP endpoints for snapshot management

const { Router } = require('express');
const { takeSnapshot, getAllSnapshots, getSnapshot, compareSnapshots, reset } = require('./snapshots');

function createSnapshotsRouter() {
  const router = Router();

  // GET /snapshots — list all snapshots (metadata only)
  router.get('/', (req, res) => {
    const all = getAllSnapshots().map(({ id, label, timestamp, routeCount }) => ({
      id,
      label,
      timestamp,
      routeCount,
    }));
    res.json({ snapshots: all });
  });

  // POST /snapshots — take a new snapshot
  router.post('/', (req, res) => {
    const label = req.body && req.body.label ? req.body.label : null;
    const snap = takeSnapshot(label);
    res.status(201).json(snap);
  });

  // GET /snapshots/:id — get a single snapshot by id
  router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid snapshot id' });

    const snap = getSnapshot(id);
    if (!snap) return res.status(404).json({ error: `Snapshot ${id} not found` });

    res.json(snap);
  });

  // GET /snapshots/compare/:idA/:idB — diff two snapshots
  router.get('/compare/:idA/:idB', (req, res) => {
    const idA = parseInt(req.params.idA, 10);
    const idB = parseInt(req.params.idB, 10);

    if (isNaN(idA) || isNaN(idB)) {
      return res.status(400).json({ error: 'Invalid snapshot ids' });
    }

    const result = compareSnapshots(idA, idB);
    if (!result) {
      return res.status(404).json({ error: 'One or both snapshots not found' });
    }

    res.json(result);
  });

  // DELETE /snapshots — reset all snapshots
  router.delete('/', (req, res) => {
    reset();
    res.json({ message: 'All snapshots cleared' });
  });

  return router;
}

module.exports = { createSnapshotsRouter };
