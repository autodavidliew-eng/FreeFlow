import { NextResponse, type NextRequest } from 'next/server';

import { forwardApiRequest } from '../../../../../lib/addons/api';
import { readSession } from '../../../../../lib/auth/session';

export async function PUT(request: NextRequest) {
  const session = await readSession();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const role = request.nextUrl.pathname.split('/').pop();
  if (!role) {
    return NextResponse.json({ error: 'Missing role' }, { status: 400 });
  }

  try {
    const response = await forwardApiRequest(`/access-control/roles/${role}`, {
      method: 'PUT',
      token: session.accessToken,
      body: body ?? {},
    });
    const payload = await response.json();

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: 'Unable to update access control.' },
      { status: 502 }
    );
  }
}
