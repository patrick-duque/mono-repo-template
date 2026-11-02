import { FC } from 'react';

import { HiOutlineBell } from 'react-icons/hi';

import { cn } from 'utils/helpers';

const Header: FC = () => (
  <header
    className={cn(
      'sticky top-0 z-50 md:z-30',
      'bg-card-primary text-title',
      'border-b border-separator-primary',
    )}
  >
    <div
      className={cn(
        'w-full px-4 lg:px-6 py-3',
        'flex items-center justify-end gap-2',
      )}
    >
      <button
        type="button"
        aria-label="Notifications"
        className={cn(
          'grid h-11 w-11 cursor-pointer place-items-center rounded-md',
          'text-content hover:text-title hover:bg-card-tertiary transition-colors',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-warning-dark',
        )}
      >
        <HiOutlineBell className="w-5 h-5" />
      </button>
    </div>
  </header>
);

export default Header;
