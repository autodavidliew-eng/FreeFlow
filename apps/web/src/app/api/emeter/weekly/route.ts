import { NextResponse, type NextRequest } from 'next/server';

import { forwardApiRequest } from '../../../../lib/addons/api';
import { readSession } from '../../../../lib/auth/session';

export async function GET(request: NextRequest) {
  const session = await readSession();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const meterId = url.searchParams.get('meterId');
  const days = url.searchParams.get('days');

  const query = new URLSearchParams();
  if (meterId) {
    query.set('meterId', meterId);
  }
  if (days) {
    query.set('days', days);
  }

  const path = `/emeter/weekly${query.toString() ? `?${query}` : ''}`;

  try {
    const response = await forwardApiRequest(path, {
      token: session.accessToken,
    });
    const payload = await response.json();

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: 'Unable to reach meter service.' },
      { status: 502 }
    );
  }
}
