import type { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Converts BigInt values to numbers in API responses.
 *
 * All monetary values are stored as BigInt (IRR, integer-only).
 * JSON.stringify cannot handle BigInt natively, so this interceptor
 * converts them to numbers before serialization.
 *
 * Safety: IRR amounts in any realistic enterprise scenario stay well
 * within Number.MAX_SAFE_INTEGER (~9e15 = 9 quadrillion Rial).
 */
@Injectable()
export class BigIntSerializerInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => this.serialize(data)));
  }

  private serialize(value: unknown): unknown {
    if (value === null || value === undefined) return value;
    if (typeof value === 'bigint') return Number(value);
    if (value instanceof Date) return value;
    if (Array.isArray(value)) return value.map((item) => this.serialize(item));
    if (typeof value === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = this.serialize(val);
      }
      return result;
    }
    return value;
  }
}
