import { drivers } from "../drivers";
import type { ControlOp, StepOf } from "../steps";

import type { Item } from "./item";
import type { RuntimeSource } from "./source";
import type { SourceRegistry } from "./source-registry";
import type { Task } from "./task";
import type { WebSentryAdapters } from "./websentry";

type ControlHandlersByOp = {
  [TOp in ControlOp]: (
    step: StepOf<TOp>,
    state: ExecutionState,
    task: Task,
    source: RuntimeSource,
  ) => Promise<{ stop?: boolean } | void>;
};

type ExecutionState = {
  item: Item;
};

// TODO: abort signal, timeout, retries, etc.
export type ExecutorOptions = {};

export class Executor {
  constructor(
    private readonly adapters: WebSentryAdapters,
    private readonly sources: SourceRegistry,
  ) {}

  async executeTask(task: Task): Promise<void> {
    // Resolve source from the task.
    const source = this.sources.get(task.source);
    if (!source) {
      throw new Error(`Unknown source "${task.source}"`);
    }
    if (source.state !== "running") {
      return;
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
          case "control": {
            const result = await this.executeControlStep(step, state, task, source);
            if (result?.stop) {
              return;
            }
            break;
          }
        }
      }
    } finally {
      await driver.disposeContext(driverContext);
    }
  }

  protected controlHandlers = {
    delay: async (step) => {
      await new Promise((resolve) => setTimeout(resolve, step.ms));
    },
    dispatch: async (step, state, task, source) => {
      const entity = source.normalize(state.item);
      await source.process(entity);
      if (step.reset) {
        state.item.data = {};
      }
      if (step.stop) {
        return { stop: true };
      }
    },
    enqueue: async (step, state, task) => {
      const source = this.sources.get(task.source);
      if (!source || source.state !== "running") return;

      const urls = state.item.data[step.from];
      if (!Array.isArray(urls)) {
        throw new Error(`Expected an array of URLs in "${step.from}" but got ${typeof urls}`);
      }
      for (const url of urls) {
        await this.adapters.taskQueue.producer.enqueue({
          source: task.source,
          pipeline: step.pipeline,
          url,
        });
      }
    },
  } satisfies ControlHandlersByOp;

  private async executeControlStep<TOp extends ControlOp>(
    step: StepOf<TOp>,
    state: ExecutionState,
    task: Task,
    source: RuntimeSource,
  ): Promise<{ stop?: boolean } | void> {
    const handler = this.controlHandlers[step.op] as ControlHandlersByOp[TOp];
    return handler(step, state, task, source);
  }
}
