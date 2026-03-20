import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS DI requires runtime class references
import { PrismaService } from '@/platform/database/prisma.service';
import type {
  IUserRepository,
  UserWithOrganizations,
} from '../../domain/repositories/user.repository.interface';
import type { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
    return this.prisma.user.create({ data });
  }

  async findByIdWithOrganizations(id: string): Promise<UserWithOrganizations | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            organization: { select: { id: true, name: true, slug: true } },
            role: { select: { name: true } },
          },
        },
      },
    });
  }

  async createWithDefaultOrgMembership(
    data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<UserEntity> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data });

      const defaultOrg = await tx.organization.findFirst({
        where: { slug: 'hesabdari-dev' },
      });

      if (defaultOrg) {
        const ownerRole = await tx.role.findFirst({
          where: { organizationId: defaultOrg.id, isSystem: true },
        });

        if (ownerRole) {
          await tx.organizationMember.create({
            data: {
              userId: user.id,
              organizationId: defaultOrg.id,
              roleId: ownerRole.id,
            },
          });
        }
      }

      return user;
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }
}
