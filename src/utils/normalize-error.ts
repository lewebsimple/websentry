import { HttpError, WebSentryError } from "../core/errors";

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

  if (error instanceof HttpError) {
    if (error.status === 408) {
      return { message: error.message, retry: true };
    }
    if (error.status === 429) {
      return { message: error.message, retry: true, delayMs: error.retryAfterMs };
    }
    if (error.status >= 500) {
      return { message: error.message, retry: true };
    }
    return { message: error.message, retry: false };
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
