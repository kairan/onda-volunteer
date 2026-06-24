import type { ReactNode } from 'react';
import {
  Link,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
} from '@tanstack/react-router';
import { AuthPanel } from '@/AuthPanel';
import { shellRouteErrorMessage } from '@/api/apiError';
import type { EventDetailPayload } from '@/eventDetailPayload';
import { DashboardPage } from '@/routes/dashboard';
import { prefetchVolunteerDashboardQueries } from '@/volunteer/prefetchVolunteerDashboard';
import { MinistriesPage } from '@/routes/ministries';
import { MinistryLeadersPage } from '@/routes/ministryLeaders';
import { VolunteersPage } from '@/routes/volunteers';
import { SchedulingPage } from '@/routes/scheduling';
import { prefetchLeaderSchedulingQueries } from '@/leader/prefetchLeaderScheduling';
import { fetchEventDetail } from '@/leader/eventDetailQuery';
import { volunteerIdForProtectedRequests } from '@/auth/authSession';
import { ensureLeaderRouteAccess } from '@/leader/ensureLeaderRouteAccess';
import {
  SchedulingEventDetailPending,
  SchedulingEventDetailView,
} from '@/routes/schedulingEventDetail';
import { SchedulingCreateEventPage } from '@/routes/schedulingCreateEvent';
import { TimeAwayPage } from '@/routes/timeAway';
import { LeaderVolunteerTimeAwayPage } from '@/routes/leaderVolunteerTimeAway';
import { SchedulingCreatePrivateEventPage } from '@/routes/schedulingCreatePrivateEvent';
import { RouteErrorPanel } from '@/shell/RouteErrorPanel';
import { ProtectedAppShell } from '@/shell/ProtectedAppShell';
import { shellRoute } from '@/shell/shellRoute';
import { ensureShellRouteAuth } from '@/shell/shellRouteAuth';
import { SystemAdminShell } from '@/system-admin/SystemAdminShell';
import { SystemAdminChurchDetailPage } from '@/system-admin/SystemAdminChurchDetailPage';
import { SystemAdminChurchesPage } from '@/system-admin/SystemAdminChurchesPage';
import { SystemAdminDashboardPage } from '@/system-admin/SystemAdminDashboardPage';
import { SystemAdminSchedulingEventDetailPage } from '@/system-admin/SystemAdminSchedulingEventDetailPage';
import { SystemAdminSchedulingPage } from '@/system-admin/SystemAdminSchedulingPage';
import { SystemAdminUserDetailPage } from '@/system-admin/SystemAdminUserDetailPage';
import { SystemAdminUsersPage } from '@/system-admin/SystemAdminUsersPage';
import { ensureSystemAdminRouteAccess } from '@/system-admin/ensureSystemAdminRouteAccess';
import { UserSelectPage } from '@/routes/userSelect';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const legacyLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'legacy',
  component: function LegacyLayout() {
    return (
      <div className="mx-auto min-h-screen max-w-2xl p-6">
        <AuthPanel variant="legacy" />
        <Outlet />
      </div>
    );
  },
});

const indexRoute = createRoute({
  getParentRoute: () => legacyLayoutRoute,
  path: '/',
  component: function Home() {
    return (
      <main className="flex min-h-[80vh] flex-col justify-center gap-8">
        <section className="rounded-md border border-border bg-surface p-6">
          <p className="mb-3 text-sm font-medium text-primary">Onda Volunteer</p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight">
            Volunteer roster
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            A clear workspace for church teams to coordinate volunteers, ministries,
            and service schedules.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink to="/dashboard">Open dashboard</ButtonLink>
          </div>
        </section>
      </main>
    );
  },
});

function ButtonLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
    >
      {children}
    </Link>
  );
}

export type SchedulingEventDetailLoader = (ctx: {
  params: { eventId: string };
}) => Promise<EventDetailPayload>;

export type BuildRouteTreeOptions = {
  schedulingEventDetailLoader?: SchedulingEventDetailLoader;
};

function shellErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <ProtectedAppShell>
      <RouteErrorPanel message={shellRouteErrorMessage(error)} onRetry={reset} />
    </ProtectedAppShell>
  );
}

const shellBeforeLoad = () => ensureShellRouteAuth();

const userSelectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/user-select',
  component: UserSelectPage,
});

const legacyEventRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events/$eventId',
  component: function LegacyEventRedirect() {
    const { eventId } = legacyEventRedirectRoute.useParams();
    return (
      <Navigate
        to="/scheduling/events/$eventId"
        params={{ eventId }}
        replace
      />
    );
  },
});

function createSchedulingEventDetailRoute(
  schedulingEventDetailLoader: SchedulingEventDetailLoader,
) {
  const schedulingEventDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/scheduling/events/$eventId',
    beforeLoad: shellBeforeLoad,
    loader: ({ params }) => schedulingEventDetailLoader({ params }),
    pendingComponent: shellRoute(SchedulingEventDetailPending),
    component: shellRoute(function SchedulingEventDetailShellPage() {
      const data = schedulingEventDetailRoute.useLoaderData();
      return <SchedulingEventDetailView data={data} />;
    }),
    errorComponent: shellErrorComponent,
  });
  return schedulingEventDetailRoute;
}

const leaderVolunteerTimeAwayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/leader/volunteer-time-away',
  beforeLoad: async () => {
    await ensureShellRouteAuth();
    await ensureLeaderRouteAccess();
  },
  component: shellRoute(() => <LeaderVolunteerTimeAwayPage />),
  errorComponent: shellErrorComponent,
});

const schedulingCreateEventRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scheduling/events/new',
  beforeLoad: shellBeforeLoad,
  component: shellRoute(() => <SchedulingCreateEventPage />),
  errorComponent: shellErrorComponent,
});

const schedulingCreatePrivateEventRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scheduling/events/new-private',
  beforeLoad: shellBeforeLoad,
  component: shellRoute(() => <SchedulingCreatePrivateEventPage />),
  errorComponent: shellErrorComponent,
});

const ministryLeadersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ministry-leaders',
  beforeLoad: shellBeforeLoad,
  component: shellRoute(() => <MinistryLeadersPage />),
  errorComponent: shellErrorComponent,
});

function systemAdminErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-4 py-12">
        <RouteErrorPanel
          message={shellRouteErrorMessage(error)}
          onRetry={reset}
        />
      </div>
    </div>
  );
}

const systemAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/system-admin',
  beforeLoad: () => ensureSystemAdminRouteAccess(),
  component: SystemAdminShell,
  errorComponent: systemAdminErrorComponent,
});

const systemAdminIndexRoute = createRoute({
  getParentRoute: () => systemAdminRoute,
  path: '/',
  component: SystemAdminDashboardPage,
});

const systemAdminChurchDetailRoute = createRoute({
  getParentRoute: () => systemAdminRoute,
  path: '/churches/$churchId',
  component: SystemAdminChurchDetailPage,
});

const systemAdminUsersRoute = createRoute({
  getParentRoute: () => systemAdminRoute,
  path: '/users',
  component: SystemAdminUsersPage,
});

const systemAdminUserDetailRoute = createRoute({
  getParentRoute: () => systemAdminRoute,
  path: '/users/$volunteerId',
  component: SystemAdminUserDetailPage,
});

const systemAdminChurchesRoute = createRoute({
  getParentRoute: () => systemAdminRoute,
  path: '/churches',
  component: SystemAdminChurchesPage,
});

const systemAdminSchedulingRoute = createRoute({
  getParentRoute: () => systemAdminRoute,
  path: '/scheduling',
  component: SystemAdminSchedulingPage,
});

function createSystemAdminSchedulingEventDetailRoute(
  schedulingEventDetailLoader: SchedulingEventDetailLoader,
) {
  const route = createRoute({
    getParentRoute: () => systemAdminRoute,
    path: '/scheduling/events/$eventId',
    loader: ({ params }) => schedulingEventDetailLoader({ params }),
    component: function SystemAdminSchedulingEventDetailRoute() {
      const data = route.useLoaderData();
      return <SystemAdminSchedulingEventDetailPage data={data} />;
    },
  });
  return route;
}

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: shellBeforeLoad,
  loader: () => prefetchVolunteerDashboardQueries(),
  component: shellRoute(() => <DashboardPage />),
  errorComponent: shellErrorComponent,
});

const schedulingHubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scheduling',
  beforeLoad: shellBeforeLoad,
  loader: () => prefetchLeaderSchedulingQueries(),
  validateSearch: (search: Record<string, unknown>) => ({
    previewRole:
      search.previewRole === 'volunteer' || search.previewRole === 'leader'
        ? search.previewRole
        : undefined,
  }),
  component: shellRoute(function SchedulingHubPage() {
    const { previewRole } = schedulingHubRoute.useSearch();
    return <SchedulingPage previewRole={previewRole} />;
  }),
  errorComponent: shellErrorComponent,
});

const ministriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ministries',
  beforeLoad: shellBeforeLoad,
  component: shellRoute(() => <MinistriesPage />),
  errorComponent: shellErrorComponent,
});

const volunteersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/volunteers',
  beforeLoad: shellBeforeLoad,
  component: shellRoute(() => <VolunteersPage />),
  errorComponent: shellErrorComponent,
});

const timeAwayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/time-away',
  beforeLoad: shellBeforeLoad,
  component: shellRoute(() => <TimeAwayPage />),
  errorComponent: shellErrorComponent,
});

const shellRoutes = [
  dashboardRoute,
  schedulingHubRoute,
  ministriesRoute,
  volunteersRoute,
  timeAwayRoute,
];

async function defaultSchedulingEventDetailLoader({
  params,
}: {
  params: { eventId: string };
}): Promise<EventDetailPayload> {
  const volunteerId = volunteerIdForProtectedRequests();
  if (!volunteerId) {
    throw new Error('Sign in required');
  }
  return fetchEventDetail({ eventId: params.eventId, volunteerId });
}

export function buildRouteTree(options: BuildRouteTreeOptions = {}) {
  const schedulingEventDetailLoader =
    options.schedulingEventDetailLoader ?? defaultSchedulingEventDetailLoader;
  const schedulingEventDetailRoute =
    createSchedulingEventDetailRoute(schedulingEventDetailLoader);
  const systemAdminSchedulingEventDetailRoute =
    createSystemAdminSchedulingEventDetailRoute(schedulingEventDetailLoader);
  return rootRoute.addChildren([
    legacyLayoutRoute.addChildren([indexRoute]),
    userSelectRoute,
    legacyEventRedirectRoute,
    schedulingEventDetailRoute,
    schedulingCreateEventRoute,
    schedulingCreatePrivateEventRoute,
    leaderVolunteerTimeAwayRoute,
    ministryLeadersRoute,
    systemAdminRoute.addChildren([
      systemAdminIndexRoute,
      systemAdminUsersRoute,
      systemAdminUserDetailRoute,
      systemAdminChurchesRoute,
      systemAdminChurchDetailRoute,
      systemAdminSchedulingRoute,
      systemAdminSchedulingEventDetailRoute,
    ]),
    ...shellRoutes,
  ]);
}

const routeTree = buildRouteTree();

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
