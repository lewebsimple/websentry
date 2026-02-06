import * as z from "zod";

import { extractJobSchema } from "./ExtractJob";
import { extractStepSchema } from "./ExtractStep";

export const extractPlanSchema = z.object({
  jobs: z.array(extractJobSchema),
  on: z.record(z.string(), z.array(extractStepSchema)),
});
export type ExtractPlan = z.infer<typeof extractPlanSchema>;
