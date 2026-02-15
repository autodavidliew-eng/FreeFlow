import type { AuthenticatedUser } from '@freeflow/auth';
import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
} from '@nestjs/common';

export type FormioSchemaResponse = Record<string, unknown>;
export type FormioSubmissionResponse = Record<string, unknown>;

@Injectable()
export class FormsService {
  async getSchema(
    user: AuthenticatedUser,
    formId: string
  ): Promise<FormioSchemaResponse> {
    return this.requestFormio(user, `${sanitizeFormId(formId)}`);
  }

  async submitForm(
    user: AuthenticatedUser,
    formId: string,
    payload: Record<string, unknown>
  ): Promise<FormioSubmissionResponse> {
    return this.requestFormio(
      user,
      `${sanitizeFormId(formId)}/submission`,
      'POST',
      payload
    );
  }

  private async requestFormio(
    user: AuthenticatedUser,
    path: string,
    method: 'GET' | 'POST' = 'GET',
    body?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const baseUrl = resolveFormioBaseUrl();
    const url = `${baseUrl}/${path.replace(/^\//, '')}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    const authToken = process.env.FORMIO_SERVICE_TOKEN?.trim() || user.token;
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new BadGatewayException('Unable to reach Form.io');
    }

    const text = await response.text();
    const payload = parseJson(text);

    if (!response.ok) {
      throw new HttpException(
        payload ?? { error: 'Form.io request failed' },
        response.status
      );
    }

    return payload ?? {};
  }
}

const resolveFormioBaseUrl = () => {
  const baseUrl = process.env.FORMIO_BASE_URL?.trim();
  if (!baseUrl) {
    throw new BadRequestException('Missing FORMIO_BASE_URL');
  }

  return baseUrl.replace(/\/$/, '');
};

const sanitizeFormId = (formId: string) => {
  const sanitized = formId.trim().replace(/^\//, '');
  if (!sanitized) {
    throw new BadRequestException('Missing formId');
  }

  return sanitized;
};

const parseJson = (payload: string) => {
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return { raw: payload } as Record<string, unknown>;
  }
};
