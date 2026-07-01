import { createFileRoute } from "@tanstack/react-router";
import { Calendar, MapPin, Filter } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/onda/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/onda/modals";

export const Route = createFileRoute("/assignments")({
  head: () => ({
    meta: [
      { title: "My Assignments · Onda" },
      { name: "description", content: "Your upcoming volunteer assignments on Onda." },
    ],
  }),
  component: AssignmentsPage,
});

const assignments = [
  { event: "Sunday Service", date: "Sun, Jun 22 · 9:00 AM", ministry: "Worship", role: "Lead Vocalist", location: "Main Auditorium", status: "Confirmed" },
  { event: "Wednesday Prayer", date: "Wed, Jun 25 · 7:00 PM", ministry: "Prayer", role: "Intercessor", location: "Chapel", status: "Pending" },
  { event: "Community Dinner", date: "Fri, Jun 27 · 6:00 PM", ministry: "Hospitality", role: "Greeter", location: "Fellowship Hall", status: "Confirmed" },
  { event: "Sunday Service", date: "Sun, Jun 29 · 9:00 AM", ministry: "Worship", role: "Backing Vocals", location: "Main Auditorium", status: "Confirmed" },
  { event: "Kids Camp", date: "Sat, Jul 5 · 10:00 AM", ministry: "Kids", role: "Team Leader", location: "Kids Wing", status: "Pending" },
];

function AssignmentsPage() {
  return (
    <AppShell title="My Assignments" subtitle="All upcoming serves">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">My assignments</h2>
            <p className="mt-1 text-sm text-muted-foreground">{assignments.length} scheduled · 2 awaiting response</p>
          </div>
          <Button size="sm" variant="outline">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {assignments.map((a, i) => (
            <Card key={i} className="rounded-lg border border-border p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-medium">{a.event}</h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.ministry} · {a.role}</p>
                </div>
                <Badge
                  variant="outline"
                  className={a.status === "Confirmed" ? "border-primary/20 bg-primary/10 text-primary" : "border-amber-200 bg-amber-50 text-amber-800"}
                >
                  {a.status}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {a.date}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {a.location}</span>
              </div>
              {a.status === "Pending" && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => toast.success(`Accepted ${a.event}`)}>Accept</Button>
                  <ConfirmDeleteDialog
                    title={`Decline ${a.event}?`}
                    description={`Your leader will be notified that you can't serve as ${a.role}.`}
                    confirmLabel="Decline"
                    trigger={<Button size="sm" variant="outline">Decline</Button>}
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
