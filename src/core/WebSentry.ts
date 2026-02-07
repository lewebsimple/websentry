import { FetchAdapter } from "../adapters/fetch/FetchAdapter";
import { KvAdapter } from "../adapters/kv/KvAdapter";
import { QueueAdapter } from "../adapters/queue/QueueAdapter";

import { defaultHandlerRegistry as defaultDrivers } from "./drivers";
import { Source } from "./Source";

export type WebSentryRuntime = {
  fetch: FetchAdapter;
  queue: QueueAdapter<Task>;
  kv?: KvAdapter;
};

type WebSentryOptions<TRuntime> = {
  runtime: TRuntime & {
    fetch: FetchAdapter;
    queue: QueueAdapter<Task>;
    kv?: KvAdapter;
  };
  sources: Record<string, Source<unknown>>;
  drivers?: Record<string, Driver>;
};

export class WebSentry<TRuntime extends WebSentryRuntime> {
  private readonly sources: Record<string, Source<unknown>>;
  private readonly runtime: WebSentryOptions<TRuntime>["runtime"];
  private readonly drivers: Record<string, Driver>;

  constructor(options: WebSentryOptions<TRuntime>) {
    this.sources = options.sources;
    this.runtime = options.runtime;
    this.drivers = {
      ...defaultDrivers,
      ...options.drivers,
    };
  }
}
