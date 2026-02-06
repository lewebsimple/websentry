import { ExtractJob } from "./extraction/ExtractJob";
import type { WebSentryRuntime } from "./runtime";
import { Source } from "./Source";

export class WebSentry<TRuntime extends WebSentryRuntime> {
  readonly runtime: TRuntime;
  readonly sources: Record<string, Source<unknown>>;

  constructor(options: { runtime: TRuntime; sources: Record<string, Source<unknown>> }) {
    this.runtime = options.runtime;
    this.sources = options.sources;
  }

  async handle(job: ExtractJob): Promise<void> {
    // validate job
    // build ExtractionState
    // execute ExtractSteps for job.role
    // emit new jobs (via callback or return value)
    // commit items
    // normalize + process
  }
}
