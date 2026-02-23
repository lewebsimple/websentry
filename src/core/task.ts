import * as z from "zod";

// Task schema.
export const taskSchema = z.object({
  source: z.string(),
  pipeline: z.string(),
  url: z.url(),
});
export type Task = z.infer<typeof taskSchema>;
