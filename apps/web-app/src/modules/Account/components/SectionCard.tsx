import { FC, ReactNode } from 'react';

import { cn } from 'utils/helpers';

interface SectionCardProps {
  children: ReactNode;
  title: string;
}

const SectionCard: FC<SectionCardProps> = ({ children, title }) => (
  <section
    className={cn(
      'rounded-xl border border-separator-primary bg-card-primary p-5',
      'shadow-sm',
    )}
  >
    <h2 className="text-base font-semibold text-title">{title}</h2>
    <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
      {children}
    </dl>
  </section>
);

export default SectionCard;
