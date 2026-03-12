import type { LoggerService } from '@nestjs/common';
import { Injectable, Scope } from '@nestjs/common';
import pino from 'pino';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements LoggerService {
  private logger: pino.Logger;
  private context?: string;

  constructor() {
    this.logger = pino({
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, ...args: unknown[]) {
    this.logger.info({ context: this.context, ...this.formatArgs(args) }, message);
  }

  error(message: string, ...args: unknown[]) {
    this.logger.error({ context: this.context, ...this.formatArgs(args) }, message);
  }

  warn(message: string, ...args: unknown[]) {
    this.logger.warn({ context: this.context, ...this.formatArgs(args) }, message);
  }

  debug(message: string, ...args: unknown[]) {
    this.logger.debug({ context: this.context, ...this.formatArgs(args) }, message);
  }

  verbose(message: string, ...args: unknown[]) {
    this.logger.trace({ context: this.context, ...this.formatArgs(args) }, message);
  }

  private formatArgs(args: unknown[]): Record<string, unknown> {
    if (args.length === 0) return {};
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null)
      return args[0] as Record<string, unknown>;
    return { args };
  }
}
