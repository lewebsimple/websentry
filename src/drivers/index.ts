import { CheerioDriver } from "./CheerioDriver";

export const drivers = {
  cheerio: CheerioDriver,
} as const;

export type DriverName = keyof typeof drivers;
