import * as z from "zod";
import { stepSchema } from "../steps";
import { driverNameSchema } from "../drivers";

export const pipelineSchema = z.object({
  driver: driverNameSchema,
  steps: z.array(stepSchema),
});
export type Pipeline = z.infer<typeof pipelineSchema>;
