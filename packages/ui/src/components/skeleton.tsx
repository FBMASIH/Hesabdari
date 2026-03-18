import type { HTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Render as a circle (avatar placeholder). */
  circle?: boolean;
}

export function Skeleton({ className, circle, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-bg-tertiary',
        circle ? 'rounded-full' : 'rounded-md',
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
