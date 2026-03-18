import { cn } from '../lib/utils';

export interface SpinnerProps {
  /** Size of the spinner. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Accessible label. Defaults to 'در حال بارگذاری'. */
  label?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
} as const;

export function Spinner({ size = 'md', className, label = 'در حال بارگذاری' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'animate-spin rounded-full border-border-primary border-t-brand-deep',
        sizeClasses[size],
        className,
      )}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}
