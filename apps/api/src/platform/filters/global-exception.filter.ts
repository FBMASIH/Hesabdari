import type { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Catch, HttpException, Logger } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { DomainError } from '../errors/domain.error';
import { ApplicationError } from '../errors/application.error';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    const { status, body } = this.resolve(exception);

    reply.status(status).send(body);
  }

  private resolve(exception: unknown): { status: number; body: ErrorResponse } {
    if (exception instanceof ZodError) {
      return {
        status: 400,
        body: {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: exception.issues.map((i) => ({
              path: i.path,
              message: i.message,
            })),
          },
        },
      };
    }

    if (exception instanceof ApplicationError) {
      return {
        status: exception.statusCode,
        body: { error: { code: exception.code, message: exception.message } },
      };
    }

    if (exception instanceof DomainError) {
      return {
        status: 422,
        body: { error: { code: exception.code, message: exception.message } },
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        const resp = response as Record<string, unknown>;
        const msg = Array.isArray(resp.message)
          ? (resp.message as string[]).join(', ')
          : String(resp.message ?? 'An error occurred');
        return {
          status,
          body: {
            error: {
              code: String(resp.error ?? 'HTTP_ERROR'),
              message: msg,
            },
          },
        };
      }
      return {
        status,
        body: { error: { code: 'HTTP_ERROR', message: String(response) } },
      };
    }

    // Unhandled — log stack, return generic message
    if (exception instanceof Error) {
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
    } else {
      this.logger.error('Unhandled non-Error exception', String(exception));
    }

    return {
      status: 500,
      body: { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    };
  }
}
