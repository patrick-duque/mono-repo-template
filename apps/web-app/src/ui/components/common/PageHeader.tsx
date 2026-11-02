import { FC, ReactNode } from 'react';

import { cn } from 'utils/helpers';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const PageHeader: FC<PageHeaderProps> = ({
  title,
  description,
  action,
  className,
}) => (
  <header
    className={cn(
      'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
      className,
    )}
  >
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold text-title">{title}</h1>
      {description && <p className="text-sm text-content">{description}</p>}
    </div>

    {action && <div className="w-fit shrink-0">{action}</div>}
  </header>
);

export default PageHeader;
