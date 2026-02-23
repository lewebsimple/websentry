import { BaseQueueAdapter } from "./BaseQueueAdapter";
import { QueueConsumer, QueueJob, QueueProducer } from "./contract";

export class InMemoryQueueAdapter<TPayload> extends BaseQueueAdapter<TPayload> {
  private readonly queue: QueueJob<TPayload>[] = [];
  private readonly inFlight = new Map<string, QueueJob<TPayload>>();

  readonly producer: QueueProducer<TPayload> = {
    enqueue: async (payload) => {
      const job = this.createJob(payload);
      this.queue.push(job);
    },
  };

  readonly consumer: QueueConsumer<TPayload> = {
    pull: async ({ max = 1 } = {}) => {
      const jobs = this.queue.splice(0, max);
      for (const job of jobs) {
        this.inFlight.set(job.id, job);
      }
      return jobs;
    },

    ack: async (jobId) => {
      this.inFlight.delete(jobId);
    },

    nack: async (jobId, options) => {
      const job = this.inFlight.get(jobId);
      if (!job) return;
      this.inFlight.delete(jobId);
      const retry = options?.retry ?? true;
      if (!retry) return;
      const retried: QueueJob<TPayload> = { ...job, attempt: job.attempt + 1 };
      if (options?.delayMs && options.delayMs > 0) {
        setTimeout(() => {
          this.queue.push(retried);
        }, options.delayMs);
      } else {
        this.queue.push(retried);
      }
    },
  };
}
