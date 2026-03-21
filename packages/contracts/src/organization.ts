import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  defaultCurrencyId: z.string().uuid(),
});

export const updateOrganizationSchema = createOrganizationSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateOrganizationDto = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationDto = z.infer<typeof updateOrganizationSchema>;
