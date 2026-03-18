import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
