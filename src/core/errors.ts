export abstract class WebSentryError extends Error {
  readonly retryable: boolean;
  readonly delayMs?: number;

  protected constructor(message: string, retryable: boolean, delayMs?: number) {
    super(message);
    this.retryable = retryable;
    this.delayMs = delayMs;
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
export class ValidationError extends NonRetryableError {}
export class UnsupportedOperationError extends NonRetryableError {}
