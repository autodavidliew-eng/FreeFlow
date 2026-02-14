import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { verifyAccessToken } from '../src/jwks';

describe('verifyAccessToken', () => {
  const issuer = 'https://auth.example.com/realms/freeflow';
  const audience = 'freeflow-web';
  const jwksUri = 'https://auth.example.com/realms/freeflow/protocol/openid-connect/certs';

  let originalFetch: typeof globalThis.fetch | undefined;

  beforeAll(() => {
    originalFetch = globalThis.fetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch as typeof globalThis.fetch;
  });

  it('verifies token signature using a mocked JWKS response', async () => {
    const { publicKey, privateKey } = await generateKeyPair('RS256');
    const publicJwk = await exportJWK(publicKey);
    publicJwk.kid = 'test-key';
    publicJwk.use = 'sig';
    publicJwk.alg = 'RS256';

    const token = await new SignJWT({
      sub: 'user-789',
      email: 'viewer@freeflow.dev',
      realm_access: { roles: ['Viewer'] },
    })
      .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
      .setIssuer(issuer)
      .setAudience(audience)
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(privateKey);

    globalThis.fetch = (async () => ({
      ok: true,
      status: 200,
      json: async () => ({ keys: [publicJwk] }),
    })) as typeof globalThis.fetch;

    const result = await verifyAccessToken(token, {
      issuer,
      audience: [audience],
      jwksUri,
      clientId: audience,
    });

    expect(result.payload.sub).toBe('user-789');
    expect(result.roles).toContain('Viewer');
    expect(result.freeflowRoles).toContain('Viewer');
  });
});
