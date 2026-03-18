import { t } from '@/shared/lib/i18n';

/** Animated decoration panel for the auth layout sidebar */
export function AuthDecoration() {
  const auth = t('auth');

  return (
    <div className="auth-decoration relative hidden h-full overflow-hidden lg:block">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--deco-base)] via-[var(--deco-deep)] to-[var(--deco-base)]" />

      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />
      <div className="auth-blob auth-blob-4" />

      <div
        className="absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: 'color-mix(in srgb, var(--color-bg-secondary) 8%, transparent)' }}
      />

      <div
        className="absolute inset-x-6 bottom-6 rounded-2xl px-6 py-4 backdrop-blur-xl"
        style={{
          background: 'color-mix(in srgb, var(--color-bg-secondary) 6%, transparent)',
          border: '1px solid color-mix(in srgb, var(--color-bg-secondary) 10%, transparent)',
        }}
      >
        <p
          className="text-center text-[12px] leading-relaxed opacity-60"
          style={{ color: 'var(--color-fg-inverse)' }}
        >
          {auth.copyright}
        </p>
      </div>
    </div>
  );
}
