import * as z from "zod";

import { controlSteps } from "./control";
import { driverSteps } from "./driver";

// Collection of all step definitions.
export const stepDefinitions = [...controlSteps, ...driverSteps] as const;

// Step definition union types, i.e. { kind, op, stepSchema, valueSchema }.
export type StepDefinition = (typeof stepDefinitions)[number];
export type ControlStepDefinition = Extract<StepDefinition, { kind: "control" }>;
export type DriverStepDefinition = Extract<StepDefinition, { kind: "driver" }>;

// Discriminated union of all step schemas.
export const stepSchema = z.discriminatedUnion(
  "kind",
  // Cast array as tuple to preserve literal types for properties in the union.
  stepDefinitions.map(({ stepSchema }) => stepSchema) as unknown as [
    (typeof stepDefinitions)[number]["stepSchema"],
    ...(typeof stepDefinitions)[number]["stepSchema"][],
  ],
);

// Inferred step input and output types.
export type StepInput = z.input<typeof stepSchema>;
export type Step = z.infer<typeof stepSchema>;

// Step operation union types, i.e. "delay" | "emit" | "crawl" | "extract".
export type StepOp = Step["op"];
export type ControlOp = ControlStepDefinition["op"];
export type DriverOp = DriverStepDefinition["op"];

// Projection type to get step types by kind.
type StepByKind = { [TKind in Step["kind"]]: Extract<Step, { kind: TKind }> };
export type ControlStep = StepByKind["control"];
export type DriverStep = StepByKind["driver"];

// Projection type to get step types by operation.
type StepByOp = { [TOp in StepOp]: Extract<Step, { op: TOp }> };
export type StepOf<TOp extends StepOp> = StepByOp[TOp];

// Projection type to get step value types by operation.
type StepValueByOp = {
  [TDef in StepDefinition as TDef["op"]]: Exclude<
    TDef["valueSchema"],
    undefined
  > extends z.ZodTypeAny
    ? z.infer<Exclude<TDef["valueSchema"], undefined>>
    : void;
};
export type StepValueOf<TOp extends StepOp> = StepValueByOp[TOp];
