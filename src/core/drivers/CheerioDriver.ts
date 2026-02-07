import type { FetchAdapter, FetchRequest } from "../../adapters/fetch/FetchAdapter";
import type { Session } from "../Session";
import type { WebDocument } from "../WebDocument";

import { CheerioWebDocument } from "./CheerioWebDocument";
import type { Driver, DriverCapability } from "./Driver";

export class CheerioDriver implements Driver {
  readonly capabilities: ReadonlySet<DriverCapability> = new Set([
    "extract.text",
    "extract.html",
    "extract.attr",
    "crawl",
  ]);

  constructor(private readonly fetcher: FetchAdapter) {}

  async open(uri: string, session: Session): Promise<WebDocument> {
    const request: FetchRequest = {
      url: uri,
      method: "GET",
      headers: session.getHeaders(uri),
    };

    const response = await this.fetcher.fetch(request);

    const setCookie = response.headers["set-cookie"];
    if (setCookie) {
      session.setCookies(uri, setCookie);
    }

    return new CheerioWebDocument(response.body);
  }
}
