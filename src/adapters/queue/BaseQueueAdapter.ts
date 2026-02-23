import { QueueAdapter, QueueConsumer, QueueJob, QueueProducer } from "./contract";

export abstract class BaseQueueAdapter<TPayload> implements QueueAdapter<TPayload> {
  abstract readonly producer: QueueProducer<TPayload>;
  readonly consumer?: QueueConsumer<TPayload>;

  protected createJob(
    payload: TPayload,
    options?: {
      id?: string;
      attempt?: number;
      enqueuedAt?: number;
    },
  ): QueueJob<TPayload> {
    return {
      id: options?.id ?? this.generateId(),
      payload,
      attempt: options?.attempt ?? 0,
      enqueuedAt: options?.enqueuedAt ?? Date.now(),
    };
  }

  protected generateId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2);
  }
}
