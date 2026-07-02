import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';
import { shellRouteErrorMessage } from '@/api/apiError';
import {
  devAuthBypassAllowed,
  volunteerIdForProtectedRequests,
} from '@/auth/authSession';
import { AuthPage } from '@/routes/auth';
import { DashboardPage } from '@/routes/dashboard';
import { placeholderPage } from '@/routes/placeholders';
import { UserSelectPage } from '@/routes/userSelect';
import { RouteErrorPanel } from '@/shell/RouteErrorPanel';
import { ProtectedAppShell } from '@/shell/ProtectedAppShell';
import { shellRoute } from '@/shell/shellRoute';
import { ensureShellRouteAuth } from '@/shell/shellRouteAuth';
import { SystemAdminShell } from '@/system-admin/SystemAdminShell';
import { ensureSystemAdminRouteAccess } from '@/system-admin/ensureSystemAdminRouteAccess';
import { getSupabaseClient } from '@/supabaseClient';
import {
  SystemAdminChurchDetailPage,
  SystemAdminChurchesPage,
  SystemAdminDashboardPage,
  SystemAdminSchedulingEventDetailPage,
  SystemAdminSchedulingPage,
  SystemAdminUserDetailPage,
  SystemAdminUsersPage,
} from '@/system-admin/pages';

const SchedulingPage = placeholderPage('Scheduling');
const TimeAwayPage = placeholderPage('Time away');
const MinistriesPage = placeholderPage('Ministries');
const VolunteersPage = placeholderPage('Volunteers');
const MinistryLeadersPage = placeholderPage('Ministry leaders');
const SchedulingEventDetailPage = placeholderPage('Event detail');
const SchedulingCreateEventPage = placeholderPage('New event');
const SchedulingCreatePrivateEventPage = placeholderPage('New private event');
const LeaderVolunteerTimeAwayPage = placeholderPage('Volunteer time away');

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

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

const shellBeforeLoad = () => ensureShellRouteAuth();

async function redirectFromAppRoot(): Promise<void> {
  if (volunteerIdForProtectedRequests() || devAuthBypassAllowed()) {
    throw redirect({ to: '/dashboard', replace: true });
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({ to: '/dashboard', replace: true });
    }
  }

  throw redirect({ to: '/auth', replace: true });
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => redirectFromAppRoot(),
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthPage,
});

const userSelectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/user-select',
  component: UserSelectPage,
});

const legacyEventRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events/$eventId',
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/scheduling/events/$eventId',
      params: { eventId: params.eventId },
      replace: true,
    });
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: shellBeforeLoad,
  component: shellRoute(DashboardPage),
  errorComponent: shellErrorComponent,
});

const schedulingHubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scheduling',
  beforeLoad: shellBeforeLoad,
  component: shellRoute(SchedulingPage),
  errorComponent: shellErrorComponent,
});

const schedulingEventDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scheduling/events/$eventId',
  beforeLoad: shellBeforeLoad,
  component: shellRoute(SchedulingEventDetailPage),
  errorComponent: shellErrorComponent,
});

const schedulingCreateEventRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scheduling/events/new',
  beforeLoad: shellBeforeLoad,
  component: shellRoute(SchedulingCreateEventPage),
  errorComponent: shellErrorComponent,
});

const schedulingCreatePrivateEventRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scheduling/events/new-private',
  beforeLoad: shellBeforeLoad,
  component: shellRoute(SchedulingCreatePrivateEventPage),
  errorComponent: shellErrorComponent,
});

const timeAwayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/time-away',
  beforeLoad: shellBeforeLoad,
  component: shellRoute(TimeAwayPage),
  errorComponent: shellErrorComponent,
});

const leaderVolunteerTimeAwayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/leader/volunteer-time-away',
  beforeLoad: shellBeforeLoad,
  component: shellRoute(LeaderVolunteerTimeAwayPage),
  errorComponent: shellErrorComponent,
});

const ministriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ministries',
  beforeLoad: shellBeforeLoad,
  component: shellRoute(MinistriesPage),
  errorComponent: shellErrorComponent,
});

const volunteersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/volunteers',
  beforeLoad: shellBeforeLoad,
  component: shellRoute(VolunteersPage),
  errorComponent: shellErrorComponent,
});

const ministryLeadersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ministry-leaders',
  beforeLoad: shellBeforeLoad,
  component: shellRoute(MinistryLeadersPage),
  errorComponent: shellErrorComponent,
});

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

const systemAdminChurchesRoute = createRoute({
  getParentRoute: () => systemAdminRoute,
  path: '/churches',
  component: SystemAdminChurchesPage,
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

const systemAdminSchedulingRoute = createRoute({
  getParentRoute: () => systemAdminRoute,
  path: '/scheduling',
  component: SystemAdminSchedulingPage,
});

const systemAdminSchedulingEventDetailRoute = createRoute({
  getParentRoute: () => systemAdminRoute,
  path: '/scheduling/events/$eventId',
  component: SystemAdminSchedulingEventDetailPage,
});

export function buildRouteTree() {
  return rootRoute.addChildren([
    indexRoute,
    authRoute,
    userSelectRoute,
    legacyEventRedirectRoute,
    dashboardRoute,
    schedulingHubRoute,
    schedulingEventDetailRoute,
    schedulingCreateEventRoute,
    schedulingCreatePrivateEventRoute,
    timeAwayRoute,
    leaderVolunteerTimeAwayRoute,
    ministriesRoute,
    volunteersRoute,
    ministryLeadersRoute,
    systemAdminRoute.addChildren([
      systemAdminIndexRoute,
      systemAdminChurchesRoute,
      systemAdminChurchDetailRoute,
      systemAdminUsersRoute,
      systemAdminUserDetailRoute,
      systemAdminSchedulingRoute,
      systemAdminSchedulingEventDetailRoute,
    ]),
  ]);
}

const routeTree = buildRouteTree();

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
