import { getAuthConfig } from './config';

type OidcDiscovery = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint?: string;
};

let cachedDiscovery: OidcDiscovery | null = null;

export async function getDiscovery(): Promise<OidcDiscovery> {
  if (cachedDiscovery) {
    return cachedDiscovery;
  }

  const authConfig = getAuthConfig();
  const res = await fetch(
    `${authConfig.issuer}/.well-known/openid-configuration`,
    { cache: 'force-cache' }
  );

  if (!res.ok) {
    throw new Error('Failed to load OIDC discovery document.');
  }

  cachedDiscovery = (await res.json()) as OidcDiscovery;
  return cachedDiscovery;
}

export async function buildAuthorizationUrl(
  state: string,
  codeChallenge: string
): Promise<string> {
  const authConfig = getAuthConfig();
  const discovery = await getDiscovery();
  const url = new URL(discovery.authorization_endpoint);

  url.searchParams.set('client_id', authConfig.clientId);
  url.searchParams.set('redirect_uri', authConfig.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid profile email');
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('state', state);

  return url.toString();
}

export async function exchangeCodeForToken(code: string, codeVerifier: string) {
  const authConfig = getAuthConfig();
  const discovery = await getDiscovery();
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: authConfig.redirectUri,
    client_id: authConfig.clientId,
    code_verifier: codeVerifier,
  });

  const res = await fetch(discovery.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Token exchange failed: ${errorText}`);
  }

  return (await res.json()) as {
    access_token: string;
    id_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
}

export async function buildLogoutUrl(idTokenHint?: string) {
  const authConfig = getAuthConfig();
  const discovery = await getDiscovery();
  if (!discovery.end_session_endpoint) {
    return null;
  }

  const url = new URL(discovery.end_session_endpoint);
  if (idTokenHint) {
    url.searchParams.set('id_token_hint', idTokenHint);
  }
  url.searchParams.set(
    'post_logout_redirect_uri',
    authConfig.postLogoutRedirectUri
  );
  return url.toString();
}
