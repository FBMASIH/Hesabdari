import { describe, it, expect } from 'vitest';
import { BigIntSerializerInterceptor } from './bigint-serializer.interceptor';
import { of, lastValueFrom } from 'rxjs';
import type { CallHandler, ExecutionContext } from '@nestjs/common';

function createInterceptor() {
  return new BigIntSerializerInterceptor();
}

function mockHandler(data: unknown): CallHandler {
  return { handle: () => of(data) };
}

const mockContext = {} as ExecutionContext;

describe('BigIntSerializerInterceptor', () => {
  it('should convert BigInt to string', async () => {
    const interceptor = createInterceptor();
    const result = await lastValueFrom(
      interceptor.intercept(mockContext, mockHandler({ amount: 150000n })),
    );
    expect(result).toEqual({ amount: '150000' });
  });

  it('should handle nested objects with BigInt', async () => {
    const interceptor = createInterceptor();
    const result = await lastValueFrom(
      interceptor.intercept(
        mockContext,
        mockHandler({
          id: 'abc',
          totalAmount: 500000n,
          lines: [
            { lineNumber: 1, amount: 200000n, description: 'Item A' },
            { lineNumber: 2, amount: 300000n, description: 'Item B' },
          ],
        }),
      ),
    );
    expect(result).toEqual({
      id: 'abc',
      totalAmount: '500000',
      lines: [
        { lineNumber: 1, amount: '200000', description: 'Item A' },
        { lineNumber: 2, amount: '300000', description: 'Item B' },
      ],
    });
  });

  it('should preserve null and undefined', async () => {
    const interceptor = createInterceptor();
    const result = await lastValueFrom(
      interceptor.intercept(mockContext, mockHandler({ a: null, b: undefined })),
    );
    expect(result).toEqual({ a: null, b: undefined });
  });

  it('should preserve Date objects', async () => {
    const interceptor = createInterceptor();
    const date = new Date('2026-03-12');
    const result = await lastValueFrom(
      interceptor.intercept(mockContext, mockHandler({ createdAt: date })),
    );
    expect((result as Record<string, unknown>).createdAt).toBe(date);
  });

  it('should handle arrays at top level', async () => {
    const interceptor = createInterceptor();
    const result = await lastValueFrom(
      interceptor.intercept(mockContext, mockHandler([{ amount: 1000n }, { amount: 2000n }])),
    );
    expect(result).toEqual([{ amount: '1000' }, { amount: '2000' }]);
  });

  it('should pass through primitive values unchanged', async () => {
    const interceptor = createInterceptor();
    const r1 = await lastValueFrom(interceptor.intercept(mockContext, mockHandler('hello')));
    expect(r1).toBe('hello');

    const r2 = await lastValueFrom(interceptor.intercept(mockContext, mockHandler(42)));
    expect(r2).toBe(42);

    const r3 = await lastValueFrom(interceptor.intercept(mockContext, mockHandler(true)));
    expect(r3).toBe(true);
  });

  it('should handle realistic Prisma product response with salePrice fields', async () => {
    const interceptor = createInterceptor();
    const result = await lastValueFrom(
      interceptor.intercept(
        mockContext,
        mockHandler({
          id: 'prod-1',
          code: 'P001',
          name: 'Test Product',
          salePrice1: 1500000n,
          salePrice2: 1400000n,
          salePrice3: 1300000n,
          isActive: true,
        }),
      ),
    );
    expect(result).toEqual({
      id: 'prod-1',
      code: 'P001',
      name: 'Test Product',
      salePrice1: '1500000',
      salePrice2: '1400000',
      salePrice3: '1300000',
      isActive: true,
    });
  });
});
