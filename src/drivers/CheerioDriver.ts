import { load, type CheerioAPI } from "cheerio";

import type { WebSentryAdapters } from "../core";

import { BaseDriver } from "./BaseDriver";
import type { DriverContext, DriverHandlers } from "./contract";

// Supported operations for CheerioDriver.
const supportedOps = ["extract"] as const;
type CheerioOps = typeof supportedOps;

// Driver context specific to CheerioDriver.
export interface CheerioContext extends DriverContext<"cheerio"> {
  readonly driver: "cheerio";
  readonly $: CheerioAPI;
  readonly url: string;
}

export class CheerioDriver extends BaseDriver<"cheerio", CheerioOps, CheerioContext> {
  readonly name = "cheerio" as const;
  readonly supportedOps = supportedOps;

  constructor(adapters: WebSentryAdapters) {
    super(adapters);
  }

  async createContext(url: string): Promise<CheerioContext> {
    const response = await this.adapters.fetch.fetch({ url });
    const contentType = response.headers["content-type"] ?? "";
    const $ = load(response.body, {
      baseURI: response.url,
      xmlMode: contentType.includes("xml"),
    });
    return { driver: "cheerio", $, url: response.url };
  }

  async disposeContext(_context: CheerioContext): Promise<void> {}

  protected handlers: DriverHandlers<CheerioOps, CheerioContext> = {
    extract: async ({ $ }, step) => {
      const value: string[] = [];
      $(step.from.selector).each((_, el) => {
        if (value.length >= step.limit) return false;
        switch (step.from.mode) {
          case "text":
            value.push($(el).text().trim());
            break;
          case "html":
            value.push($(el).html() ?? "");
            break;
          case "attr":
            value.push($(el).attr(step.from.attr) ?? "");
            break;
        }
      });
      return value;
    },
  };
}
