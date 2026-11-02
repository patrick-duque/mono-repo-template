import { createFileRoute } from '@tanstack/react-router';

import { Dashboard } from 'modules/Dashboard';
import { Login } from 'modules/Login';
import { AppWrapper } from 'ui/layouts';
import { useProvider } from 'utils/providers/Provider';

const HomeRoute = () => {
  const isAuthenticated = useProvider((state) => state.isAuthenticated);

  if (!isAuthenticated) return <Login />;

  return (
    <AppWrapper>
      <Dashboard />
    </AppWrapper>
  );
};

export const Route = createFileRoute('/')({
  component: HomeRoute,
});
