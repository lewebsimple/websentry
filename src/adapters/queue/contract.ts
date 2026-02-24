import type { NormalizedError } from "../../utils/normalize-error";

export interface QueueJob<TPayload = unknown> {
  id: string;
  payload: TPayload;
  attempt: number;
  enqueuedAt: number;
}

export interface QueueProducer<TPayload = unknown> {
  enqueue(payload: TPayload): Promise<void>;
}

export interface QueueConsumer<TPayload = unknown> {
  pull(options?: { max?: number; waitMs?: number }): Promise<QueueJob<TPayload>[]>;
  ack(jobId: string): Promise<void>;
  nack(jobId: string, options?: { retry?: boolean; delayMs?: number }): Promise<void>;
}

export interface QueueAdapter<TPayload = unknown> {
  readonly producer: QueueProducer<TPayload>;
  readonly consumer?: QueueConsumer<TPayload>;
}

export type QueueJobResult = { ok: true } | { ok: false; error: NormalizedError };
