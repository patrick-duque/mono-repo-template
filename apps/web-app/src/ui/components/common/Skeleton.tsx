import { HTMLAttributes, forwardRef } from 'react';

import { cn } from 'utils/helpers';

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'animate-pulse rounded-md bg-card-tertiary',
        'after:block after:h-full after:w-full',
        className,
      )}
      {...props}
    />
  ),
);

Skeleton.displayName = 'Skeleton';

export default Skeleton;
