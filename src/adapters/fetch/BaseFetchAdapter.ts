import { normalizeHeaders } from "../../utils/normalize-headers";
import type { FetchAdapter, FetchAdapterOptions, FetchRequest, FetchResponse } from "./contract";

export abstract class BaseFetchAdapter implements FetchAdapter {
  protected readonly headers: Record<string, string>;

  constructor(options: FetchAdapterOptions = {}) {
    this.headers = normalizeHeaders(options.headers);
  }

  async fetch(request: FetchRequest): Promise<FetchResponse> {
    const normalized = this.normalizeRequest(request);
    const response = await this.execute(normalized);
    return this.normalizeResponse(response, normalized);
  }

  protected normalizeRequest(request: FetchRequest): Readonly<FetchRequest> {
    const method = request.method ?? "GET";
    if ((method === "GET" || method === "DELETE") && request.body != null) {
      throw new Error(`${method} requests cannot have a body`);
    }
    return {
      ...request,
      method,
      headers: normalizeHeaders({ ...this.headers, ...request.headers }),
    };
  }

  protected normalizeResponse(response: FetchResponse, request: FetchRequest): FetchResponse {
    return {
      url: response.url ?? request.url,
      status: response.status,
      headers: normalizeHeaders(response.headers),
      body: response.body ?? "",
    };
  }

  protected abstract execute(request: Readonly<FetchRequest>): Promise<FetchResponse>;
}
