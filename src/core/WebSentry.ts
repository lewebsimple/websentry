import {
  ConsoleLogAdapter,
  NativeFetchAdapter,
  type FetchAdapter,
  type LogAdapter,
} from "../adapters";
import { drivers } from "../drivers";

export type WebSentryAdapters = {
  fetch: FetchAdapter;
  log: LogAdapter;
};

export type WebSentryOptions = {
  adapters?: Partial<WebSentryAdapters>;
};

export class WebSentry {
  private readonly adapters: WebSentryAdapters;
  static readonly drivers = drivers;

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
