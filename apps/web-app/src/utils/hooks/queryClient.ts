import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      staleTime: 60 * 1000,
      refetchInterval: 60 * 1000,
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});
