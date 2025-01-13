import {
  FilterQuery,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';
/**
 * Legacy Class DeleteQuery
 * Migrate FindQuery to Query
 */
export class FindQuery<T> {
  filter!: FilterQuery<T>;

  projection?: any;

  options?: QueryOptions;
}

export class MongoQuery<T> {
  filter!: FilterQuery<T>;

  projection?: any;

  options?: QueryOptions;
}

/**
 * Legacy Class DeleteQuery
 * Migrate PatchBody to Update
 */
export class PatchBody<T> {
  filter!: FilterQuery<T>;

  update?: UpdateQuery<T> | UpdateWithAggregationPipeline;

  options?: QueryOptions;
}

export class MongoUpdate<T> {
  filter!: FilterQuery<T>;

  update?: UpdateQuery<T> | UpdateWithAggregationPipeline;

  options?: QueryOptions;
}

/**
 * Legacy Class DeleteQuery
 * Migrate DeleteQuery to Delete
 */
export class DeleteQuery<T> {
  filter!: FilterQuery<T>;

  options?: QueryOptions;
}
export class MongoDelete<T> {
  filter!: FilterQuery<T>;

  options?: QueryOptions;
}
