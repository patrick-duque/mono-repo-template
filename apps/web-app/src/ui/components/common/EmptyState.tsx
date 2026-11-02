import { FC, ReactNode } from 'react';

import { cn } from 'utils/helpers';

import Card from './Card';

interface PROPS {
  description: string;
  icon: ReactNode;
  title: string;
  className?: string;
  descriptionClassName?: string;
  iconClassName?: string;
  titleClassName?: string;
}

const EmptyState: FC<PROPS> = ({
  className,
  description,
  descriptionClassName,
  icon,
  iconClassName,
  title,
  titleClassName,
}) => (
  <Card
    className={cn(
      'flex min-h-[190px] w-full flex-col items-center justify-center',
      'rounded-md border-separator-primary bg-card-primary p-8 text-center',
      'shadow-sm',
      className,
    )}
  >
    <div
      className={cn(
        'mb-4 flex h-12 w-12 items-center justify-center',
        'rounded-md bg-primary-base/10 text-primary-base',
        iconClassName,
      )}
    >
      {icon}
    </div>
    <h3
      className={cn(
        'oswald text-xl font-black uppercase text-content/70',
        titleClassName,
      )}
    >
      {title}
    </h3>
    <p
      className={cn(
        'mt-2 max-w-sm text-sm font-medium leading-6 text-content/50',
        descriptionClassName,
      )}
    >
      {description}
    </p>
  </Card>
);

export default EmptyState;
