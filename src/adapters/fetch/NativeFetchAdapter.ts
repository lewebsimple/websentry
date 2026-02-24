import { ConfigurationError, HttpError } from "../../core/errors";

import { BaseFetchAdapter } from "./BaseFetchAdapter";
import type { FetchAdapterOptions, FetchRequest, FetchResponse } from "./contract";

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface NativeFetchAdapterOptions extends FetchAdapterOptions {
  fetch?: FetchLike;
}

export class NativeFetchAdapter extends BaseFetchAdapter {
  private readonly fetchFn: FetchLike;

  constructor(options: NativeFetchAdapterOptions = {}) {
    super(options);

    const fetchFn = options.fetch ?? globalThis.fetch;
    if (!fetchFn) {
      throw new ConfigurationError("No fetch implementation available");
    }
    this.fetchFn = fetchFn as FetchLike;
  }

  protected async execute({ url, ...init }: Readonly<FetchRequest>): Promise<FetchResponse> {
    const response = await this.fetchFn(url, init);

    if (!response.ok) {
      throw new HttpError({
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        retryAfter: response.headers.get("retry-after") || undefined,
      });
    }

    const body = await response.text();

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      url: response.url,
      status: response.status,
      headers,
      body,
    };
  }
}
