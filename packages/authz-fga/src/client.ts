import { getFgaConfig } from './config';

export type FgaTupleKey = {
  user: string;
  relation: string;
  object: string;
};

type FgaCheckRequest = FgaTupleKey & {
  contextual_tuples?: {
    tuple_keys: FgaTupleKey[];
  };
};

type FgaWriteRequest = {
  writes?: {
    tuple_keys: FgaTupleKey[];
  };
  deletes?: {
    tuple_keys: FgaTupleKey[];
  };
};

type FgaReadRequest = {
  tuple_key?: Partial<FgaTupleKey>;
  page_size?: number;
  continuation_token?: string;
};

type FgaCheckResponse = {
  allowed: boolean;
};

type FgaReadResponse = {
  tuples?: Array<{ key: FgaTupleKey }>;
  continuation_token?: string;
};

const buildHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export async function checkAccess(input: FgaCheckRequest): Promise<boolean> {
  const config = getFgaConfig();
  const response = await fetch(
    `${config.apiUrl}/stores/${config.storeId}/check`,
    {
      method: 'POST',
      headers: buildHeaders(config.apiToken),
      body: JSON.stringify({
        ...input,
        authorization_model_id: config.modelId,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenFGA check failed: ${errorText}`);
  }

  const payload = (await response.json()) as FgaCheckResponse;
  return payload.allowed;
}

export async function writeTuples(input: FgaWriteRequest): Promise<void> {
  const config = getFgaConfig();
  const response = await fetch(
    `${config.apiUrl}/stores/${config.storeId}/write`,
    {
      method: 'POST',
      headers: buildHeaders(config.apiToken),
      body: JSON.stringify({
        ...input,
        authorization_model_id: config.modelId,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenFGA write failed: ${errorText}`);
  }
}

export async function readTuples(
  input: FgaReadRequest
): Promise<FgaReadResponse> {
  const config = getFgaConfig();
  const response = await fetch(
    `${config.apiUrl}/stores/${config.storeId}/read`,
    {
      method: 'POST',
      headers: buildHeaders(config.apiToken),
      body: JSON.stringify({
        ...input,
        authorization_model_id: config.modelId,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenFGA read failed: ${errorText}`);
  }

  return (await response.json()) as FgaReadResponse;
}
