import {
  Link,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
} from "@tanstack/react-router";
import { AuthPanel } from "./AuthPanel";
import { shellRouteErrorMessage } from "./apiError";
import { loadSchedulingEventDetail } from "./events/loadSchedulingEventDetail";
import { Button } from "./components/ui/button";
import type { EventDetailPayload } from "./eventDetailPayload";
import { DesignFoundationPreview } from "./routes/designFoundationPreview";
import { DashboardPage } from "./routes/dashboard";
import { MinistriesPage } from "./routes/ministries";
import { MinistryLeadersPage } from "./routes/ministryLeaders";
import { VolunteersPage } from "./routes/volunteers";
import { SchedulingPage } from "./routes/scheduling";
import {
  SchedulingEventDetailPending,
  SchedulingEventDetailView,
} from "./routes/schedulingEventDetail";
import { SchedulingCreateEventPage } from "./routes/schedulingCreateEvent";
import { TimeAwayPage } from "./routes/timeAway";
import { LeaderVolunteerTimeAwayPage } from "./routes/leaderVolunteerTimeAway";
import { SchedulingCreatePrivateEventPage } from "./routes/schedulingCreatePrivateEvent";
import { RouteErrorPanel } from "./shell/RouteErrorPanel";
import { ProtectedAppShell } from "./shell/ProtectedAppShell";
import { shellPage } from "./shell/shellPage";
import { SystemAdminShell } from "./system-admin/SystemAdminShell";
import { SystemAdminChurchDetailPage } from "./system-admin/SystemAdminChurchDetailPage";
import { SystemAdminChurchesPage } from "./system-admin/SystemAdminChurchesPage";
import { SystemAdminDashboardPage } from "./system-admin/SystemAdminDashboardPage";
import { SystemAdminUsersPage } from "./system-admin/SystemAdminUsersPage";
import { SystemAdminUserDetailPage } from "./system-admin/SystemAdminUserDetailPage";
import { SystemAdminSchedulingPage } from "./system-admin/SystemAdminSchedulingPage";
import { SystemAdminSchedulingEventDetailPage } from "./system-admin/SystemAdminSchedulingEventDetailPage";
import { ensureSystemAdminRouteAccess } from "./system-admin/ensureSystemAdminRouteAccess";
import { UserSelectPage } from "./routes/userSelect";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const legacyLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "legacy",
  component: () => (
    <div className="mx-auto min-h-screen max-w-2xl p-6">
      <AuthPanel variant="legacy" />
      <Outlet />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => legacyLayoutRoute,
  path: "/",
  component: function Home() {
    const id = import.meta.env.VITE_DEMO_EVENT_ID ?? "seed-event-public";
    return (
      <main className="flex min-h-[80vh] flex-col justify-center gap-8">
        <section className="border border-border bg-background p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Onda Dura Church
          </p>
          <h1 className="max-w-2xl font-display text-6xl font-bold uppercase leading-[0.95] tracking-tight sm:text-7xl">
            Volunteer roster
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            A disciplined workspace for church teams to coordinate volunteers,
            ministries, and service schedules with clarity.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/dashboard">Open dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link
                to="/scheduling/events/$eventId"
                params={{ eventId: id }}
              >
                View demo event
              </Link>
            </Button>
          </div>
        </section>
        <DesignFoundationPreview />
      </main>
    );
  },
});

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

const userSelectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/user-select",
  component: UserSelectPage,
});

const legacyEventRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/events/$eventId",
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
    path: "/scheduling/events/$eventId",
    loader: ({ params }) => schedulingEventDetailLoader({ params }),
    pendingComponent: shellPage(SchedulingEventDetailPending),
    component: shellPage(function SchedulingEventDetailShellPage() {
      const data = schedulingEventDetailRoute.useLoaderData();
      return <SchedulingEventDetailView data={data} />;
    }),
    errorComponent: shellErrorComponent,
  });
  return schedulingEventDetailRoute;
}

const leaderVolunteerTimeAwayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leader/volunteer-time-away",
  component: shellPage(() => <LeaderVolunteerTimeAwayPage />),
  errorComponent: shellErrorComponent,
});

const schedulingCreateEventRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/scheduling/events/new",
  component: shellPage(() => <SchedulingCreateEventPage />),
  errorComponent: shellErrorComponent,
});

const schedulingCreatePrivateEventRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/scheduling/events/new-private",
  component: shellPage(() => <SchedulingCreatePrivateEventPage />),
  errorComponent: shellErrorComponent,
});

const ministryLeadersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ministry-leaders",
  component: shellPage(() => <MinistryLeadersPage />),
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
  path: "/system-admin",
  beforeLoad: () => ensureSystemAdminRouteAccess(),
  component: SystemAdminShell,
  errorComponent: systemAdminErrorComponent,
});

const systemAdminIndexRoute = createRoute({
  getParentRoute: () => systemAdminRoute,
  path: "/",
  component: SystemAdminDashboardPage,
});


const systemAdminChurchDetailRoute = createRoute({
  getParentRoute: () => systemAdminRoute,
  path: "/churches/$churchId",
  component: SystemAdminChurchDetailPage,
});

const systemAdminUsersRoute = createRoute({
  getParentRoute: () => systemAdminRoute,
  path: "/users",
  component: SystemAdminUsersPage,
});

const systemAdminUserDetailRoute = createRoute({
  getParentRoute: () => systemAdminRoute,
  path: "/users/$volunteerId",
  component: SystemAdminUserDetailPage,
});

const systemAdminChurchesRoute = createRoute({
  getParentRoute: () => systemAdminRoute,
  path: "/churches",
  component: SystemAdminChurchesPage,
});

const systemAdminSchedulingRoute = createRoute({
  getParentRoute: () => systemAdminRoute,
  path: "/scheduling",
  component: SystemAdminSchedulingPage,
});

function createSystemAdminSchedulingEventDetailRoute(
  schedulingEventDetailLoader: SchedulingEventDetailLoader,
) {
  const route = createRoute({
    getParentRoute: () => systemAdminRoute,
    path: "/scheduling/events/$eventId",
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
  path: "/dashboard",
  component: shellPage(() => <DashboardPage />),
  errorComponent: shellErrorComponent,
});

const schedulingHubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/scheduling",
  component: shellPage(() => <SchedulingPage />),
  errorComponent: shellErrorComponent,
});

const ministriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ministries",
  component: shellPage(() => <MinistriesPage />),
  errorComponent: shellErrorComponent,
});

const volunteersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/volunteers",
  component: shellPage(() => <VolunteersPage />),
  errorComponent: shellErrorComponent,
});

const timeAwayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/time-away",
  component: shellPage(() => <TimeAwayPage />),
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
  return loadSchedulingEventDetail({ eventId: params.eventId });
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

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
