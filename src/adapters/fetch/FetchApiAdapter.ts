import { FetchAdapter, FetchRequest, FetchResponse } from "../../core/runtime/FetchAdapter";

export class FetchApiAdapter implements FetchAdapter {
  async fetch(request: FetchRequest): Promise<FetchResponse> {
    const response = await fetch(request.url, {
      method: request.method ?? "GET",
      headers: request.headers,
      body: request.body,
    });

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const body = await response.text();

    return {
      url: response.url,
      status: response.status,
      headers,
      body,
    };
  }
}
