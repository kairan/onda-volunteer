import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { WorkingContextPicker } from '@/shell/WorkingContextPicker';

const dualRoleOptions = [
  {
    ministryId: 'min-louvor',
    mode: 'leader' as const,
    ministryName: 'Louvor',
  },
  {
    ministryId: 'min-kids',
    mode: 'volunteer' as const,
    ministryName: 'Kids',
  },
];

afterEach(() => {
  cleanup();
});

describe('WorkingContextPicker', () => {
  it('renders ministry · mode labels in pt-BR', async () => {
    await initI18n(undefined, 'pt-BR');

    render(
      <I18nProvider>
        <WorkingContextPicker
          options={dualRoleOptions}
          value={dualRoleOptions[0]!}
          onChange={() => {}}
        />
      </I18nProvider>,
    );

    const select = await screen.findByLabelText('Atuar como');
    expect(select).toHaveTextContent('Louvor · Líder');
    expect(select).toHaveTextContent('Kids · Voluntário');
  });
});
