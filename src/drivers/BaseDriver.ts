import { DriverOp, StepOf, StepValueOf } from "../steps";
import { WebSentryAdapters } from "../core";
import { DriverName } from "../core/identifiers";
import { Driver, DriverContext, DriverHandlers } from "./contract";

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

  protected isSupported(op: string): op is TOps[number] {
    return (this.supportedOps as readonly string[]).includes(op);
  }

  protected abstract handlers: DriverHandlers<TOps, TContext>;

  async execute<TOp extends TOps[number]>(
    context: TContext,
    step: StepOf<TOp>,
  ): Promise<StepValueOf<TOp>> {
    const handler = this.handlers[step.op];
    return handler(context, step);
  }
}
