import type { ComponentType } from 'react';
import { ProtectedAppShell } from './ProtectedAppShell';

export function shellPage(Page: ComponentType) {
  return function ShellPage() {
    return (
      <ProtectedAppShell>
        <Page />
      </ProtectedAppShell>
    );
  };
}
