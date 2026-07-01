import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/system-admin")({
  head: () => ({
    meta: [
      { title: "Operator Console · Onda" },
      {
        name: "description",
        content: "Platform operator console for Onda — manage churches, admins, and read-only scheduling access.",
      },
    ],
  }),
  component: () => <Outlet />,
});
