import * as z from "zod";

import { defineStep } from "../utils/define-step";

// Extract data from the driver context.
const extract = defineStep(
  "driver",
  "extract",
  z.object({
    to: z.string().min(1),
    from: z.discriminatedUnion("mode", [
      z.object({
        mode: z.literal("text"),
        selector: z.string().min(1),
      }),
      z.object({
        mode: z.literal("html"),
        selector: z.string().min(1),
      }),
      z.object({
        mode: z.literal("attr"),
        selector: z.string().min(1),
        attr: z.string().min(1),
      }),
    ]),
    limit: z.number().int().positive().optional().default(1),
  }),
  z.array(z.string()),
);

// Collection of driver step definitions.
export const driverSteps = [extract] as const;
