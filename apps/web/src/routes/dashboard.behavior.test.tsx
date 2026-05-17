import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { DashboardPage } from './dashboard';

describe('DashboardPage', () => {
  it('renders HOPE visual structure around the dashboard copy', async () => {
    await initI18n();

    render(
      <I18nProvider>
        <DashboardPage />
      </I18nProvider>,
    );

    const heading = screen.getByRole('heading', { name: 'Painel' });
    expect(heading.className).toContain('bg-primary');
    expect(heading.className).toContain('border-2');

    const hero = heading.closest('div');
    expect(hero?.className).toContain('border-2');
    expect(hero?.className).toContain('bg-surface');
    expect(hero?.className).toContain('shadow-[8px_8px_0_0_hsl(var(--border))]');

    const stats = screen.getByText('Ministérios').closest('div');
    expect(stats?.className).toContain('border-2');
    expect(stats?.className).toContain('divide-x-2');
  });
});
