import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { AuthSessionProvider } from '@/auth/AuthSessionProvider';
import { ToastProvider } from '@/feedback/ToastHost';
import { I18nProvider } from '@/i18n/I18nProvider';
import { QueryProvider } from '@/query/QueryProvider';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import { router } from '@/router';
import '@/styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <QueryProvider>
        <AuthSessionProvider>
          <LocalTimeProvider>
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </LocalTimeProvider>
        </AuthSessionProvider>
      </QueryProvider>
    </I18nProvider>
  </StrictMode>,
);
