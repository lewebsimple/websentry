import { ExtractJob } from "./ExtractJob";
import { Signal } from "./Signals";

export type Capability = "select" | "extract.text" | "extract.html";

export interface BaseContentView {
  type: string;
  capabilities: readonly Capability[];
}

type NodeRef = unknown & { readonly __nodeRef: unique symbol };

export interface HtmlContentView extends BaseContentView {
  type: "html";
  capabilities: ["select", "extract.text", "extract.html"];
  select(selector: string): NodeRef[];
  text(node: NodeRef): string;
  html(node: NodeRef): string;
}

export type ContentView = HtmlContentView;

export type ExtractionState = {
  job: ExtractJob;
  content?: ContentView;
  signals: Record<string, Signal>;
};
