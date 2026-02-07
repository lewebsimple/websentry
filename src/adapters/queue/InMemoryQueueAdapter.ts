import { QueueAdapter } from "./QueueAdapter";

export class InMemoryQueueAdapter<TJob> implements QueueAdapter<TJob> {
  private items: TJob[] = [];

  async enqueue(job: TJob): Promise<void> {
    this.items.push(job);
  }

  async enqueueMany(jobs: TJob[]): Promise<void> {
    this.items.push(...jobs);
  }

  async dequeue(): Promise<TJob | null> {
    return this.items.shift() ?? null;
  }
}
