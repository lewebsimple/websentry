export interface QueueAdapter<TJob> {
  enqueue(job: TJob): Promise<void>;
  enqueueMany(jobs: TJob[]): Promise<void>;
  dequeue(): Promise<TJob | null>;
}
