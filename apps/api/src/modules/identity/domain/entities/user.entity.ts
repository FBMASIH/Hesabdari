export interface UserEntity {
  id: string;
  email: string;
  hashedPassword: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
