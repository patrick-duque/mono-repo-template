import { createRouter } from '@tanstack/react-router';

import { queryClient } from 'utils/hooks/queryClient';

import { routeTree } from './routeTree.gen';

export const router = createRouter({
  context: { queryClient },
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
