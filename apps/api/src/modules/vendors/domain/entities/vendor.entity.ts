export interface VendorEntity {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
