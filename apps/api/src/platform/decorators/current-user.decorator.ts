import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export interface RequestUser {
  userId: string;
  email: string;
  organizationId?: string;
}

export const CurrentUser = createParamDecorator(
  (
    data: keyof RequestUser | undefined,
    ctx: ExecutionContext,
  ): RequestUser | string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestUser;
    return data ? user?.[data] : user;
  },
);
