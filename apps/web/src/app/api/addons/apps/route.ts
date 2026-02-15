import { NextResponse } from 'next/server';

import { forwardApiRequest } from '../../../../lib/addons/api';
import type { AppCatalogResponse } from '../../../../lib/addons/types';
import { readSession } from '../../../../lib/auth/session';

export async function GET() {
  const session = await readSession();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await forwardApiRequest('/addons/apps', {
      token: session.accessToken,
    });
    const payload = (await response.json()) as AppCatalogResponse;

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: 'Unable to reach add-on catalog.' },
      { status: 502 }
    );
  }
}
