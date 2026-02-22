import { BaseLogAdapter, LOG_LEVEL, LogLevelValue } from "./BaseLogAdapter";

export class ConsoleLogAdapter extends BaseLogAdapter {
  protected write(level: LogLevelValue, message: string, ...meta: unknown[]): void {
    switch (level) {
      case LOG_LEVEL.error:
        console.error(message, ...meta);
        break;

      case LOG_LEVEL.warn:
        console.warn(message, ...meta);
        break;

      case LOG_LEVEL.info:
        console.info(message, ...meta);
        break;

      case LOG_LEVEL.debug:
      default:
        console.debug(message, ...meta);
        break;
    }
  }
}
