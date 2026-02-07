import * as z from "zod";

import { KvAdapter, QueueAdapter } from "../../adapters";
import { driverNameSchema } from "../../types";
import { Item } from "../Item";
import { Source } from "../Source";

import { stepSchema } from "./Steps";
import { Task } from "./Task";

export const pipelineSchema = z.object({
  driver: driverNameSchema,
  steps: z.array(stepSchema),
});
export type Pipeline = z.infer<typeof pipelineSchema>;

export interface PipelineContext<TEntity> {
  readonly source: Source<TEntity>;
  readonly task: Task;
  readonly pipeline: Pipeline;
  readonly document: Document;
  readonly adapters: {
    queue: QueueAdapter<Task>;
    kv?: KvAdapter;
  };
  item?: Item;
}
