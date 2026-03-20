import type { ExecutionContext } from '@nestjs/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { type Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = Record<string, unknown>>(err: Error | null, user: TUser | false): TUser {
    if (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException(err.message || 'Authentication failed');
    }
    if (!user) {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
    return user;
  }
}
