import type { ExtractJob } from "../extraction/ExtractJob";

import { FetchAdapter } from "./FetchAdapter";
import { KVAdapter } from "./KvAdapter";
import { QueueAdapter } from "./QueueAdapter";

export type WebSentryRuntime = {
  fetch: FetchAdapter;
  queue: QueueAdapter<ExtractJob>;
  kv?: KVAdapter;
};
