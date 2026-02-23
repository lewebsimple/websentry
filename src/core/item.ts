import * as z from "zod";

export const itemSchema = z.object({
  source: z.string(),
  pipeline: z.string(),
  url: z.url(),
  data: z.record(z.string(), z.unknown()),
  createdAt: z.iso.datetime(),
});
export type Item = z.infer<typeof itemSchema>;
