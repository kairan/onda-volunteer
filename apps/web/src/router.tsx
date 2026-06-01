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
import { PRIMARY_NAV_MANIFEST } from "./navigation/manifest";
import { DashboardPage } from "./routes/dashboard";
import { PlaceholderPage } from "./routes/placeholderPage";
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
import { SystemAdminDashboardPage } from "./system-admin/SystemAdminDashboardPage";
import { SystemAdminUsersPage } from "./system-admin/SystemAdminUsersPage";
import { SystemAdminUserDetailPage } from "./system-admin/SystemAdminUserDetailPage";
import { ensureSystemAdminRouteAccess } from "./system-admin/ensureSystemAdminRouteAccess";

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

const shellRoutes = PRIMARY_NAV_MANIFEST.map((item) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: item.path,
    component: shellPage(() => {
      if (item.id === "dashboard") {
        return <DashboardPage />;
      }
      if (item.id === "scheduling") {
        return <SchedulingPage />;
      }
      if (item.id === "timeAway") {
        return <TimeAwayPage />;
      }
      if (item.id === "ministries") {
        return <MinistriesPage />;
      }
      if (item.id === "volunteers") {
        return <VolunteersPage />;
      }
      if (item.placeholder) {
        return <PlaceholderPage namespace={item.namespace} />;
      }
      return <DashboardPage />;
    }),
    errorComponent: shellErrorComponent,
  }),
);

async function defaultSchedulingEventDetailLoader({
  params,
}: {
  params: { eventId: string };
}): Promise<EventDetailPayload> {
  return loadSchedulingEventDetail({ eventId: params.eventId });
}

export function buildRouteTree(options: BuildRouteTreeOptions = {}) {
  const schedulingEventDetailRoute = createSchedulingEventDetailRoute(
    options.schedulingEventDetailLoader ?? defaultSchedulingEventDetailLoader,
  );
  return rootRoute.addChildren([
    legacyLayoutRoute.addChildren([indexRoute]),
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
