const { Router } = require('express');
const { annotate, getAnnotation, getAllAnnotations, removeAnnotation } = require('./annotations');

function createAnnotationsRouter() {
  const router = Router();

  // GET /annotations — list all annotations
  router.get('/', (req, res) => {
    res.json(getAllAnnotations());
  });

  // GET /annotations/:method/:path — get annotation for a specific route
  router.get('/:method/*', (req, res) => {
    const method = req.params.method;
    const path = '/' + req.params[0];
    const ann = getAnnotation(method, path);
    if (!ann) {
      return res.status(404).json({ error: 'Annotation not found' });
    }
    res.json(ann);
  });

  // POST /annotations — create or update an annotation
  // body: { method, path, note }
  router.post('/', (req, res) => {
    const { method, path, note } = req.body || {};
    if (!method || !path || !note) {
      return res.status(400).json({ error: 'method, path, and note are required' });
    }
    try {
      annotate(method, path, note);
      res.status(201).json(getAnnotation(method, path));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // DELETE /annotations/:method/:path — remove an annotation
  router.delete('/:method/*', (req, res) => {
    const method = req.params.method;
    const path = '/' + req.params[0];
    const removed = removeAnnotation(method, path);
    if (!removed) {
      return res.status(404).json({ error: 'Annotation not found' });
    }
    res.json({ success: true });
  });

  return router;
}

module.exports = { createAnnotationsRouter };
