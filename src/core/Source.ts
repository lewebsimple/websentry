import { Item } from "./Item";

export type Source<TEntity> = {
  normalize: (item: Item) => TEntity;
  process: (entity: TEntity) => void | Promise<void>;
};
