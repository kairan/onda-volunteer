import type { ComponentType } from 'react';
import { ProtectedAppShell } from './ProtectedAppShell';

export function shellRoute(Page: ComponentType) {
  return function ShellRoutePage() {
    return (
      <ProtectedAppShell>
        <Page />
      </ProtectedAppShell>
    );
  };
}
