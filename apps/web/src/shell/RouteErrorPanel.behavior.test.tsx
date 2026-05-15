import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n, resetI18nForTests } from '@/i18n/controller';
import { RouteErrorPanel } from './RouteErrorPanel';

afterEach(() => {
  cleanup();
  resetI18nForTests();
});

describe('RouteErrorPanel', () => {
  it('invokes retry when the user activates the button', async () => {
    await initI18n();
    const onRetry = vi.fn();
    render(
      <I18nProvider>
        <RouteErrorPanel message="Failed to load" onRetry={onRetry} />
      </I18nProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
