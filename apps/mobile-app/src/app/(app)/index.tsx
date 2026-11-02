import { Stack } from 'expo-router';

import { Dashboard } from 'modules/Dashboard';

const DashboardRoute = () => (
  <>
    <Stack.Screen options={{ title: 'Dashboard' }} />
    <Dashboard />
  </>
);

export default DashboardRoute;
