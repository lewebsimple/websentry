export const LOG_LEVEL = Object.freeze({
  error: 10,
  warn: 20,
  info: 30,
  debug: 40,
} as const);

export const DEFAULT_LOG_LEVEL: LogLevelName = "info";

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
