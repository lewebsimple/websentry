export type FetchRequest = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
};

export type FetchResponse = {
  url: string;
  status: number;
  headers: Record<string, string>;
  body: string;
};

export interface FetchAdapter {
  fetch(request: FetchRequest): Promise<FetchResponse>;
}

export interface FetchAdapterOptions {
  headers?: Record<string, string>;
}
