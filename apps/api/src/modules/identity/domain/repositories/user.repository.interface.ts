import type { UserEntity } from '../entities/user.entity';

export interface UserWithOrganizations extends UserEntity {
  memberships: Array<{
    organization: { id: string; name: string; slug: string };
    role: { name: string };
  }>;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByIdWithOrganizations(id: string): Promise<UserWithOrganizations | null>;
  create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity>;
  /**
   * Creates a user and auto-assigns them to the default organization ('hesabdari-dev')
   * with the system Owner role. All operations are wrapped in a transaction.
   * If the default org or system role is not found, the user is still created (without membership).
   */
  createWithDefaultOrgMembership(
    data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<UserEntity>;
  existsByEmail(email: string): Promise<boolean>;
}
