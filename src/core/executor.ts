import { drivers } from "../drivers";

import type { Item } from "./item";
import type { RuntimeSource } from "./source";
import type { Task } from "./task";
import type { WebSentryAdapters } from "./websentry";

type ExecutionState = {
  item: Item;
};

// TODO: onBeforeStep, onAfterStep, onError hooks for better observability and error handling.
export type ExecutorHooks = {};

// TODO: abort signal, timeout, retries, etc.
export type ExecutorOptions = {};

export class Executor {
  constructor(
    private readonly adapters: WebSentryAdapters,
    private readonly sources: Map<string, RuntimeSource>,
  ) {}

  async executeTask(task: Task): Promise<void> {
    // Resolve source from the task.
    const source = this.sources.get(task.source);
    if (!source) {
      throw new Error(`Unknown source "${task.source}"`);
    }

    // Resolve pipeline from the source configuration.
    const pipeline = source.pipelines[task.pipeline];
    if (!pipeline) {
      throw new Error(`Unknown pipeline "${task.pipeline}" for source "${task.source}"`);
    }

    // Resolve driver from the pipeline configuration.
    const DriverClass = drivers[pipeline.driver];
    if (!DriverClass) {
      throw new Error(`Unknown driver "${pipeline.driver}"`);
    }

    // Create driver context for the execution.
    const driver = new DriverClass(this.adapters);
    const driverContext = await driver.createContext(task.url);

    // Initialize execution state with the item and control flag.
    const state: ExecutionState = {
      item: {
        source: task.source,
        pipeline: task.pipeline,
        url: task.url,
        data: {},
        createdAt: new Date().toISOString(),
      },
    };

    try {
      for (const step of pipeline.steps) {
        switch (step.kind) {
          // Handle driver steps
          case "driver": {
            if (!driver.isSupported(step)) {
              const op = (<{ op: string }>step).op || "unknown";
              throw new Error(
                `Driver "${driver.name}" does not support operation "${op}" required by step in pipeline "${pipeline.driver}"`,
              );
            }
            const result = await driver.executeStep(driverContext, step);
            if (result !== undefined) {
              state.item.data[step.to] = result;
            }
            break;
          }

          // Handle control steps
          // TODO: Refactor into control step handlers similar to driver handlers for better extensibility.
          case "control": {
            switch (step.op) {
              case "delay":
                await new Promise((resolve) => setTimeout(resolve, step.ms));
                break;

              case "dispatch":
                const entity = source.normalize(state.item);
                await source.process(entity);
                if (step.stop) {
                  return;
                }
                if (step.reset) {
                  state.item.data = {};
                }
                break;

              case "enqueue":
                const urls = state.item.data[step.from];
                if (!Array.isArray(urls)) {
                  throw new Error(
                    `Expected an array of URLs in "${step.from}" but got ${typeof urls}`,
                  );
                }
                for (const url of urls) {
                  this.adapters.taskQueue.producer.enqueue({
                    source: task.source,
                    pipeline: step.pipeline,
                    url,
                  });
                }
                break;
            }
            break;
          }
        }
      }
    } finally {
      await driver.disposeContext(driverContext);
    }
  }
}
