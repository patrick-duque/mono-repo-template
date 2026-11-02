import { createFileRoute } from '@tanstack/react-router';

import { Account } from 'modules/Account';
import { Login } from 'modules/Login';
import { AppWrapper } from 'ui/layouts';
import { useProvider } from 'utils/providers/Provider';

const AccountsRoute = () => {
  const isAuthenticated = useProvider((state) => state.isAuthenticated);

  if (!isAuthenticated) return <Login />;

  return (
    <AppWrapper>
      <Account />
    </AppWrapper>
  );
};

export const Route = createFileRoute('/accounts/')({
  component: AccountsRoute,
});
