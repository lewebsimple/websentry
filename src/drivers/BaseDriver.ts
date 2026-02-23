import { DriverName } from ".";
import { DriverOp, StepOf, StepValueOf } from "../steps";
import { WebSentryAdapters } from "../core";

// Driver context contract.
export interface DriverContext<TName extends DriverName = DriverName> {
  readonly driver: TName;
}

// Driver handlers contract, i.e. mapping supported operations to their execution functions.
export type DriverHandlers<TOps extends readonly DriverOp[], TContext> = {
  [TOp in TOps[number]]: (ctx: TContext, step: StepOf<TOp>) => Promise<StepValueOf<TOp>>;
};

// Driver contract.
interface Driver<
  TName extends DriverName,
  TOps extends readonly DriverOp[],
  TContext extends DriverContext<TName>,
> {
  readonly name: TName;
  readonly supportedOps: TOps;

  createContext(url: string): Promise<TContext>;
  disposeContext(context: TContext): Promise<void>;
}

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
