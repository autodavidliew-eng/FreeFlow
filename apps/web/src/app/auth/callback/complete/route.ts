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

  const storedState = cookies().get(authConfig.pkceStateCookieName)?.value;
  const verifier = cookies().get(authConfig.pkceVerifierCookieName)?.value;

  if (!storedState || !verifier || storedState !== state) {
    return NextResponse.json({ error: 'Invalid state.' }, { status: 400 });
  }

  const token = await exchangeCodeForToken(code, verifier);
  const maxAge = token.expires_in ?? 15 * 60;
  const expiresAt = Math.floor(Date.now() / 1000) + maxAge;
  const roles = extractRoles(decodeJwtPayload(token.access_token));

  setSessionCookie(
    {
      accessToken: token.access_token,
      idToken: token.id_token,
      refreshToken: token.refresh_token,
      expiresAt,
      roles,
    },
    maxAge,
  );

  cookies().delete(authConfig.pkceStateCookieName);
  cookies().delete(authConfig.pkceVerifierCookieName);

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
