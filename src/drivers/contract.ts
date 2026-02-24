import type { Abortable } from "../core/abort";
import type { DriverOp, StepOf, StepValueOf } from "../steps";

import type { DriverName } from ".";

// Driver context contract.
export interface DriverContext<TName extends DriverName = DriverName> {
  readonly driver: TName;
}

// Driver handlers contract,
export type DriverHandlers<TOps extends readonly DriverOp[], TContext> = {
  [TOp in TOps[number]]: (
    context: TContext,
    step: StepOf<TOp>,
    options: DriverExecuteOptions,
  ) => Promise<StepValueOf<TOp>>;
};

// Driver execution contract.
export type DriverExecuteOptions = Abortable;

// Driver contract.
export interface Driver<
  TName extends DriverName,
  TOps extends readonly DriverOp[],
  TContext extends DriverContext<TName>,
> {
  readonly name: TName;
  readonly supportedOps: TOps;

  createContext(url: string, options?: DriverExecuteOptions): Promise<TContext>;
  disposeContext(context: TContext): Promise<void>;
}
