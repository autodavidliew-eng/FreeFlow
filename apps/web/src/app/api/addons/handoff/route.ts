import { NextResponse } from 'next/server';

import { forwardApiRequest } from '../../../../lib/addons/api';
import type { AddonHandoffResponse } from '../../../../lib/addons/types';
import { readSession } from '../../../../lib/auth/session';

type HandoffRequestBody = {
  appKey?: string;
  returnTo?: string;
};

export async function POST(request: Request) {
  const session = await readSession();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: HandoffRequestBody = {};
  try {
    body = (await request.json()) as HandoffRequestBody;
  } catch {
    body = {};
  }

  if (!body.appKey) {
    return NextResponse.json({ error: 'Missing appKey' }, { status: 400 });
  }

  try {
    const response = await forwardApiRequest('/addons/handoff', {
      method: 'POST',
      token: session.accessToken,
      body: {
        appKey: body.appKey,
        context: body.returnTo ? { returnTo: body.returnTo } : undefined,
      },
    });
    const payload = (await response.json()) as AddonHandoffResponse;

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: 'Unable to reach add-on handoff.' },
      { status: 502 }
    );
  }
}
