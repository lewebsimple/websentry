export abstract class WebSentryError extends Error {
  readonly retryable: boolean;
  readonly delayMs?: number;

  protected constructor(message: string, retryable: boolean, delayMs?: number) {
    super(message);
    this.retryable = retryable;
    this.delayMs = delayMs;
    this.name = new.target.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }
}

export class NonRetryableError extends WebSentryError {
  constructor(message: string) {
    super(message, false);
  }
}

export class RetryableError extends WebSentryError {
  constructor(message: string, delayMs?: number) {
    super(message, true, delayMs);
  }
}

export class ConfigurationError extends NonRetryableError {}
export class UnsupportedOperationError extends NonRetryableError {}
export class ValidationError extends NonRetryableError {}

export class HttpError extends Error {
  readonly name = "HttpError";

  readonly status: number;
  readonly statusText?: string;
  readonly url?: string;
  readonly retryAfterMs?: number;

  constructor(options: {
    status: number;
    statusText?: string;
    url?: string;
    retryAfter?: string;
    message?: string;
  }) {
    const { status, statusText, url, retryAfter, message } = options;

    super(
      message ?? `HTTP ${status}${statusText ? ` ${statusText}` : ""}${url ? ` (${url})` : ""}`,
    );

    this.status = status;
    this.statusText = statusText;
    this.url = url;
    if (retryAfter) {
      const seconds = Number(retryAfter);
      if (!Number.isNaN(seconds)) {
        this.retryAfterMs = seconds * 1000;
      } else {
        const date = new Date(retryAfter);
        if (!Number.isNaN(date.getTime())) {
          this.retryAfterMs = Math.max(0, date.getTime() - Date.now());
        }
      }
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }
}
