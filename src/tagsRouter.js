// tagsRouter.js — Express router exposing tag management endpoints

const express = require('express');
const { setTags, getTags, getRoutesByTag, getAllTags, removeTags } = require('./tags');

function createTagsRouter() {
  const router = express.Router();

  // GET /tags — list all tagged routes
  router.get('/', (req, res) => {
    res.json(getAllTags());
  });

  // GET /tags/by/:tag — get routes that have a specific tag
  router.get('/by/:tag', (req, res) => {
    const routes = getRoutesByTag(req.params.tag);
    res.json({ tag: req.params.tag, routes });
  });

  // GET /tags/route — get tags for a route supplied as query param
  // e.g. GET /tags/route?key=GET%20%2Fapi%2Fusers
  router.get('/route', (req, res) => {
    const { key } = req.query;
    if (!key) {
      return res.status(400).json({ error: 'Missing query param: key' });
    }
    res.json({ route: key, tags: getTags(key) });
  });

  // POST /tags — set tags for a route
  // body: { route: 'GET /api/users', tags: ['public', 'v1'] }
  router.post('/', (req, res) => {
    const { route, tags } = req.body || {};
    if (!route || !Array.isArray(tags)) {
      return res.status(400).json({ error: 'Body must include route (string) and tags (array)' });
    }
    try {
      setTags(route, tags);
      res.status(201).json({ route, tags: getTags(route) });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // DELETE /tags/route — remove tags for a route
  // body: { route: 'GET /api/users' }
  router.delete('/route', (req, res) => {
    const { route } = req.body || {};
    if (!route) {
      return res.status(400).json({ error: 'Body must include route (string)' });
    }
    const removed = removeTags(route);
    if (!removed) {
      return res.status(404).json({ error: 'Route not found in tag store' });
    }
    res.json({ removed: true, route });
  });

  return router;
}

module.exports = { createTagsRouter };
