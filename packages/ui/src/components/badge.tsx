import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/** macOS-style badges — small capsules with tinted backgrounds */
const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-medium leading-tight',
  {
    variants: {
      variant: {
        default: 'bg-brand-deep text-primary-fg',
        secondary: 'bg-bg-tertiary text-fg-secondary',
        success: 'bg-success-subtle text-success-default',
        warning: 'bg-warning-subtle text-warning-default',
        danger: 'bg-danger-subtle text-danger-default',
        outline: 'border-[0.5px] border-border-primary text-fg-secondary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  ),
);
Badge.displayName = 'Badge';
