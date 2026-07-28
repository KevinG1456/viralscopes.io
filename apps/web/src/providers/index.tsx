import * as React from 'react';

import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';
import { ToastProvider } from './ToastProvider';

export function Providers({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
