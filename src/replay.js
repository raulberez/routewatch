/**
 * replay.js
 * Store and replay recorded requests for debugging/testing purposes
 */

const store = require('./store');

let replayLog = [];

/**
 * Record a request snapshot for replay
 * @param {object} req - Express request object
 */
function capture(req) {
  const entry = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    method: req.method,
    path: req.path,
    query: { ...req.query },
    headers: { ...req.headers },
    body: req.body ? { ...req.body } : null,
    capturedAt: new Date().toISOString()
  };
  replayLog.push(entry);
  return entry;
}

/**
 * Get all captured replay entries
 */
function getAll() {
  return [...replayLog];
}

/**
 * Get a single captured entry by id
 * @param {string} id
 */
function getById(id) {
  return replayLog.find(e => e.id === id) || null;
}

/**
 * Get entries filtered by method and/or path
 * @param {object} opts - { method, path }
 */
function filter({ method, path } = {}) {
  return replayLog.filter(e => {
    if (method && e.method !== method.toUpperCase()) return false;
    if (path && e.path !== path) return false;
    return true;
  });
}

/**
 * Clear all replay entries
 */
function reset() {
  replayLog = [];
}

/**
 * Total number of captured entries
 */
function size() {
  return replayLog.length;
}

module.exports = { capture, getAll, getById, filter, reset, size };
