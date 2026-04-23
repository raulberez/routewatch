const httpMocks = require('node-mocks-http');
const routewatch = require('./middleware');
const { getRequests, clearRequests } = require('./store');

describe('routewatch middleware', () => {
  beforeEach(() => {
    clearRequests();
  });

  function runMiddleware(req, res, options = {}) {
    return new Promise((resolve) => {
      const middleware = routewatch(options);
      middleware(req, res, () => {
        res.statusCode = 200;
        res.emit('finish');
        resolve();
      });
    });
  }

  it('records a request entry after response finishes', async () => {
    const req = httpMocks.createRequest({ method: 'GET', path: '/api/users' });
    const res = httpMocks.createResponse();

    await runMiddleware(req, res);

    const requests = getRequests();
    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe('GET');
    expect(requests[0].path).toBe('/api/users');
    expect(requests[0].statusCode).toBe(200);
    expect(typeof requests[0].duration).toBe('number');
    expect(requests[0].timestamp).toBeDefined();
  });

  it('ignores paths matching the ignore list', async () => {
    const req = httpMocks.createRequest({ method: 'GET', path: '/health' });
    const res = httpMocks.createResponse();

    await runMiddleware(req, res, { ignore: ['/health'] });

    expect(getRequests()).toHaveLength(0);
  });

  it('records multiple requests independently', async () => {
    for (const path of ['/api/a', '/api/b', '/api/c']) {
      const req = httpMocks.createRequest({ method: 'POST', path });
      const res = httpMocks.createResponse();
      await runMiddleware(req, res);
    }

    expect(getRequests()).toHaveLength(3);
  });
});
