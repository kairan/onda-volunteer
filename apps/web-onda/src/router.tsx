import { Outlet, createRootRoute, createRouter } from '@tanstack/react-router';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const routeTree = rootRoute;

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
