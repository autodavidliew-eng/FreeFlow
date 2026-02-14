export type AuthConfig = {
  issuer: string;
  clientId: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  sessionSecret: string;
  sessionCookieName: string;
  pkceVerifierCookieName: string;
  pkceStateCookieName: string;
};

let cachedConfig: AuthConfig | null = null;

const missing = (name: string) => {
  throw new Error(
    `Missing ${name}. Set it in apps/web/.env.local for local development.`,
  );
};

export function getAuthConfig(): AuthConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  cachedConfig = {
    issuer: process.env.KEYCLOAK_ISSUER ?? missing('KEYCLOAK_ISSUER'),
    clientId: process.env.KEYCLOAK_ID ?? missing('KEYCLOAK_ID'),
    redirectUri:
      process.env.KEYCLOAK_REDIRECT_URI ?? `${appUrl}/auth/callback`,
    postLogoutRedirectUri:
      process.env.KEYCLOAK_POST_LOGOUT_REDIRECT_URI ?? `${appUrl}/`,
    sessionSecret: process.env.SESSION_SECRET ?? missing('SESSION_SECRET'),
    sessionCookieName: 'ff_session',
    pkceVerifierCookieName: 'ff_pkce_verifier',
    pkceStateCookieName: 'ff_pkce_state',
  };

  return cachedConfig;
}
