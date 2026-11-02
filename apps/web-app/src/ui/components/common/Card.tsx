import { FC, PropsWithChildren } from 'react';

import { cn } from 'utils/helpers';

interface PROPS extends PropsWithChildren {
  className?: string;
}

const Card: FC<PROPS> = ({ className, children }) => (
  <div
    className={cn(
      'border',
      'border-separator-quarternary',
      'bg-card-primary',
      'p-8',
      className,
    )}
  >
    {children}
  </div>
);

export default Card;
