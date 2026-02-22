export const LOG_LEVEL = Object.freeze({
  error: 10,
  warn: 20,
  info: 30,
  debug: 40,
} as const);

const DEFAULT_LOG_LEVEL: LogLevelName = "info";

export type LogLevelName = keyof typeof LOG_LEVEL;
export type LogLevelValue = (typeof LOG_LEVEL)[LogLevelName];

export interface LogAdapter {
  error(message: string, ...meta: unknown[]): void;
  warn(message: string, ...meta: unknown[]): void;
  info(message: string, ...meta: unknown[]): void;
  debug(message: string, ...meta: unknown[]): void;
}

export interface LogAdapterOptions {
  logLevel?: LogLevelName;
}

export abstract class BaseLogAdapter implements LogAdapter {
  protected readonly level: LogLevelValue;

  constructor(options: LogAdapterOptions = {}) {
    this.level = LOG_LEVEL[options.logLevel ?? DEFAULT_LOG_LEVEL];
  }

  error(message: string, ...meta: unknown[]) {
    this.log(LOG_LEVEL.error, message, ...meta);
  }

  warn(message: string, ...meta: unknown[]) {
    this.log(LOG_LEVEL.warn, message, ...meta);
  }

  info(message: string, ...meta: unknown[]) {
    this.log(LOG_LEVEL.info, message, ...meta);
  }

  debug(message: string, ...meta: unknown[]) {
    this.log(LOG_LEVEL.debug, message, ...meta);
  }

  protected log(level: LogLevelValue, message: string, ...meta: unknown[]) {
    if (level <= this.level) {
      this.write(level, message, ...meta);
    }
  }

  protected abstract write(level: LogLevelValue, message: string, ...meta: unknown[]): void;
}
