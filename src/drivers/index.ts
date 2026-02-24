import * as z from "zod";

import { CheerioDriver } from "./CheerioDriver";

export const drivers = {
  cheerio: CheerioDriver,
} as const;

export const driverNameSchema = z.enum(["cheerio"]);
export type DriverName = z.infer<typeof driverNameSchema>;
