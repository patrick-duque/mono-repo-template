import { FC } from 'react';

import { Link } from '@tanstack/react-router';
import {
  HiOutlineExclamationCircle,
  HiOutlineHome,
} from 'react-icons/hi';

import { AppWrapper } from 'ui/layouts';
import { cn } from 'utils/helpers';
import { useProvider } from 'utils/providers/Provider';

const homeLinkClasses = [
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full',
  'bg-primary-base px-6 py-3 text-sm font-semibold text-fill-primary shadow-sm',
  'transition-colors hover:bg-primary-light',
  'focus-visible:outline focus-visible:outline-2',
  'focus-visible:outline-offset-2 focus-visible:outline-primary-dark',
].join(' ');

const NotFoundContent: FC<{ isFramed?: boolean }> = ({ isFramed = false }) => (
  <section
    className={cn(
      'flex min-h-[calc(100vh-48px)] items-center justify-center px-4 py-10',
      isFramed && 'min-h-[calc(100vh-144px)] px-0 py-6',
    )}
  >
    <div
      className={cn(
        'relative w-full max-w-2xl rounded-xl',
        'border border-separator-primary bg-card-primary p-6 text-center',
        'shadow-[0_20px_60px_rgb(0_0_0_/_0.10)] sm:p-10',
      )}
    >
      <div
        className={cn(
          'mx-auto flex h-14 w-14 items-center justify-center rounded-md',
          'bg-primary-base/10 text-primary-base',
        )}
      >
        <HiOutlineExclamationCircle className="h-8 w-8" />
      </div>

      <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-primary-base">
        404
      </p>
      <h1 className="oswald mt-3 text-4xl font-bold uppercase text-title sm:text-5xl">
        Page not found
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-content sm:text-base">
        The page may have moved, been archived, or never existed in this
        workspace.
      </p>

      <div className="mt-8 flex justify-center">
        <Link className={homeLinkClasses} to="/">
          <HiOutlineHome className="h-5 w-5" />
          <span>Back to home</span>
        </Link>
      </div>
    </div>
  </section>
);

const NotFound: FC = () => {
  const isAuthenticated = useProvider((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return (
      <AppWrapper>
        <NotFoundContent isFramed />
      </AppWrapper>
    );
  }

  return (
    <main className="min-h-screen bg-card-secondary text-title">
      <NotFoundContent />
    </main>
  );
};

export default NotFound;
