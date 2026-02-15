import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getAuthConfig } from '../../../../lib/auth/config';
import { extractRoles, decodeJwtPayload } from '../../../../lib/auth/jwt';
import { exchangeCodeForToken } from '../../../../lib/auth/oidc';
import { setSessionCookie } from '../../../../lib/auth/session';

export async function GET(request: Request) {
  const authConfig = getAuthConfig();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'Missing code.' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(authConfig.pkceStateCookieName)?.value;
  const verifier = cookieStore.get(authConfig.pkceVerifierCookieName)?.value;

  if (!storedState || !verifier || storedState !== state) {
    return NextResponse.json({ error: 'Invalid state.' }, { status: 400 });
  }

  const token = await exchangeCodeForToken(code, verifier);
  const maxAge = token.expires_in ?? 15 * 60;
  const expiresAt = Math.floor(Date.now() / 1000) + maxAge;
  const roles = extractRoles(decodeJwtPayload(token.access_token));

  await setSessionCookie(
    {
      accessToken: token.access_token,
      expiresAt,
      roles,
    },
    maxAge
  );

  cookieStore.delete(authConfig.pkceStateCookieName);
  cookieStore.delete(authConfig.pkceVerifierCookieName);

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
