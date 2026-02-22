import {
  BaseFetchAdapter,
  FetchAdapterOptions,
  FetchRequest,
  FetchResponse,
} from "./BaseFetchAdapter";

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
      throw new Error("No fetch implementation available");
    }
    this.fetchFn = fetchFn as FetchLike;
  }

  protected async execute({ url, ...init }: Readonly<FetchRequest>): Promise<FetchResponse> {
    const response = await this.fetchFn(url, init);
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
