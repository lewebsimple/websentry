import { WebSentryError } from "../core/errors";

export type NormalizedError = {
  message: string;
  retry: boolean;
  delayMs?: number;
  cause?: unknown;
};

export function normalizeError(error: unknown): NormalizedError {
  if (error instanceof WebSentryError) {
    return {
      message: error.message,
      retry: error.retryable,
      delayMs: error.delayMs,
      cause: error,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      retry: true,
      cause: error,
    };
  }

  return {
    message: "Unknown error",
    retry: true,
    cause: error,
  };
}
