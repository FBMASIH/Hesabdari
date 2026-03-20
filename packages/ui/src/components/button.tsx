import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * macOS-style button system.
 *
 * Variants:
 *   default      — Brand blue filled. Primary CTA. One per section max.
 *   secondary    — Subtle gray filled. Supporting actions in forms/headers.
 *   outline      — Visible border, transparent bg. Secondary form actions.
 *   ghost        — No chrome at rest, bg on hover. Nav/toolbar icons.
 *   destructive  — Red filled. Dangerous confirm dialogs.
 *   danger       — Red-tinted capsule. Inline delete/cancel in tables.
 *   link         — Underline text link.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-[13px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-deep/25 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default:
          'bg-brand-deep text-primary-fg shadow-brand-glow hover:shadow-brand-glow-hover hover:brightness-110 active:shadow-pressed active:brightness-95 active:translate-y-px',
        secondary:
          'bg-bg-tertiary text-fg-primary shadow-xs hover:shadow-sm hover:brightness-[0.97] active:shadow-xs active:brightness-95 active:translate-y-px',
        outline:
          'border border-border-primary bg-bg-secondary text-fg-primary shadow-xs hover:bg-bg-tertiary hover:shadow-sm active:shadow-xs active:translate-y-px',
        ghost:
          'text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary active:bg-bg-secondary',
        destructive:
          'bg-danger-default text-danger-fg shadow-danger-glow hover:shadow-danger-glow-hover hover:brightness-110 active:shadow-pressed active:brightness-95 active:translate-y-px',
        danger: 'bg-danger-subtle text-danger-default hover:brightness-[0.97] active:brightness-95',
        link: 'text-brand-deep underline-offset-4 hover:underline',
      },
      size: {
        xs: 'h-[24px] px-2.5 text-2xs rounded-lg gap-1',
        sm: 'h-[28px] px-3 text-[12px] gap-1.5',
        md: 'h-[32px] px-4 gap-2',
        lg: 'h-[36px] px-5 text-[14px] gap-2',
        icon: 'h-[32px] w-[32px]',
        'icon-sm': 'h-[24px] w-[24px] rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';
