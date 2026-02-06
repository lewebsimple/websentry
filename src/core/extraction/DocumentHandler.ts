import { CheerioDocumentHandler } from "../handlers/CheerioDocumentHandler";

export type Capability = "select" | "extract.text" | "extract.html";

export type NodeRef = unknown & { readonly __nodeRef: unique symbol };

export interface BaseDocumentHandler {
  readonly type: string;
  readonly capabilities: readonly Capability[];
}

export const documentHandlerNames = ["cheerio"] as const;
export type DocumentHandlerName = (typeof documentHandlerNames)[number];

export type ContentView = CheerioDocumentHandler;
