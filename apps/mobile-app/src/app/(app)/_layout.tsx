import { Redirect, Stack } from 'expo-router';

import { useSession } from 'utils/providers';

const AppLayout = () => {
  const { isLoading, isSignedIn } = useSession();

  if (isLoading) return null;
  if (!isSignedIn) return <Redirect href="/login" />;

  return <Stack />;
};

export default AppLayout;
