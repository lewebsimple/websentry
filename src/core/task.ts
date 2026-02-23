import * as z from "zod";

// Task schema.
export const taskSchema = z.object({
  url: z.url(),
});
export type Task = z.infer<typeof taskSchema>;
