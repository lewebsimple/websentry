import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

import { BaseDocumentHandler, NodeRef } from "../extraction/DocumentHandler";

export class CheerioDocumentHandler implements BaseDocumentHandler {
  readonly type = "html" as const;
  readonly capabilities = ["select", "extract.text", "extract.html"] as const;

  private readonly $: cheerio.CheerioAPI;

  constructor(html: string) {
    this.$ = cheerio.load(html);
  }

  select(selector: string): NodeRef[] {
    return this.$(selector).toArray() as unknown as NodeRef[];
  }

  text(node: NodeRef): string {
    return this.$(this.asNode(node)).text();
  }

  html(node: NodeRef): string {
    return this.$(this.asNode(node)).html() ?? "";
  }

  private asNode(node: NodeRef): cheerio.BasicAcceptedElems<AnyNode> {
    return node as unknown as cheerio.BasicAcceptedElems<AnyNode>;
  }
}
