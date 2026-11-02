import { FC, PropsWithChildren } from 'react';

import { cn } from 'utils/helpers';

interface PROPS extends PropsWithChildren {
  className?: string;
}

const Container: FC<PROPS> = ({ className, children }) => (
  <div
    className={cn(
      'w-full max-w-[700px] lg:max-w-[1330px]',
      'mx-auto',
      'px-5 sm:px-8 lg:px-10',
      className,
    )}
  >
    {children}
  </div>
);

export default Container;
