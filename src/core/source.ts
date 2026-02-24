import * as z from "zod";

import type { Item } from "./item";
import type { Pipeline } from "./pipeline";
import { pipelineSchema } from "./pipeline";
import type { Task } from "./task";
import { taskSchema } from "./task";

export const seedSchema = taskSchema.omit({ source: true });
export type Seed = z.infer<typeof seedSchema>;

export const sourceSchema = z.object({
  pipelines: z.record(z.string(), pipelineSchema),
  seeds: z.array(seedSchema),
});

export type Source<TEntity> = z.infer<typeof sourceSchema> & {
  normalize: (item: Item) => TEntity;
  process: (entity: TEntity) => void | Promise<void>;
};

export type RuntimeSource = {
  name: string;
  pipelines: Record<string, Pipeline>;
  tasks: Task[];
  normalize: (item: Item) => unknown;
  process: (entity: unknown) => void | Promise<void>;
};
