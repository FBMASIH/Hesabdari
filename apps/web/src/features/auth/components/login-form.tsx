'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginDto } from '@hesabdari/contracts';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  FormField,
  FormLabel,
} from '@hesabdari/ui';
import { useAuthStore } from '@/shared/hooks/use-auth';
import { apiClient } from '@/shared/lib/api';
import { t } from '@/shared/lib/i18n';

export function LoginForm() {
  const auth = t('auth');
  const { setTokens } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginDto) => {
    try {
      const result = await apiClient.post<{ accessToken: string; refreshToken: string }>(
        '/api/v1/auth/login',
        data,
      );
      setTokens(result.accessToken, result.refreshToken);
      window.location.href = '/';
    } catch {
      // Error handling will be added with toast notifications
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{auth.signInTitle}</CardTitle>
        <CardDescription>{auth.signInDescription}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <FormField error={errors.email?.message}>
            <FormLabel htmlFor="email">{auth.email}</FormLabel>
            <Input
              id="email"
              type="email"
              placeholder={auth.emailPlaceholder}
              className="ltr-text"
              dir="ltr"
              {...register('email')}
            />
          </FormField>
          <FormField error={errors.password?.message}>
            <FormLabel htmlFor="password">{auth.password}</FormLabel>
            <Input
              id="password"
              type="password"
              placeholder={auth.passwordPlaceholder}
              className="ltr-text"
              dir="ltr"
              {...register('password')}
            />
          </FormField>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? auth.signingIn : auth.signIn}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
