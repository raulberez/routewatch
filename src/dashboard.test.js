const { renderDashboard } = require('./dashboard');
const { record, reset } = require('./store');

beforeEach(() => {
  reset();
});

describe('renderDashboard', () => {
  test('returns a valid HTML string', () => {
    const html = renderDashboard();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('RouteWatch');
  });

  test('shows empty state when no routes recorded', () => {
    const html = renderDashboard();
    expect(html).toContain('No routes recorded yet.');
  });

  test('renders a recorded route in the table', () => {
    record('GET', '/api/health', 200, 12);
    const html = renderDashboard();
    expect(html).toContain('GET /api/health');
    expect(html).toContain('12ms');
  });

  test('displays correct hit count', () => {
    record('POST', '/api/login', 200, 50);
    record('POST', '/api/login', 401, 30);
    const html = renderDashboard();
    expect(html).toContain('>2<');
  });

  test('shows status code badges', () => {
    record('GET', '/api/items', 200, 10);
    record('GET', '/api/items', 404, 5);
    const html = renderDashboard();
    expect(html).toContain('200: 1');
    expect(html).toContain('404: 1');
  });

  test('updates route count in subtitle', () => {
    record('GET', '/a', 200, 1);
    record('POST', '/b', 201, 2);
    const html = renderDashboard();
    expect(html).toContain('2 routes tracked');
  });

  test('shows singular route label for one route', () => {
    record('GET', '/only', 200, 5);
    const html = renderDashboard();
    expect(html).toContain('1 route tracked');
  });

  test('includes meta refresh tag', () => {
    const html = renderDashboard();
    expect(html).toContain('http-equiv="refresh"');
    expect(html).toContain('content="5"');
  });
});
