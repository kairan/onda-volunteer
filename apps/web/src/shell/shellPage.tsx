import type { ComponentType } from 'react';
import { AppShell } from './AppShell';

export function shellPage(Page: ComponentType) {
  return function ShellPage() {
    return (
      <AppShell>
        <Page />
      </AppShell>
    );
  };
}
