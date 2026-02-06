import { ExtractedItem } from "./extraction/ExtractedItem";
import { ExtractPlan, extractPlanSchema } from "./extraction/ExtractPlan";

export type Source<TEntity> = {
  extract: ExtractPlan;
  normalize: (item: ExtractedItem) => TEntity;
  process: (entity: TEntity) => void | Promise<void>;
};

export function defineSource<TEntity>(source: Source<TEntity>): Source<TEntity> {
  extractPlanSchema.parse(source.extract);
  return source;
}
