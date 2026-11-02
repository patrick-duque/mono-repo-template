import { StrictMode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';

import './assets/styles/index.css';

import { queryClient } from 'utils/hooks/queryClient';
import Provider from 'utils/providers/Provider';
import { Modal } from 'ui/partials';

import { router } from './router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider>
        <Modal>
          <RouterProvider router={router} />
        </Modal>
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
);
