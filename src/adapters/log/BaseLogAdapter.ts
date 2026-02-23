import {
  DEFAULT_LOG_LEVEL,
  LOG_LEVEL,
  LogAdapter,
  LogAdapterOptions,
  LogLevelValue,
} from "./contract";

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
