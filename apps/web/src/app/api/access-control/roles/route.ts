import { NextResponse } from 'next/server';

import { forwardApiRequest } from '../../../../lib/addons/api';
import { readSession } from '../../../../lib/auth/session';

export async function GET() {
  const session = await readSession();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await forwardApiRequest('/access-control/roles', {
      token: session.accessToken,
    });
    const payload = await response.json();

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: 'Unable to reach access control.' },
      { status: 502 }
    );
  }
}
