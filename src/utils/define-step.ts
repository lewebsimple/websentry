import * as z from "zod";

// Diffentiate between control and driver steps.
const stepKinds = ["control", "driver"] as const;
export type StepKind = (typeof stepKinds)[number];

type BaseParamsShape = z.ZodRawShape;

type StepDefinition<
  TKind extends StepKind,
  TOp extends string,
  TStepSchema extends z.ZodTypeAny,
  TValueSchema extends z.ZodTypeAny | undefined,
> = {
  kind: TKind;
  op: TOp;
  stepSchema: TStepSchema;
  valueSchema?: TValueSchema;
};

// Step definition factory for steps that don't produce a value.
export function defineStep<
  TKind extends StepKind,
  TOp extends string,
  TParamsShape extends BaseParamsShape,
>(
  kind: TKind,
  op: TOp,
  paramsSchema: z.ZodObject<TParamsShape>,
): StepDefinition<
  TKind,
  TOp,
  z.ZodObject<TParamsShape & { op: z.ZodLiteral<TOp>; kind: z.ZodLiteral<TKind> }>,
  undefined
>;

// Step definition factory for steps that produce a value.
export function defineStep<
  TKind extends StepKind,
  TOp extends string,
  TParamsShape extends BaseParamsShape & { to: z.ZodString },
  TValueSchema extends z.ZodTypeAny,
>(
  kind: TKind,
  op: TOp,
  paramsSchema: z.ZodObject<TParamsShape>,
  valueSchema: TValueSchema,
): StepDefinition<
  TKind,
  TOp,
  z.ZodObject<TParamsShape & { op: z.ZodLiteral<TOp>; kind: z.ZodLiteral<TKind> }>,
  TValueSchema
>;

// Step definition factory implementation.
export function defineStep<
  TKind extends StepKind,
  TOp extends string,
  TParamsShape extends BaseParamsShape,
  TValueSchema extends z.ZodTypeAny | undefined,
>(kind: TKind, op: TOp, paramsSchema: z.ZodObject<TParamsShape>, valueSchema?: TValueSchema) {
  const stepSchema = paramsSchema.extend({
    op: z.literal(op),
    kind: z.literal(kind),
  });
  return {
    kind,
    op,
    stepSchema,
    valueSchema,
  };
}
