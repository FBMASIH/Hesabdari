import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { DomainError } from '../errors/domain.error';
import { ApplicationError } from '../errors/application.error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    let status = 500;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let details: Record<string, unknown> | undefined;

    if (exception instanceof ApplicationError) {
      status = exception.statusCode;
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof DomainError) {
      status = 422;
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        const resp = response as Record<string, any>;
        code = resp.error ?? 'HTTP_ERROR';
        message = Array.isArray(resp.message) ? resp.message.join(', ') : (resp.message ?? message);
        details = resp.details;
      } else {
        message = String(response);
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
    }

    reply.status(status).send({
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    });
  }
}
