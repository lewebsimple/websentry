import { ContentView } from "./DocumentHandler";
import { ExtractJob } from "./ExtractJob";
import { Signal } from "./Signals";

export type ExtractionState = {
  job: ExtractJob;
  content?: ContentView;
  signals: Record<string, Signal>;
};
