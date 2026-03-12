import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-fg',
        secondary: 'border-transparent bg-bg-tertiary text-fg-primary',
        success: 'border-transparent bg-success text-success-fg',
        warning: 'border-transparent bg-warning text-warning-fg',
        danger: 'border-transparent bg-danger text-danger-fg',
        outline: 'text-fg-primary border-border-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
