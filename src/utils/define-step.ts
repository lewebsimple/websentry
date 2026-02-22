import * as z from "zod";

// Diffentiate between control and driver steps.
const stepKinds = ["control", "driver"] as const;
export type StepKind = (typeof stepKinds)[number];

// Step definition contract for validation and type inference.
type StepDefinition<
  TKind extends StepKind,
  TOp extends string,
  TParamsShape extends z.ZodRawShape,
  TValueSchema extends z.ZodTypeAny | undefined = undefined,
> = {
  kind: TKind;
  op: TOp;
  stepSchema: z.ZodObject<{ op: z.ZodLiteral<TOp> } & TParamsShape>;
  valueSchema?: TValueSchema;
};

// Factory function to create step definitions with consistent structure.
export function defineStep<
  TKind extends StepKind,
  TOp extends string,
  TParamsShape extends z.ZodRawShape,
  TValueSchema extends z.ZodTypeAny | undefined = undefined,
>(
  kind: TKind,
  op: TOp,
  paramsSchema: z.ZodObject<TParamsShape>,
  valueSchema?: TValueSchema,
): StepDefinition<TKind, TOp, TParamsShape, TValueSchema> {
  return {
    kind,
    op,
    stepSchema: z.object({ op: z.literal(op) }).extend(paramsSchema.shape),
    valueSchema,
  };
}
