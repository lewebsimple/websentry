import * as z from "zod";

import { drivers } from "../drivers";
import type { ControlOp, StepOf } from "../steps";

import { delay, throwIfAborted, type Abortable } from "./abort";
import { ConfigurationError, NonRetryableError, UnsupportedOperationError } from "./errors";
import type { Item } from "./item";
import type { RuntimeSource } from "./source";
import type { SourceRegistry } from "./source-registry";
import type { Task } from "./task";
import type { WebSentryAdapters } from "./websentry";

export interface ControlContext {
  readonly state: ExecutionState;
  readonly task: Task;
  readonly source: RuntimeSource;
  readonly signal?: AbortSignal;
}

type ControlHandlersByOp = {
  [TOp in ControlOp]: (
    context: ControlContext,
    step: StepOf<TOp>,
  ) => Promise<{ stop?: boolean } | void>;
};

type ExecutionState = {
  item: Item;
};

export type ExecuteTaskOptions = Abortable;

export class Executor {
  constructor(
    private readonly adapters: WebSentryAdapters,
    private readonly sources: SourceRegistry,
  ) {}

  async executeTask(task: Task, options: ExecuteTaskOptions = {}): Promise<void> {
    // Resolve source from the task.
    const source = this.sources.get(task.source);
    if (!source) {
      throw new ConfigurationError(`Unknown source "${task.source}"`);
    }
    if (source.state !== "running") {
      return;
    }

    // Resolve pipeline from the source configuration.
    const pipeline = source.pipelines[task.pipeline];
    if (!pipeline) {
      throw new ConfigurationError(
        `Unknown pipeline "${task.pipeline}" for source "${task.source}"`,
      );
    }

    // Resolve driver from the pipeline configuration.
    const DriverClass = drivers[pipeline.driver];
    if (!DriverClass) {
      throw new ConfigurationError(`Unknown driver "${pipeline.driver}"`);
    }
    // Create driver instance with adapters.
    const driver = new DriverClass(this.adapters);

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

    let driverContext: Awaited<ReturnType<typeof driver.createContext>> | undefined;

    try {
      throwIfAborted(options.signal);
      driverContext = await driver.createContext(task.url, options);
      throwIfAborted(options.signal);

      for (const step of pipeline.steps) {
        throwIfAborted(options.signal);
        switch (step.kind) {
          // Handle driver steps
          case "driver": {
            if (!driver.isSupported(step)) {
              const op = (<{ op: string }>step).op || "unknown";
              throw new UnsupportedOperationError(
                `Driver "${driver.name}" does not support operation "${op}" in source "${source.name}"`,
              );
            }
            const result = await driver.executeStep(driverContext, step, {
              signal: options.signal,
            });
            if (result !== undefined) {
              state.item.data[step.to] = result;
            }
            break;
          }

          // Handle control steps
          case "control": {
            const controlContext: ControlContext = {
              state,
              task,
              source,
              signal: options.signal,
            };
            const result = await this.executeControlStep(controlContext, step);
            if (result?.stop) {
              return;
            }
            break;
          }
        }
      }
    } finally {
      if (driverContext) {
        await driver.disposeContext(driverContext);
      }
    }
  }

  protected controlHandlers = {
    // Delay execution for a specified duration, respecting abort signals.
    delay: async ({ signal }, { ms }) => {
      await delay(ms, signal);
    },

    // Dispatch item to the source's processor and optionally reset or stop further processing.
    dispatch: async ({ source, state }, step) => {
      const entity = source.normalize(state.item);
      await source.process(entity);
      if (step.reset) {
        state.item.data = {};
      }
      if (step.stop) {
        return { stop: true };
      }
    },

    // Enqueue new tasks based on an array of URLs extracted from the state.
    enqueue: async ({ task, state, source, signal }, step) => {
      throwIfAborted(signal);
      if (source.state !== "running") {
        throw new NonRetryableError(`Cannot enqueue task: source "${task.source}" is not running`);
      }

      const urlArraySchema = z.array(z.url());
      const { success, data: urls } = urlArraySchema.safeParse(state.item.data[step.from]);
      if (!success) {
        throw new NonRetryableError(`Expected an array of URLs in "${step.from}"`);
      }

      for (const url of urls) {
        throwIfAborted(signal);
        await this.adapters.taskQueue.producer.enqueue({
          source: task.source,
          pipeline: step.pipeline,
          url,
        });
      }
    },
  } satisfies ControlHandlersByOp;

  private async executeControlStep<TOp extends ControlOp>(
    context: ControlContext,
    step: StepOf<TOp>,
  ): Promise<{ stop?: boolean } | void> {
    const handler = this.controlHandlers[step.op] as ControlHandlersByOp[TOp];
    return handler(context, step);
  }
}
