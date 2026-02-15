import { NextResponse } from 'next/server';

import { readSession } from '@/lib/auth/session';
import { forwardFormsRequest } from '@/lib/forms/api';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const session = await readSession();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await forwardFormsRequest(`/forms/${formId}/schema`, {
      token: session.accessToken,
    });
    const payload = await response.json();

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: 'Unable to reach forms proxy.' },
      { status: 502 }
    );
  }
}
