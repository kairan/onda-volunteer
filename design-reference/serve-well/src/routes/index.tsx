import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/onda/AppShell";
import { VolunteerDashboard } from "@/components/onda/dashboards/VolunteerDashboard";
import { MinistryLeaderDashboard } from "@/components/onda/dashboards/MinistryLeaderDashboard";
import { ChurchAdminDashboard } from "@/components/onda/dashboards/ChurchAdminDashboard";
import { useRole, ROLE_LABELS } from "@/lib/role";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Onda · Church Volunteer Scheduling" },
      {
        name: "description",
        content:
          "Onda is a modern volunteer scheduling app for churches — manage ministries, events, and rosters with one calm dashboard.",
      },
      { property: "og:title", content: "Onda · Church Volunteer Scheduling" },
      {
        property: "og:description",
        content:
          "Onda is a modern volunteer scheduling app for churches — manage ministries, events, and rosters with one calm dashboard.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { role } = useRole();
  const subtitle = `Signed in as ${ROLE_LABELS[role]}`;

  return (
    <AppShell title="Dashboard" subtitle={subtitle}>
      {role === "volunteer" && <VolunteerDashboard />}
      {role === "leader" && <MinistryLeaderDashboard />}
      {role === "admin" && <ChurchAdminDashboard />}
    </AppShell>
  );
}
