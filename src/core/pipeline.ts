import * as z from "zod";

import { driverNameSchema } from "../drivers";
import { stepSchema } from "../steps";

export const pipelineSchema = z.object({
  driver: driverNameSchema,
  steps: z.array(stepSchema),
});
export type Pipeline = z.infer<typeof pipelineSchema>;
