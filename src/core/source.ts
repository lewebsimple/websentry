import * as z from "zod";
import { taskSchema } from "./task";

export const sourceSchema = z.object({
  seeds: z.array(taskSchema),
});
