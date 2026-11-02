import { FC } from 'react';

import { Skeleton } from 'ui/components/common';
import { Container } from 'ui/layouts';
import { cn } from 'utils/helpers';

const cardClasses = cn(
  'rounded-xl border border-separator-primary bg-card-primary p-5',
  'shadow-sm',
);

const AccountSkeleton: FC = () => (
  <Container className="flex flex-col gap-6">
    <div className="sr-only" role="status">
      Loading account
    </div>

    <div
      aria-hidden="true"
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-5 w-64 max-w-full" />
      </div>
      <Skeleton className="h-10 w-24 shrink-0" />
    </div>

    <section aria-hidden="true" className={cardClasses}>
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <Skeleton className="h-7 w-56 max-w-full" />
              <div className="flex min-w-0 items-center gap-2">
                <Skeleton className="h-4 w-4 shrink-0 rounded" />
                <Skeleton className="h-5 w-72 max-w-full" />
              </div>
            </div>
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </section>

    <section aria-hidden="true" className={cardClasses}>
      <Skeleton className="h-6 w-32" />
      <div className="pt-5">
        <div
          className={cn(
            'grid gap-6',
            'md:grid-cols-[minmax(16rem,24rem)_minmax(0,1fr)]',
            'md:items-start',
          )}
        >
          <div className="space-y-2.5">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-44 w-full rounded" />
          </div>

          <div className="min-w-0 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2.5">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-11 w-full rounded-[6px]" />
              </div>
              <div className="space-y-2.5">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-11 w-full rounded-[6px]" />
              </div>
            </div>

            <div className="space-y-2.5">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-11 w-full rounded-[6px]" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section aria-hidden="true" className={cardClasses}>
      <Skeleton className="h-6 w-36" />
      <div className="pt-5">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2.5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-11 w-full rounded-[6px]" />
            </div>
          ))}
        </div>
      </div>
    </section>

    <section aria-hidden="true" className={cardClasses}>
      <Skeleton className="h-6 w-20" />
      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="min-w-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-5 w-40 max-w-full" />
          </div>
        ))}
      </dl>
    </section>
  </Container>
);

export default AccountSkeleton;
