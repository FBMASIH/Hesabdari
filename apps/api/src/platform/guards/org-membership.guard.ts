import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@/platform/database/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { RequestUser } from '../decorators/current-user.decorator';

/**
 * Validates that the authenticated user is a member of the organization
 * specified by the `:orgId` route parameter.
 *
 * Activates only when the route contains an `orgId` param.
 * Skips for @Public() routes.
 */
@Injectable()
export class OrgMembershipGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const orgId: string | undefined = request.params?.orgId;

    // Not an org-scoped endpoint — skip
    if (!orgId) return true;

    const user = request.user as RequestUser | undefined;
    if (!user?.userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.userId,
          organizationId: orgId,
        },
      },
      select: { id: true, roleId: true },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    // Attach membership info to request for downstream use
    request.orgMembership = membership;
    return true;
  }
}
