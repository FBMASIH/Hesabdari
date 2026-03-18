'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema, type LoginDto, type RegisterDto } from '@hesabdari/contracts';
import { ApiError } from '@hesabdari/api-client';
import {
  Button,
  Input,
  PasswordInput,
  Checkbox,
  FormField,
  FormLabel,
  FormErrorBanner,
  cn,
  IconLetter,
  IconEye,
  IconEyeClosed,
  IconUser,
  IconStar,
} from '@hesabdari/ui';
import { useAuthStore } from '@/shared/hooks/use-auth';
import { apiClient } from '@/shared/lib/api';
import { t } from '@/shared/lib/i18n';
import { useAppToast } from '@/providers/toast-provider';
import { AuthTabs } from './auth-tabs';
import { AuthDivider } from './auth-divider';

export type AuthMode = 'sign-in' | 'sign-up';

function PasswordToggle(visible: boolean, toggle: () => void) {
  return (
    <span className="auth-input-icon auth-input-icon-ltr">
      <button
        type="button"
        onClick={toggle}
        aria-label={visible ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
        className="flex h-4 w-4 items-center justify-center text-current hover:opacity-80"
      >
        {visible ? <IconEyeClosed size={16} /> : <IconEye size={16} />}
      </button>
    </span>
  );
}

const AUTH_INPUT = 'auth-input h-[42px] rounded-xl px-3.5 text-[13px]';
const AUTH_INPUT_LTR = `${AUTH_INPUT} text-left`;
const AUTH_BTN = 'auth-submit-btn h-[42px] w-full rounded-full text-[14px] font-semibold';
const AUTH_SOCIAL = 'auth-social-btn flex h-[42px] w-full items-center justify-center gap-2 rounded-full text-[13px] font-medium transition-all active:scale-[0.98]';

export function AuthForm() {
  const auth = t('auth');
  const messages = t('messages');
  const { setTokens, setOrganizationId } = useAuthStore();
  const { showToast } = useAppToast();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [formError, setFormError] = useState<string | null>(null);

  // Security: strip only sensitive credentials from the URL, preserve others (email, redirect, etc.)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sensitive = ['password', 'token', 'secret', 'access_token', 'refresh_token', 'jwt', 'credential'];
    let changed = false;
    sensitive.forEach((p) => { if (params.has(p)) { params.delete(p); changed = true; } });
    if (changed) {
      const clean = params.toString();
      window.history.replaceState(null, '', window.location.pathname + (clean ? `?${clean}` : ''));
    }
  }, []);

  const loginForm = useForm<LoginDto>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterDto>({ resolver: zodResolver(registerSchema) });

  const isSubmitting =
    mode === 'sign-in' ? loginForm.formState.isSubmitting : registerForm.formState.isSubmitting;

  const handleLogin = async (data: LoginDto) => {
    setFormError(null);
    try {
      const result = await apiClient.post<{ accessToken: string; refreshToken: string }>(
        '/api/v1/auth/login',
        data,
      );
      setTokens(result.accessToken, result.refreshToken);
      showToast({ title: auth.loginSuccess, variant: 'success' });
      try {
        const profile = await apiClient.get<{
          id: string;
          organizations: { id: string; name: string }[];
        }>('/api/v1/auth/profile');
        if (profile.organizations.length > 0) {
          setOrganizationId(profile.organizations[0]?.id ?? '');
        }
      } catch {
        // Non-blocking: OrgSelector will retry on dashboard mount
      }
      window.location.href = '/';
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setFormError(auth.invalidCredentials);
      } else {
        setFormError(messages.networkError);
      }
    }
  };

  const handleRegister = async (data: RegisterDto) => {
    setFormError(null);
    try {
      await apiClient.post('/api/v1/auth/register', data);
      showToast({ title: auth.signUpSuccess, variant: 'success' });
      setMode('sign-in');
      loginForm.setValue('email', data.email);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFormError(auth.emailExists);
      } else {
        setFormError(messages.networkError);
      }
    }
  };

  const handleModeChange = (newMode: AuthMode) => {
    setFormError(null);
    setMode(newMode);
  };

  return (
    <div className="auth-form-panel flex h-full flex-col justify-center px-8 py-8 sm:px-10 sm:py-10">
      <div className="mb-6 flex items-center gap-2.5">
        <div className="auth-brand-icon flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand-deep text-fg-inverse">
          <IconStar size={18} />
        </div>
        <span className="text-[15px] font-bold tracking-tight text-fg-primary">
          {t('common').appName}
        </span>
      </div>

      <h1 className="text-[22px] font-extrabold leading-tight text-fg-primary">
        {mode === 'sign-in' ? auth.welcomeBack : auth.welcomeNew}
      </h1>
      <p className="mt-1 text-[13px] text-fg-secondary">
        {mode === 'sign-in' ? auth.welcomeBackSubtitle : auth.welcomeNewSubtitle}
      </p>

      <div className="mt-5">
        <AuthTabs mode={mode} onModeChange={handleModeChange} />
      </div>

      {formError && <FormErrorBanner message={formError} className="mt-4" />}

      {mode === 'sign-in' && (
        <form method="post" noValidate onSubmit={loginForm.handleSubmit(handleLogin)} className="mt-5 space-y-4">
          <FormField error={loginForm.formState.errors.email?.message}>
            <FormLabel htmlFor="login-email" className="mb-1.5 text-[12px]">
              {auth.email}
            </FormLabel>
            <div className="auth-input-wrapper">
              <Input
                id="login-email"
                type="email"
                dir="ltr"
                placeholder={auth.emailPlaceholder}
                autoComplete="email"
                className={AUTH_INPUT_LTR}
                {...loginForm.register('email')}
              />
              <span className="auth-input-icon auth-input-icon-ltr"><IconLetter size={16} /></span>
            </div>
          </FormField>

          <FormField error={loginForm.formState.errors.password?.message}>
            <FormLabel htmlFor="login-password" className="mb-1.5 text-[12px]">
              {auth.password}
            </FormLabel>
            <div className="auth-input-wrapper">
              <PasswordInput
                id="login-password"
                dir="ltr"
                placeholder={auth.passwordPlaceholder}
                autoComplete="current-password"
                className={AUTH_INPUT_LTR}
                renderToggle={PasswordToggle}
                {...loginForm.register('password')}
              />
            </div>
          </FormField>

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer select-none items-center gap-2">
              <Checkbox className="h-4 w-4 rounded-full data-[state=checked]:bg-brand-deep" />
              <span className="text-[12px] text-fg-secondary">{auth.rememberMe}</span>
            </label>
            <button
              type="button"
              className="text-[12px] font-semibold text-brand-deep hover:underline"
              onClick={() => showToast({ title: auth.passwordResetMessage, variant: 'default' })}
            >
              {auth.forgotPassword}
            </button>
          </div>

          <Button type="submit" size="lg" className={AUTH_BTN} disabled={isSubmitting}>
            {isSubmitting ? auth.signingIn : auth.signIn}
          </Button>
        </form>
      )}

      {mode === 'sign-up' && (
        <form method="post" noValidate onSubmit={registerForm.handleSubmit(handleRegister)} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField error={registerForm.formState.errors.firstName?.message}>
              <FormLabel htmlFor="reg-firstName" className="mb-1.5 text-[12px]">{auth.firstName}</FormLabel>
              <div className="auth-input-wrapper">
                <Input id="reg-firstName" placeholder={auth.firstNamePlaceholder} autoComplete="given-name" className={AUTH_INPUT} {...registerForm.register('firstName')} />
                <span className="auth-input-icon"><IconUser size={16} /></span>
              </div>
            </FormField>
            <FormField error={registerForm.formState.errors.lastName?.message}>
              <FormLabel htmlFor="reg-lastName" className="mb-1.5 text-[12px]">{auth.lastName}</FormLabel>
              <div className="auth-input-wrapper">
                <Input id="reg-lastName" placeholder={auth.lastNamePlaceholder} autoComplete="family-name" className={AUTH_INPUT} {...registerForm.register('lastName')} />
                <span className="auth-input-icon"><IconUser size={16} /></span>
              </div>
            </FormField>
          </div>

          <FormField error={registerForm.formState.errors.email?.message}>
            <FormLabel htmlFor="reg-email" className="mb-1.5 text-[12px]">{auth.email}</FormLabel>
            <div className="auth-input-wrapper">
              <Input id="reg-email" type="email" dir="ltr" placeholder={auth.emailPlaceholder} autoComplete="email" className={AUTH_INPUT_LTR} {...registerForm.register('email')} />
              <span className="auth-input-icon auth-input-icon-ltr"><IconLetter size={16} /></span>
            </div>
          </FormField>

          <FormField error={registerForm.formState.errors.password?.message}>
            <FormLabel htmlFor="reg-password" className="mb-1.5 text-[12px]">{auth.password}</FormLabel>
            <div className="auth-input-wrapper">
              <PasswordInput
                id="reg-password"
                dir="ltr"
                placeholder={auth.passwordPlaceholder}
                autoComplete="new-password"
                className={AUTH_INPUT_LTR}
                renderToggle={PasswordToggle}
                {...registerForm.register('password')}
              />
            </div>
          </FormField>

          <Button type="submit" size="lg" className={AUTH_BTN} disabled={isSubmitting}>
            {isSubmitting ? auth.signingUp : auth.signUp}
          </Button>
        </form>
      )}

      <AuthDivider label={auth.orContinueWith} />

      <div className="mt-4 space-y-2.5">
        <button type="button" className={cn(AUTH_SOCIAL, 'bg-bg-inverse text-fg-inverse hover:opacity-90')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 16.97 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" /></svg>
          {auth.signInWithApple}
        </button>
        <button type="button" className={cn(AUTH_SOCIAL, 'border border-border-primary bg-bg-secondary text-fg-primary hover:bg-bg-tertiary')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4" /><path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.14 18.63 6.71 16.69 5.84 14.09H2.18V16.94C3.99 20.53 7.7 23 12 23Z" fill="#34A853" /><path d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.06H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.94L5.84 14.09Z" fill="#FBBC05" /><path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.7 1 3.99 3.47 2.18 7.06L5.84 9.91C6.71 7.31 9.14 5.38 12 5.38Z" fill="#EA4335" /></svg>
          {auth.signInWithGoogle}
        </button>
      </div>
    </div>
  );
}
