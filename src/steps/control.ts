import * as z from "zod";
import { defineStep } from "../utils/define-step";

// Delay execution for a specified number of milliseconds.
const delay = defineStep(
  "control",
  "delay",
  z.object({
    ms: z.number().int().positive(),
  }),
);

// Dispatch item from collected values.
const dispatch = defineStep("control", "dispatch", z.object({}));

// Enqueue new items to a specified pipeline.
const enqueue = defineStep(
  "control",
  "enqueue",
  z.object({
    pipeline: z.string().min(1),
    from: z.string().min(1),
    limit: z.number().int().positive().optional(),
    dedupe: z.boolean().optional().default(true),
  }),
);

// Collection of control step definitions.
export const controlSteps = [delay, dispatch, enqueue] as const;
