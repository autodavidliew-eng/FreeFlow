export type FetchLike = typeof fetch;

export type NgsiLdClientOptions = {
  baseUrl: string;
  tenant?: string;
  fetchImpl?: FetchLike;
  defaultHeaders?: Record<string, string>;
};

export type NgsiLdRequestOptions = {
  tenant?: string;
};

export type NgsiLdQueryParams = Record<string, string | number | boolean | undefined>;
