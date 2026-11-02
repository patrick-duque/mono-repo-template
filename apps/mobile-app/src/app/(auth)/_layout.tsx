import { Redirect, Stack } from 'expo-router';

import { useSession } from 'utils/providers';

const AuthLayout = () => {
  const { isLoading, isSignedIn } = useSession();

  if (isLoading) return null;
  if (isSignedIn) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default AuthLayout;
