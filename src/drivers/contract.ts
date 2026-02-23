import { DriverName } from "../core/identifiers";
import { DriverOp, StepOf, StepValueOf } from "../steps";

// Driver context contract.
export interface DriverContext<TName extends DriverName = DriverName> {
  readonly driver: TName;
}

// Driver handlers contract, i.e. mapping supported operations to their execution functions.
export type DriverHandlers<TOps extends readonly DriverOp[], TContext> = {
  [TOp in TOps[number]]: (ctx: TContext, step: StepOf<TOp>) => Promise<StepValueOf<TOp>>;
};

// Driver contract.
export interface Driver<
  TName extends DriverName,
  TOps extends readonly DriverOp[],
  TContext extends DriverContext<TName>,
> {
  readonly name: TName;
  readonly supportedOps: TOps;

  createContext(url: string): Promise<TContext>;
  disposeContext(context: TContext): Promise<void>;
}
