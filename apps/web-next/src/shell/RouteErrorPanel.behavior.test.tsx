import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { RouteErrorPanel } from './RouteErrorPanel';

afterEach(() => {
  cleanup();
});

beforeEach(async () => {
  await initI18n(undefined, 'en');
});

describe('RouteErrorPanel', () => {
  it('renders the message and calls onRetry', async () => {
    const onRetry = vi.fn();

    render(
      <I18nProvider>
        <RouteErrorPanel message="Something failed" onRetry={onRetry} />
      </I18nProvider>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something failed');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
