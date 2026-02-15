import 'server-only';

const DEFAULT_API_URL = 'http://localhost:4000';

export const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
};

export async function forwardApiRequest(
  path: string,
  options: {
    method?: 'GET' | 'POST';
    token: string;
    body?: unknown;
  }
) {
  const { method = 'GET', token, body } = options;
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl.replace(/\/$/, '')}${path}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
}
