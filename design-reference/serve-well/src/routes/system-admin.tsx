import { createFileRoute } from "@tanstack/react-router";
import { OperatorShell } from "@/components/onda/AppShell";
import { SystemAdminDashboard } from "@/components/onda/dashboards/SystemAdminDashboard";

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
  component: SystemAdmin,
});

function SystemAdmin() {
  return (
    <OperatorShell title="System Admin" subtitle="Platform operator">
      <SystemAdminDashboard />
    </OperatorShell>
  );
}
