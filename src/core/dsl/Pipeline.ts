import * as z from "zod";

import { driverNameSchema } from "../../types";

import { stepSchema } from "./Steps";

export const pipelineSchema = z.object({
  driver: driverNameSchema,
  steps: z.array(stepSchema),
});
export type Pipeline = z.infer<typeof pipelineSchema>;
