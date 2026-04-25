// annotations.js — attach human-readable notes/descriptions to routes

const annotations = new Map();

/**
 * Set an annotation (description/note) for a route.
 * @param {string} method - HTTP method (e.g. 'GET')
 * @param {string} path - route path (e.g. '/api/users')
 * @param {string} note - annotation text
 */
function annotate(method, path, note) {
  if (!method || !path || typeof note !== 'string') {
    throw new Error('method, path, and note are required');
  }
  const key = `${method.toUpperCase()}:${path}`;
  annotations.set(key, {
    method: method.toUpperCase(),
    path,
    note,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Get annotation for a specific route.
 */
function getAnnotation(method, path) {
  const key = `${method.toUpperCase()}:${path}`;
  return annotations.get(key) || null;
}

/**
 * Get all annotations as an array.
 */
function getAllAnnotations() {
  return Array.from(annotations.values());
}

/**
 * Remove annotation for a specific route.
 */
function removeAnnotation(method, path) {
  const key = `${method.toUpperCase()}:${path}`;
  return annotations.delete(key);
}

/**
 * Reset all annotations.
 */
function reset() {
  annotations.clear();
}

module.exports = { annotate, getAnnotation, getAllAnnotations, removeAnnotation, reset };
