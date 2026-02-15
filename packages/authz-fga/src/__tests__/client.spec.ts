import { checkAccess } from '../client';
import { resetFgaConfigForTests } from '../config';

describe('OpenFGA client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    resetFgaConfigForTests();
    process.env.FGA_API_URL = 'http://localhost:9999';
    process.env.FGA_STORE_ID = 'store-id';
    process.env.FGA_MODEL_ID = 'model-id';
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('passes the authorization model id for checks', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ allowed: true }),
    }) as typeof fetch;

    const allowed = await checkAccess({
      user: 'user:admin',
      relation: 'launch',
      object: 'app:rule-engine',
    });

    expect(allowed).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:9999/stores/store-id/check',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          user: 'user:admin',
          relation: 'launch',
          object: 'app:rule-engine',
          authorization_model_id: 'model-id',
        }),
      })
    );
  });
});
