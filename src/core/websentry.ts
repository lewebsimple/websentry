import {
  ConsoleLogAdapter,
  NativeFetchAdapter,
  InMemoryQueueAdapter,
  type FetchAdapter,
  type LogAdapter,
  type QueueAdapter,
} from "../adapters";
import type { QueueJob, QueueJobResult } from "../adapters/queue/contract";
import { drivers } from "../drivers";
import { normalizeError } from "../utils/normalize-error";

import { ConfigurationError } from "./errors";
import { Executor } from "./executor";
import type { RuntimeSource, Source } from "./source";
import { sourceSchema } from "./source";
import { SourceRegistry } from "./source-registry";
import type { Task } from "./task";

export type WebSentryAdapters = {
  fetch: FetchAdapter;
  log: LogAdapter;
  taskQueue: QueueAdapter<Task>;
};

export type WebSentryOptions = {
  adapters?: Partial<WebSentryAdapters>;
};

export type WebSentryRunOptions = {
  concurrency?: number;
  waitMs?: number;
  maxAttempts?: number;
  signal?: AbortSignal;
};

export class WebSentry {
  private readonly adapters: WebSentryAdapters;
  static readonly drivers = drivers;
  private readonly sources = new SourceRegistry();
  private readonly executor: Executor;

  constructor(options: WebSentryOptions) {
    this.adapters = this.resolveAdapters(options.adapters);
    this.executor = new Executor(this.adapters, this.sources);
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
        throw new ConfigurationError(
          `Seed references unknown pipeline "${seed.pipeline}" in source "${name}"`,
        );
      }
    }
    this.sources.register({
      name,
      state: "paused",
      pipelines,
      normalize,
      process,
      generateSeeds: () => seeds.map((seed) => ({ ...seed, source: name })),
    } as RuntimeSource);
  }

  unregisterSource(name: string) {
    this.sources.unregister(name);
  }

  getSource(name: string) {
    return this.sources.get(name);
  }

  listSources() {
    return this.sources.list();
  }

  pauseSource(name: string) {
    this.sources.setState(name, "paused");
  }

  startSource(name: string) {
    this.sources.setState(name, "running");
  }

  async handleJob(job: QueueJob<Task>): Promise<QueueJobResult> {
    try {
      await this.executor.executeTask(job.payload);
      return { ok: true };
    } catch (error) {
      const normalized = normalizeError(error);
      if (!normalized.retry) {
        this.adapters.log.info(`Job ${job.id} not retryable: ${normalized.message}`);
      } else {
        this.adapters.log.warn(
          `Job ${job.id} failed (attempt ${job.attempt}): ${normalized.message}`,
        );
      }
      return { ok: false, error: normalized };
    }
  }

  async run(options: WebSentryRunOptions = {}) {
    const consumer = this.adapters.taskQueue.consumer;
    if (!consumer)
      throw new ConfigurationError("Queue adapter has no consumer; cannot run in pull mode");

    const concurrency = options.concurrency ?? 1;
    const waitMs = options.waitMs ?? 250;
    const maxAttemps = options.maxAttempts ?? 5;

    const inFlight = new Set<Promise<void>>();

    while (!options.signal?.aborted) {
      if (inFlight.size >= concurrency) {
        await Promise.race(inFlight);
        continue;
      }

      const capacity = concurrency - inFlight.size;
      const jobs = await consumer.pull({ max: capacity, waitMs });
      if (jobs.length === 0) continue;

      for (const job of jobs) {
        const currentJobPromise = (async () => {
          const result = await this.handleJob(job);
          if (result.ok) {
            await consumer.ack(job.id);
            return;
          }

          const shouldRetry = result.error.retry && job.attempt < maxAttemps;
          await consumer.nack(job.id, {
            retry: shouldRetry,
            delayMs: result.error.delayMs,
          });
          if (!shouldRetry) {
            this.adapters.log.error?.(`Job ${job.id} permanently failed: ${result.error.message}`);
          }
        })().finally(() => {
          inFlight.delete(currentJobPromise);
        });
        inFlight.add(currentJobPromise);
      }
    }

    await Promise.all(inFlight);
  }
}
