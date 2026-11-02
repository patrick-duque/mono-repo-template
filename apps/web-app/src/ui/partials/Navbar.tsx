import { FC } from 'react';

import { Link, useLocation } from '@tanstack/react-router';
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCog,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineUserCircle,
  HiOutlineViewGrid,
} from 'react-icons/hi';

import { APP_TITLE } from 'utils/constants';
import { cn } from 'utils/helpers';
import { useProvider } from 'utils/providers';

interface NavItem {
  label: string;
  href: string;
  route?: ShippedRoutePath;
  icon: typeof HiOutlineViewGrid;
}

interface NavbarProps {
  isVisible?: boolean;
  onToggleNavbar?: () => void;
}

type ShippedRoutePath = '/' | '/accounts' | '/settings';

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', route: '/', icon: HiOutlineViewGrid },
];

const SECONDARY_NAV_ITEMS: NavItem[] = [
  {
    label: 'Account',
    href: '/accounts',
    route: '/accounts',
    icon: HiOutlineUserCircle,
  },
  {
    label: 'Settings',
    href: '/settings',
    route: '/settings',
    icon: HiOutlineCog,
  },
];

const Navbar: FC<NavbarProps> = ({ isVisible = true, onToggleNavbar }) => {
  const { pathname } = useLocation();
  const theme = useProvider((state) => state.theme);
  const toggleTheme = useProvider((state) => state.toggleTheme);

  const isDarkTheme = theme === 'dark';
  const ToggleIcon = isVisible ? HiOutlineChevronLeft : HiOutlineChevronRight;
  const ThemeIcon = isDarkTheme ? HiOutlineMoon : HiOutlineSun;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const getNavItemClasses = (active: boolean, isLinked: boolean) =>
    cn(
      'flex min-h-11 items-center gap-3 rounded-md py-2',
      'text-left text-sm transition-colors',
      isVisible ? 'px-3' : 'justify-center px-0 md:justify-start md:px-3',
      isLinked &&
        'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-warning-dark',
      active
        ? 'bg-card-tertiary text-title'
        : cn(
            'text-content',
            isLinked && 'hover:bg-card-tertiary hover:text-title',
          ),
    );

  const renderNavItem = ({ label, href, route, icon: Icon }: NavItem) => {
    const active = isActive(href);
    const content = (
      <>
        <Icon className="h-5 w-5 shrink-0" />
        <span className={cn(!isVisible && 'hidden md:inline')}>{label}</span>
      </>
    );

    if (!route) {
      return (
        <span
          key={label}
          aria-disabled="true"
          className={getNavItemClasses(active, false)}
        >
          {content}
        </span>
      );
    }

    return (
      <Link
        key={label}
        to={route}
        className={getNavItemClasses(active, true)}
      >
        {content}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-[60] flex h-screen shrink-0',
        'md:sticky md:top-0 md:z-auto',
        'w-56 md:w-56',
        isVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        'bg-card-primary text-title',
        'border-r border-separator-primary',
        'flex-col overflow-visible md:overflow-hidden',
        'transform-gpu transition-transform duration-300 ease-in-out',
        'will-change-transform motion-reduce:transition-none',
      )}
    >
      <div
        className={cn(
          'relative flex shrink-0 items-center py-4',
          isVisible
            ? 'justify-between px-4'
            : 'justify-center px-3 md:justify-between md:px-4',
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={cn(
              'grid h-8 w-8 shrink-0 grid-cols-2 gap-0.5',
              'rounded-md bg-primary-base p-1.5',
            )}
          >
            <span className="rounded-sm bg-white/90" />
            <span className="rounded-sm bg-white/60" />
            <span className="rounded-sm bg-white/60" />
            <span className="rounded-sm bg-white/90" />
          </div>
          <span
            className={cn(
              'whitespace-nowrap text-sm font-semibold tracking-tight',
              'transition-opacity duration-200',
              isVisible ? 'opacity-100 delay-100' : 'opacity-0 md:opacity-100',
            )}
          >
            {APP_TITLE}
          </span>
        </div>

        {onToggleNavbar && (
          <button
            type="button"
            aria-label={`${isVisible ? 'Collapse' : 'Expand'} navigation`}
            aria-pressed={isVisible}
            onClick={onToggleNavbar}
            className={cn(
              'grid h-9 w-9 cursor-pointer place-items-center rounded-md md:hidden',
              'border border-separator-secondary bg-card-tertiary text-title shadow-sm',
              'hover:border-primary-base hover:bg-primary-base hover:text-fill-primary',
              'active:scale-95',
              'transition-[left,background-color,border-color,color,transform]',
              'duration-300 ease-in-out motion-reduce:transition-none',
              'focus-visible:outline focus-visible:outline-2',
              'focus-visible:outline-warning-dark',
              isVisible ? 'ml-3' : 'absolute left-full top-4 ml-5',
            )}
          >
            <ToggleIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav
        className={cn(
          'flex flex-1 flex-col gap-1 overflow-y-auto',
          'transition-[padding,opacity] duration-200',
          isVisible ? 'px-2 opacity-100 delay-100' : 'px-3 opacity-100 md:px-2',
        )}
      >
        {NAV_ITEMS.map(renderNavItem)}
      </nav>

      <div
        className={cn(
          'shrink-0 border-t border-separator-primary p-2',
          'transition-opacity duration-200',
          isVisible
            ? 'opacity-100 delay-100'
            : 'hidden opacity-0 md:block md:opacity-100',
        )}
      >
        <div className="flex flex-col gap-1">
          {SECONDARY_NAV_ITEMS.map(renderNavItem)}
        </div>
      </div>

      <div
        className={cn(
          'shrink-0 border-t border-separator-primary p-2',
          'transition-opacity duration-200',
          isVisible
            ? 'opacity-100 delay-100'
            : 'hidden opacity-0 md:block md:opacity-100',
        )}
      >
        <button
          type="button"
          aria-label={`Switch to ${isDarkTheme ? 'light' : 'dark'} mode`}
          onClick={toggleTheme}
          className={cn(
            'flex min-h-11 w-full cursor-pointer items-center gap-3',
            'rounded-md py-2 text-sm text-content transition-colors',
            isVisible ? 'px-3' : 'justify-center px-0 md:justify-start md:px-3',
            'hover:bg-card-tertiary hover:text-title',
            'focus-visible:outline focus-visible:outline-2',
            'focus-visible:outline-warning-dark',
          )}
        >
          <ThemeIcon className="h-5 w-5 shrink-0" />
          <span className={cn(!isVisible && 'hidden md:inline')}>
            {isDarkTheme ? 'Dark mode' : 'Light mode'}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
