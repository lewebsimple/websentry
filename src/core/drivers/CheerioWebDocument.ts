import * as cheerio from "cheerio";

import type { WebDocument } from "../WebDocument";

export class CheerioWebDocument implements WebDocument {
  private readonly $: cheerio.CheerioAPI;

  constructor(html: string) {
    this.$ = cheerio.load(html);
  }

  text(selector: string): string | null {
    const el = this.$(selector).first();
    return el.length ? el.text().trim() : null;
  }

  html(selector: string): string | null {
    const el = this.$(selector).first();
    return el.length ? el.html() : null;
  }

  attr(selector: string, name: string): string | null {
    const el = this.$(selector).first();
    return el.attr(name) ?? null;
  }

  attrs(selector: string, name: string): string[] {
    return this.$(selector)
      .map((_, el) => this.$(el).attr(name))
      .get()
      .filter((value): value is string => typeof value === "string");
  }
}
