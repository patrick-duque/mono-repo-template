import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import queryClient from 'utils/hooks/queryClient';
import { SessionProvider } from 'utils/providers';

const RootLayout = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </SessionProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;
