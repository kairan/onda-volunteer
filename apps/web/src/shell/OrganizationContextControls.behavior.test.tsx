import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n, resetI18nForTests } from '@/i18n/controller';
import { DEMO_CHURCHES } from '@/organization/demoOrganizations';
import { OrganizationContextControls } from './OrganizationContextControls';

afterEach(() => {
  cleanup();
  resetI18nForTests();
});

describe('OrganizationContextControls', () => {
  it('calls onChurchChange when a church is selected', async () => {
    await initI18n();
    const onChurchChange = vi.fn();
    render(
      <I18nProvider>
        <OrganizationContextControls
          churches={DEMO_CHURCHES}
          activeChurchId="church-a"
          activeCampusId="campus-a1"
          onChurchChange={onChurchChange}
          onCampusChange={() => {}}
        />
      </I18nProvider>,
    );

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /igreja/i }),
      'church-b',
    );
    expect(onChurchChange).toHaveBeenCalledWith('church-b');
  });

  it('shows campus selector only when the church has multiple campuses', async () => {
    await initI18n();
    const { rerender } = render(
      <I18nProvider>
        <OrganizationContextControls
          churches={DEMO_CHURCHES}
          activeChurchId="church-b"
          activeCampusId="campus-b1"
          onChurchChange={() => {}}
          onCampusChange={() => {}}
        />
      </I18nProvider>,
    );
    expect(screen.queryByRole('combobox', { name: /campus/i })).not.toBeInTheDocument();

    rerender(
      <I18nProvider>
        <OrganizationContextControls
          churches={DEMO_CHURCHES}
          activeChurchId="church-a"
          activeCampusId="campus-a1"
          onChurchChange={() => {}}
          onCampusChange={() => {}}
        />
      </I18nProvider>,
    );
    expect(screen.getByRole('combobox', { name: /campus/i })).toBeInTheDocument();
  });
});
