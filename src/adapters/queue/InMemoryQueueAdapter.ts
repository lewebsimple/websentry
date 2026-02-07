import { QueueAdapter } from "./QueueAdapter";

export class InMemoryQueueAdapter<T> implements QueueAdapter<T> {
  private items: T[] = [];

  async enqueue(message: T): Promise<void> {
    this.items.push(message);
  }

  async dequeue(): Promise<T | null> {
    return this.items.shift() ?? null;
  }
}
