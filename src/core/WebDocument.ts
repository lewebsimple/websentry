export interface WebDocument {
  text(selector: string): string | null;
  html(selector: string): string | null;
  attr(selector: string, name: string): string | null;
  attrs(selector: string, name: string): string[];
  dispose?(): Promise<void>;
}
