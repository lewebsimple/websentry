import {
  ConsoleLogAdapter,
  NativeFetchAdapter,
  InMemoryQueueAdapter,
  type FetchAdapter,
  type LogAdapter,
  type QueueAdapter,
} from "../adapters";
import { drivers } from "../drivers";

import type { RuntimeSource, Source } from "./source";
import { sourceSchema } from "./source";
import type { Task } from "./task";

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
  private readonly sources = new Map<string, RuntimeSource>();

  constructor(options: WebSentryOptions) {
    this.adapters = this.resolveAdapters(options.adapters);
  }

  private resolveAdapters(adapters?: Partial<WebSentryAdapters>): WebSentryAdapters {
    return {
      fetch: adapters?.fetch ?? new NativeFetchAdapter(),
      log: adapters?.log ?? new ConsoleLogAdapter(),
      taskQueue: adapters?.taskQueue ?? new InMemoryQueueAdapter<Task>(),
    };
  }

  registerSource<TEntity>(name: string, source: Source<TEntity>) {
    const { normalize, process, ...definition } = source;
    const { seeds, pipelines } = sourceSchema.parse(definition);
    for (const seed of seeds) {
      if (!(seed.pipeline in pipelines)) {
        throw new Error(`Seed references unknown pipeline "${seed.pipeline}" in source "${name}"`);
      }
    }
    const tasks: Task[] = seeds.map((seed) => ({ ...seed, source: name }));
    this.sources.set(name, {
      name,
      pipelines,
      tasks,
      normalize,
      process,
    } as RuntimeSource);
  }

  unregisterSource(name: string) {
    this.sources.delete(name);
  }
}
