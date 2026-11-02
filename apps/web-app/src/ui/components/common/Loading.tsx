import { FC } from 'react';

import { ImSpinner9 } from 'react-icons/im';

import { cn } from 'utils/helpers';

interface LoadingProps {
  className?: string;
}

const Loading: FC<LoadingProps> = ({ className }) => (
  <div
    className={cn(
      'content-height-full',
      'flex',
      'items-center',
      'justify-center',
      'animate-spin',
      'text-primary-base',
      'text-5xl',
      className,
    )}
  >
    <ImSpinner9 />
  </div>
);

export default Loading;
