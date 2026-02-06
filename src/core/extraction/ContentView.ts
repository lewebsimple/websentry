export type Capability = "select" | "extract.text" | "extract.html";

export type NodeRef = unknown & { readonly __nodeRef: unique symbol };

export interface BaseContentView {
  readonly type: string;
  readonly capabilities: readonly Capability[];
}

export interface HtmlContentView extends BaseContentView {
  readonly type: "html";
  readonly capabilities: readonly ["select", "extract.text", "extract.html"];
  select(selector: string): NodeRef[];
  text(node: NodeRef): string;
  html(node: NodeRef): string;
}

export type ContentView = HtmlContentView;
