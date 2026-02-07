import * as z from "zod";

import { pipelineIdSchema, sourceIdSchema } from "../../types";

export const taskSchema = z.object({
  sourceId: sourceIdSchema,
  url: z.url(),
  pipeline: pipelineIdSchema,
});
export type Task = z.infer<typeof taskSchema>;
