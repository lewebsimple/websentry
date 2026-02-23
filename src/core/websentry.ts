import {
  ConsoleLogAdapter,
  NativeFetchAdapter,
  InMemoryQueueAdapter,
  type FetchAdapter,
  type LogAdapter,
  type QueueAdapter,
} from "../adapters";
import { drivers } from "../drivers";
import { Task } from "./task";

export type WebSentryAdapters = {
  fetch: FetchAdapter;
  log: LogAdapter;
  taskQueue: QueueAdapter<Task>;
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
      taskQueue: adapters?.taskQueue ?? new InMemoryQueueAdapter<Task>(),
    };
  }
}
