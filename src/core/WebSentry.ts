import { ConsoleLogAdapter, type LogAdapter } from "../adapters";

export type WebSentryAdapters = {
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
      log: adapters?.log ?? new ConsoleLogAdapter(),
    };
  }
}
