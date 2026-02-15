import http from 'node:http';

import { checkAccess } from '../client';
import { resetFgaConfigForTests } from '../config';

describe('OpenFGA client integration', () => {
  beforeEach(() => {
    resetFgaConfigForTests();
  });

  it('sends model id to a live HTTP server', async () => {
    const server = http.createServer((req, res) => {
      if (req.method !== 'POST' || !req.url?.includes('/check')) {
        res.statusCode = 404;
        res.end();
        return;
      }

      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        const payload = JSON.parse(body) as { authorization_model_id?: string };
        if (payload.authorization_model_id !== 'model-id') {
          res.statusCode = 400;
          res.end('missing model id');
          return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ allowed: true }));
      });
    });

    try {
      await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
      });
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EPERM') {
        return;
      }
      throw error;
    }

    const address = server.address();
    if (!address || typeof address === 'string') {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      throw new Error('Failed to bind test server');
    }

    process.env.FGA_API_URL = `http://127.0.0.1:${address.port}`;
    process.env.FGA_STORE_ID = 'store-id';
    process.env.FGA_MODEL_ID = 'model-id';

    const allowed = await checkAccess({
      user: 'user:admin',
      relation: 'launch',
      object: 'app:rule-engine',
    });

    expect(allowed).toBe(true);

    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
});
