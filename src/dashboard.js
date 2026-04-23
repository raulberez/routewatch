/**
 * Generates a simple HTML dashboard for visualizing route usage stats.
 */

const { getAll } = require('./store');

function renderRow(route, data) {
  const successRate = data.statusCodes[200]
    ? Math.round((data.statusCodes[200] / data.hits) * 100)
    : 0;

  const statusBadges = Object.entries(data.statusCodes)
    .map(([code, count]) => `<span class="badge s${Math.floor(code / 100)}xx">${code}: ${count}</span>`)
    .join(' ');

  return `
    <tr>
      <td><code>${route}</code></td>
      <td>${data.hits}</td>
      <td>${data.avgResponseTime}ms</td>
      <td>${successRate}%</td>
      <td>${statusBadges}</td>
      <td>${data.lastHit ? new Date(data.lastHit).toLocaleString() : '—'}</td>
    </tr>`;
}

function renderDashboard() {
  const routes = getAll();
  const rows = Object.entries(routes).map(([route, data]) => renderRow(route, data)).join('');
  const routeCount = Object.keys(routes).length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RouteWatch Dashboard</title>
  <meta http-equiv="refresh" content="5" />
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 2rem; }
    h1 { color: #38bdf8; margin-bottom: 0.25rem; }
    p.subtitle { color: #94a3b8; margin-top: 0; margin-bottom: 1.5rem; font-size: 0.875rem; }
    table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 8px; overflow: hidden; }
    th { background: #334155; padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; }
    td { padding: 0.75rem 1rem; border-top: 1px solid #334155; font-size: 0.875rem; }
    tr:hover td { background: #273449; }
    .badge { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; margin: 0 2px; }
    .badge.s2xx { background: #166534; color: #86efac; }
    .badge.s3xx { background: #1e3a5f; color: #93c5fd; }
    .badge.s4xx { background: #7c2d12; color: #fca5a5; }
    .badge.s5xx { background: #4c0519; color: #fda4af; }
    .empty { text-align: center; padding: 3rem; color: #475569; }
  </style>
</head>
<body>
  <h1>📡 RouteWatch</h1>
  <p class="subtitle">${routeCount} route${routeCount !== 1 ? 's' : ''} tracked &mdash; refreshes every 5s</p>
  <table>
    <thead><tr><th>Route</th><th>Hits</th><th>Avg Response</th><th>2xx Rate</th><th>Status Codes</th><th>Last Hit</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="6" class="empty">No routes recorded yet.</td></tr>'}</tbody>
  </table>
</body>
</html>`;
}

module.exports = { renderDashboard };
