import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getAuthConfig } from '../../../../lib/auth/config';
import { buildAuthorizationUrl } from '../../../../lib/auth/oidc';
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
} from '../../../../lib/auth/pkce';

export async function GET() {
  const authConfig = getAuthConfig();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 10 * 60,
  };

  const cookieStore = await cookies();
  cookieStore.set(
    authConfig.pkceVerifierCookieName,
    codeVerifier,
    cookieOptions
  );
  cookieStore.set(authConfig.pkceStateCookieName, state, cookieOptions);

  const authorizationUrl = await buildAuthorizationUrl(state, codeChallenge);
  return NextResponse.redirect(authorizationUrl);
}
