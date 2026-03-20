export interface CustomerEntity {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  referrer: string | null;
  title: string | null;
  phone1: string | null;
  phone2: string | null;
  phone3: string | null;
  address: string | null;
  creditLimit: bigint;
  nationalId: string | null;
  economicCode: string | null;
  postalCode: string | null;
  bankAccount1: string | null;
  bankAccount2: string | null;
  bankAccount3: string | null;
  birthDate: Date | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
