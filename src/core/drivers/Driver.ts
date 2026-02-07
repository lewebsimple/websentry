import type { Session } from "../Session";
import type { WebDocument } from "../WebDocument";

export type DriverCapability = "extract.text" | "extract.html" | "extract.attr" | "crawl";

export interface Driver {
  readonly capabilities: ReadonlySet<DriverCapability>;
  open(uri: string, session: Session): Promise<WebDocument>;
}

export const driverNames = ["cheerio"] as const;
export type DriverName = (typeof driverNames)[number];
