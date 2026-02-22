import {
  ConsoleLogAdapter,
  NativeFetchAdapter,
  type FetchAdapter,
  type LogAdapter,
} from "../adapters";

export type WebSentryAdapters = {
  fetch: FetchAdapter;
  log: LogAdapter;
};

export type WebSentryOptions = {
  adapters?: Partial<WebSentryAdapters>;
};

export class WebSentry {
  private readonly adapters: WebSentryAdapters;

  constructor(options: WebSentryOptions = {}) {
    this.adapters = this.resolveAdapters(options.adapters);
  }

  private resolveAdapters(adapters?: Partial<WebSentryAdapters>): WebSentryAdapters {
    return {
      fetch: adapters?.fetch ?? new NativeFetchAdapter(),
      log: adapters?.log ?? new ConsoleLogAdapter(),
    };
  }
}
