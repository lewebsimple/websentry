import type { WebSentryAdapters } from "../core";
import type { DriverOp, StepOf, StepValueOf } from "../steps";

import type { Driver, DriverContext, DriverHandlers } from "./contract";

import type { DriverName } from ".";

export abstract class BaseDriver<
  TName extends DriverName,
  TOps extends readonly DriverOp[],
  TContext extends DriverContext<TName>,
> implements Driver<TName, TOps, TContext> {
  abstract readonly name: TName;
  abstract readonly supportedOps: TOps;

  constructor(protected readonly adapters: WebSentryAdapters) {}

  abstract createContext(url: string): Promise<TContext>;
  abstract disposeContext(context: TContext): Promise<void>;

  isSupported(step: StepOf<DriverOp>): step is StepOf<TOps[number]> {
    return this.supportedOps.includes(step.op);
  }

  protected abstract handlers: DriverHandlers<TOps, TContext>;

  async executeStep<TOp extends TOps[number]>(
    context: TContext,
    step: StepOf<TOp>,
  ): Promise<StepValueOf<TOp>> {
    const handler = this.handlers[step.op];
    return handler(context, step);
  }
}
