import { FC, PropsWithChildren, useState } from 'react';

import { Header, Navbar } from '../partials';

const getDefaultNavbarVisibility = () => {
  if (typeof window === 'undefined') return true;

  return window.matchMedia('(min-width: 768px)').matches;
};

const AppWrapper: FC<PropsWithChildren> = ({ children }) => {
  const [isNavbarVisible, setNavbarVisible] = useState(
    getDefaultNavbarVisibility,
  );

  const toggleNavbar = () => {
    setNavbarVisible((isVisible) => !isVisible);
  };

  return (
    <div className="flex min-h-screen bg-card-secondary text-title">
      <Navbar isVisible={isNavbarVisible} onToggleNavbar={toggleNavbar} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
};

export default AppWrapper;
