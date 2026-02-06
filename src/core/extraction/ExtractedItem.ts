import * as z from "zod";

import { signalSchema } from "./Signals";

export const extractedItemSchema = z.object({
  uri: z.url(),
  signals: z.record(z.string(), signalSchema),
});
export type ExtractedItem = z.infer<typeof extractedItemSchema>;
