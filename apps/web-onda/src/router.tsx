import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';

function placeholderPage(title: string) {
  return function PlaceholderPage() {
    return <p>{title}</p>;
  };
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: placeholderPage('Auth'),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: placeholderPage('Dashboard'),
});

const schedulingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scheduling',
  component: placeholderPage('Scheduling'),
});

const timeAwayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/time-away',
  component: placeholderPage('Time away'),
});

const volunteersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/volunteers',
  component: placeholderPage('Volunteers'),
});

const ministriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ministries',
  component: placeholderPage('Ministries'),
});

const ministryLeadersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ministry-leaders',
  component: placeholderPage('Ministry leaders'),
});

const userSelectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/user-select',
  component: placeholderPage('User select'),
});

const systemAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/system-admin',
  component: placeholderPage('System admin'),
});

const routeTree = rootRoute.addChildren([
  authRoute,
  dashboardRoute,
  schedulingRoute,
  timeAwayRoute,
  volunteersRoute,
  ministriesRoute,
  ministryLeadersRoute,
  userSelectRoute,
  systemAdminRoute,
]);

export function buildRouteTree() {
  return routeTree;
}

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
