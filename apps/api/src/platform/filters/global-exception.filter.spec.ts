import { describe, it, expect } from 'vitest';
import { HttpException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ZodError } from 'zod';
import { GlobalExceptionFilter } from './global-exception.filter';
import { ApplicationError, NotFoundError, ConflictError } from '../errors/application.error';
import { DomainError } from '../errors/domain.error';

function createMockHost() {
  const sent: { status: number; body: unknown } = { status: 0, body: null };
  const reply = {
    status(code: number) {
      sent.status = code;
      return reply;
    },
    send(body: unknown) {
      sent.body = body;
      return reply;
    },
  };
  const host = {
    switchToHttp: () => ({
      getResponse: () => reply,
      getRequest: () => ({}),
    }),
  };
  return { host: host as never, sent };
}

describe('GlobalExceptionFilter', () => {
  const filter = new GlobalExceptionFilter();

  it('should handle ZodError as 400 with validation details', () => {
    const { host, sent } = createMockHost();
    const error = new ZodError([
      {
        code: 'too_small',
        minimum: 1,
        type: 'string',
        inclusive: true,
        exact: false,
        message: 'Required',
        path: ['code'],
      },
      {
        code: 'invalid_type',
        expected: 'number',
        received: 'string',
        message: 'Expected number',
        path: ['amount'],
      },
    ]);

    filter.catch(error, host);

    expect(sent.status).toBe(400);
    const body = sent.body as { error: { code: string; message: string; details: unknown[] } };
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details).toHaveLength(2);
    expect(body.error.details[0]).toEqual({ path: ['code'], message: 'Required' });
  });

  it('should handle NotFoundError as 404', () => {
    const { host, sent } = createMockHost();
    filter.catch(new NotFoundError('Invoice', 'abc-123'), host);

    expect(sent.status).toBe(404);
    const body = sent.body as { error: { code: string; message: string } };
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toContain('abc-123');
  });

  it('should handle ConflictError as 409', () => {
    const { host, sent } = createMockHost();
    filter.catch(new ConflictError('Duplicate code'), host);

    expect(sent.status).toBe(409);
    const body = sent.body as { error: { code: string; message: string } };
    expect(body.error.code).toBe('CONFLICT');
  });

  it('should handle ApplicationError with custom status', () => {
    const { host, sent } = createMockHost();
    filter.catch(new ApplicationError('INVALID_TRANSITION', 'Cannot change status', 422), host);

    expect(sent.status).toBe(422);
    const body = sent.body as { error: { code: string; message: string } };
    expect(body.error.code).toBe('INVALID_TRANSITION');
  });

  it('should handle DomainError as 422', () => {
    const { host, sent } = createMockHost();
    filter.catch(new DomainError('JOURNAL_NOT_BALANCED', 'Debits != Credits'), host);

    expect(sent.status).toBe(422);
    const body = sent.body as { error: { code: string; message: string } };
    expect(body.error.code).toBe('JOURNAL_NOT_BALANCED');
  });

  it('should handle HttpException (NestJS built-in)', () => {
    const { host, sent } = createMockHost();
    filter.catch(new UnauthorizedException(), host);

    expect(sent.status).toBe(401);
    const body = sent.body as { error: { code: string; message: string } };
    // NestJS 11 returns { message: 'Unauthorized', statusCode: 401 } — no 'error' field
    expect(typeof body.error.code).toBe('string');
    expect(body.error.message).toBe('Unauthorized');
  });

  it('should handle BadRequestException with message array', () => {
    const { host, sent } = createMockHost();
    filter.catch(
      new BadRequestException({ message: ['field is required', 'value too short'] }),
      host,
    );

    expect(sent.status).toBe(400);
    const body = sent.body as { error: { code: string; message: string } };
    expect(body.error.message).toBe('field is required, value too short');
  });

  it('should handle unknown errors as 500 without leaking details', () => {
    const { host, sent } = createMockHost();

    filter.catch(new Error('database connection refused'), host);

    expect(sent.status).toBe(500);
    const body = sent.body as { error: { code: string; message: string } };
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).toBe('An unexpected error occurred');
    // Must NOT leak the actual error message
    expect(body.error.message).not.toContain('database');
  });

  it('should return consistent error shape for all error types', () => {
    const cases: unknown[] = [
      new ZodError([]),
      new NotFoundError('X', '1'),
      new DomainError('TEST', 'msg'),
      new HttpException('fail', 400),
      new Error('crash'),
    ];

    for (const exception of cases) {
      const { host, sent } = createMockHost();
      filter.catch(exception, host);
      const body = sent.body as { error: { code: string; message: string } };
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('code');
      expect(body.error).toHaveProperty('message');
      expect(typeof body.error.code).toBe('string');
      expect(typeof body.error.message).toBe('string');
    }
  });
});
