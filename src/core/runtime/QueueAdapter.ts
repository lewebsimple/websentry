export interface QueueAdapter<T> {
  enqueue(message: T): Promise<void>;
  dequeue(): Promise<T | null>;
}
