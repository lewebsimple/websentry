import type { WebSentryAdapters } from "../core";
import { throwIfAborted } from "../core/abort";
import type { DriverOp, StepOf, StepValueOf } from "../steps";

import type { Driver, DriverContext, DriverExecuteOptions, DriverHandlers } from "./contract";

import type { DriverName } from ".";

export abstract class BaseDriver<
  TName extends DriverName,
  TOps extends readonly DriverOp[],
  TContext extends DriverContext<TName>,
> implements Driver<TName, TOps, TContext> {
  abstract readonly name: TName;
  abstract readonly supportedOps: TOps;

  constructor(protected readonly adapters: WebSentryAdapters) {}

  abstract createContext(url: string, options?: DriverExecuteOptions): Promise<TContext>;
  abstract disposeContext(context: TContext): Promise<void>;

  isSupported(step: StepOf<DriverOp>): step is StepOf<TOps[number]> {
    return this.supportedOps.includes(step.op);
  }

  protected abstract handlers: DriverHandlers<TOps, TContext>;

  async executeStep<TOp extends TOps[number]>(
    context: TContext,
    step: StepOf<TOp>,
    options: DriverExecuteOptions = {},
  ): Promise<StepValueOf<TOp>> {
    throwIfAborted(options.signal);
    const result = await this.handlers[step.op](context, step, options);
    throwIfAborted(options.signal);
    return result;
  }
}
