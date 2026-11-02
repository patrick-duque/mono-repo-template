import { createFileRoute } from '@tanstack/react-router';

import { Login } from 'modules/Login';
import { Settings } from 'modules/Settings';
import { AppWrapper } from 'ui/layouts';
import { useProvider } from 'utils/providers/Provider';

const SettingsRoute = () => {
  const isAuthenticated = useProvider((state) => state.isAuthenticated);

  if (!isAuthenticated) return <Login />;

  return (
    <AppWrapper>
      <Settings />
    </AppWrapper>
  );
};

export const Route = createFileRoute('/settings/')({
  component: SettingsRoute,
});
