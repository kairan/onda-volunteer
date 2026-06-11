import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AuthSessionContext,
  authSessionContextFixture,
} from '@/auth/AuthSessionProvider';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { OrganizationContextProvider } from '@/organization/OrganizationContextProvider';
import * as fetchOrgContext from '@/organization/fetchOrganizationContext';
import * as fetchRoles from '@/organization/fetchMinistryRoles';
import * as ministryArchive from '@/organization/ministryArchive';
import { OrganizationContextControls } from '@/shell/OrganizationContextControls';
import { LocalTimeProvider } from '@/settings/LocalTimeProvider';
import { MinistriesPage } from '@/routes/ministries';

vi.mock('@/organization/fetchOrganizationContext');
vi.mock('@/organization/fetchMinistryRoles');
vi.mock('@/organization/ministryStructure', () => ({
  createMinistry: vi.fn(),
  renameMinistry: vi.fn(),
}));
vi.mock('@/organization/ministryArchive', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/organization/ministryArchive')>();
  return {
    ...actual,
    archiveMinistry: vi.fn(),
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.spyOn(window, 'confirm').mockRestore();
});

describe('Ministry archive UI', () => {
  const adminId = 'admin-1';
  const churchId = 'church-1';
  const activeId = 'min-active';
  const archivedId = 'min-archived';

  const authState = {
    status: 'authenticated' as const,
    volunteerId: adminId,
    displayName: 'Pat Admin',
    uiLocale: 'en',
    isSystemAdmin: false,
    newlyFulfilledInvites: [],
  };

  const churchContext = {
    churches: [
      {
        id: churchId,
        name: 'Test Church',
        defaultTimezone: 'UTC',
        isAccreditedAdmin: true,
        campuses: [],
        ministries: [
          {
            id: activeId,
            name: 'Greeters',
            isChurchAdmin: true,
          },
          {
            id: archivedId,
            name: 'Kids',
            isChurchAdmin: true,
            archivedAt: '2026-06-06T12:00:00.000Z',
          },
        ],
      },
    ],
  };

  it('archives an active ministry after confirm and refreshes context', async () => {
    const user = userEvent.setup();
    await initI18n(undefined, 'en');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(fetchOrgContext.fetchOrganizationContext)
      .mockResolvedValueOnce(churchContext as never)
      .mockResolvedValueOnce({
        churches: [
          {
            ...churchContext.churches[0],
            ministries: [
              churchContext.churches[0].ministries[0],
              {
                ...churchContext.churches[0].ministries[1],
                archivedAt: '2026-06-06T12:00:00.000Z',
              },
            ],
          },
        ],
      } as never);
    vi.mocked(fetchRoles.fetchMinistryRoles).mockResolvedValue([]);
    vi.mocked(ministryArchive.archiveMinistry).mockResolvedValue({
      id: activeId,
      churchId,
      name: 'Greeters',
      archivedAt: '2026-06-06T12:00:00.000Z',
    });

    render(
      <I18nProvider>
        <AuthSessionContext.Provider value={authSessionContextFixture(authState)}>
          <OrganizationContextProvider enabled={true}>
            <MinistriesPage />
          </OrganizationContextProvider>
        </AuthSessionContext.Provider>
      </I18nProvider>,
    );

    await user.click(
      await screen.findByRole('button', { name: 'Archive ministry' }),
    );

    await waitFor(() => {
      expect(ministryArchive.archiveMinistry).toHaveBeenCalledWith({
        ministryId: activeId,
        actingVolunteerId: adminId,
      });
    });
    expect(fetchOrgContext.fetchOrganizationContext).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Ministry archived.')).toBeInTheDocument();
  });

  it('hides archived ministries from the role catalog picker', async () => {
    await initI18n(undefined, 'en');
    vi.mocked(fetchOrgContext.fetchOrganizationContext).mockResolvedValue(
      churchContext as never,
    );
    vi.mocked(fetchRoles.fetchMinistryRoles).mockResolvedValue([]);

    render(
      <I18nProvider>
        <AuthSessionContext.Provider value={authSessionContextFixture(authState)}>
          <OrganizationContextProvider enabled={true}>
            <MinistriesPage />
          </OrganizationContextProvider>
        </AuthSessionContext.Provider>
      </I18nProvider>,
    );

    const picker = await screen.findByLabelText('Ministry');
    expect(picker).toHaveTextContent('Greeters');
    expect(picker).not.toHaveTextContent('Kids');
  });

  it('shows archived badge in structure list and hides archive from non-admin switcher', async () => {
    await initI18n(undefined, 'en');

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <OrganizationContextControls
            churches={churchContext.churches}
            activeChurchId={churchId}
            activeCampusId={null}
            activeMinistryId={activeId}
            onChurchChange={() => {}}
            onCampusChange={() => {}}
            onMinistryChange={() => {}}
          />
        </LocalTimeProvider>
      </I18nProvider>,
    );

    expect(screen.getByRole('option', { name: 'Greeters' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Kids (archived)' }),
    ).toBeInTheDocument();
  });

  it('hides archived ministries from shell switcher for non-admin viewers', async () => {
    await initI18n(undefined, 'en');
    const leaderContext = {
      churches: [
        {
          ...churchContext.churches[0],
          isAccreditedAdmin: false,
          ministries: [
            {
              id: activeId,
              name: 'Greeters',
              isLeader: true,
            },
            {
              id: archivedId,
              name: 'Kids',
              isLeader: true,
              archivedAt: '2026-06-06T12:00:00.000Z',
            },
          ],
        },
      ],
    };

    render(
      <I18nProvider>
        <LocalTimeProvider>
          <OrganizationContextControls
            churches={leaderContext.churches}
            activeChurchId={churchId}
            activeCampusId={null}
            activeMinistryId={activeId}
            onChurchChange={() => {}}
            onCampusChange={() => {}}
            onMinistryChange={() => {}}
          />
        </LocalTimeProvider>
      </I18nProvider>,
    );

    expect(screen.getByRole('option', { name: 'Greeters' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Kids/ })).not.toBeInTheDocument();
  });
});
