import { createFileRoute } from "@tanstack/react-router";
import { Plus, Calendar, MapPin, Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/onda/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventDialog, ConfirmDeleteDialog } from "@/components/onda/modals";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events · Onda" },
      { name: "description", content: "Plan ministry events and recurring services." },
    ],
  }),
  component: EventsPage,
});

const events = [
  { title: "Sunday Service", date: "Sun, Jun 22 · 9:00 AM", location: "Main Auditorium", filled: 9, total: 12, status: "Published" },
  { title: "Evening Worship Night", date: "Sat, Jun 28 · 7:00 PM", location: "Main Auditorium", filled: 5, total: 8, status: "Published" },
  { title: "Sunday Service", date: "Sun, Jun 29 · 9:00 AM", location: "Main Auditorium", filled: 11, total: 12, status: "Published" },
  { title: "Worship Team Rehearsal", date: "Thu, Jul 3 · 7:00 PM", location: "Rehearsal Room", filled: 6, total: 6, status: "Draft" },
  { title: "Youth Service", date: "Sun, Jul 6 · 6:00 PM", location: "Youth Hall", filled: 3, total: 7, status: "Published" },
];

function EventsPage() {
  return (
    <AppShell title="Events" subtitle="Worship ministry">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Events</h2>
            <p className="mt-1 text-sm text-muted-foreground">{events.length} upcoming · Worship</p>
          </div>
          <EventDialog
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4" /> New event
              </Button>
            }
          />
        </div>
        <div className="grid gap-3">
          {events.map((e, i) => {
            const pct = Math.round((e.filled / e.total) * 100);
            return (
              <Card key={i} className="rounded-lg border border-border p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-medium">{e.title}</h4>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {e.date}</span>
                      <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {e.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className={e.status === "Published" ? "border-primary/20 bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground"}>
                      {e.status}
                    </Badge>
                    <EventDialog
                      mode="edit"
                      initial={{ title: e.title, location: e.location }}
                      trigger={
                        <Button size="icon" variant="ghost" aria-label="Edit event">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <ConfirmDeleteDialog
                      title="Delete this event?"
                      description={`${e.title} · ${e.date}. Any assigned volunteers will be notified.`}
                      trigger={
                        <Button size="icon" variant="ghost" aria-label="Delete event">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Roster filled</span>
                    <span className="font-medium">{e.filled}/{e.total} · {pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
