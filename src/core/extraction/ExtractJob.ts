import * as z from "zod";

export const extractJobSchema = z.object({
  role: z.string(),
  url: z.url(),
});
export type ExtractJob = z.infer<typeof extractJobSchema>;
