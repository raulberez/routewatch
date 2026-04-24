// snapshots.js — capture and store point-in-time snapshots of route stats

const { getAll } = require('./store');
const { getStats } = require('./stats');

const snapshots = [];

/**
 * Take a snapshot of current route data and stats.
 * @param {string} [label] - optional label for the snapshot
 * @returns {object} the snapshot object
 */
function takeSnapshot(label = null) {
  const timestamp = Date.now();
  const routes = getAll();
  const stats = getStats();

  const snapshot = {
    id: snapshots.length + 1,
    label: label || `snapshot-${snapshots.length + 1}`,
    timestamp,
    routeCount: Object.keys(routes).length,
    routes: JSON.parse(JSON.stringify(routes)),
    stats: JSON.parse(JSON.stringify(stats)),
  };

  snapshots.push(snapshot);
  return snapshot;
}

/**
 * Get all snapshots.
 * @returns {object[]}
 */
function getAllSnapshots() {
  return [...snapshots];
}

/**
 * Get a snapshot by id.
 * @param {number} id
 * @returns {object|null}
 */
function getSnapshot(id) {
  return snapshots.find((s) => s.id === id) || null;
}

/**
 * Compare two snapshots by id, returning a diff summary.
 * @param {number} idA
 * @param {number} idB
 * @returns {object|null}
 */
function compareSnapshots(idA, idB) {
  const a = getSnapshot(idA);
  const b = getSnapshot(idB);
  if (!a || !b) return null;

  const allKeys = new Set([...Object.keys(a.routes), ...Object.keys(b.routes)]);
  const diff = {};

  for (const key of allKeys) {
    const countA = a.routes[key] ? a.routes[key].count : 0;
    const countB = b.routes[key] ? b.routes[key].count : 0;
    diff[key] = { countA, countB, delta: countB - countA };
  }

  return { snapshotA: idA, snapshotB: idB, diff };
}

/**
 * Clear all snapshots.
 */
function reset() {
  snapshots.length = 0;
}

module.exports = { takeSnapshot, getAllSnapshots, getSnapshot, compareSnapshots, reset };
