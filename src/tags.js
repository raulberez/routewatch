// tags.js — attach custom tags to routes for grouping/filtering

const routeTags = new Map();

/**
 * Set one or more tags for a given route key (e.g. 'GET /api/users')
 */
function setTags(routeKey, tags = []) {
  if (typeof routeKey !== 'string' || !routeKey.trim()) {
    throw new Error('routeKey must be a non-empty string');
  }
  if (!Array.isArray(tags)) {
    throw new Error('tags must be an array');
  }
  routeTags.set(routeKey, [...new Set(tags.map(t => String(t).trim()).filter(Boolean))]);
}

/**
 * Get tags for a specific route key. Returns empty array if none set.
 */
function getTags(routeKey) {
  return routeTags.get(routeKey) || [];
}

/**
 * Return all route keys that include a given tag.
 */
function getRoutesByTag(tag) {
  const results = [];
  for (const [key, tags] of routeTags.entries()) {
    if (tags.includes(String(tag).trim())) {
      results.push(key);
    }
  }
  return results;
}

/**
 * Return a snapshot of all tagged routes.
 */
function getAllTags() {
  const result = {};
  for (const [key, tags] of routeTags.entries()) {
    result[key] = tags;
  }
  return result;
}

/**
 * Remove tags for a route key.
 */
function removeTags(routeKey) {
  return routeTags.delete(routeKey);
}

/**
 * Reset all tag data.
 */
function reset() {
  routeTags.clear();
}

module.exports = { setTags, getTags, getRoutesByTag, getAllTags, removeTags, reset };
