import { Injectable } from '@nestjs/common';
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

      // Create a personal organization for the new user
      const defaultCurrency =
        (await tx.currency.findFirst({ where: { code: 'IRR', isActive: true } })) ??
        (await tx.currency.findFirst({ where: { isActive: true } }));

      const org = await tx.organization.create({
        data: {
          name: `سازمان ${data.firstName} ${data.lastName}`,
          slug: `org-${Date.now()}`,
          defaultCurrencyId: defaultCurrency!.id,
        },
      });

      // Create a system owner role for the new organization
      const ownerRole = await tx.role.create({
        data: {
          organizationId: org.id,
          name: 'Owner',
          isSystem: true,
        },
      });

      await tx.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          roleId: ownerRole.id,
        },
      });

      return user;
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }
}
