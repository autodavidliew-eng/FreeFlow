import { NextResponse } from 'next/server';

import { buildLogoutUrl } from '../../../lib/auth/oidc';
import { clearSessionCookie, readSession } from '../../../lib/auth/session';

export async function GET(request: Request) {
  const session = await readSession();
  await clearSessionCookie();

  const logoutUrl = await buildLogoutUrl(session?.idToken);
  if (logoutUrl) {
    return NextResponse.redirect(logoutUrl);
  }

  return NextResponse.redirect(new URL('/', request.url));
}
