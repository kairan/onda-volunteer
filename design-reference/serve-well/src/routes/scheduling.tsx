import { createFileRoute } from "@tanstack/react-router";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/onda/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventDialog } from "@/components/onda/modals";

export const Route = createFileRoute("/scheduling")({
  head: () => ({
    meta: [
      { title: "Scheduling · Onda" },
      { name: "description", content: "Cross-ministry scheduling calendar." },
    ],
  }),
  component: SchedulingPage,
});

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type EventBlock = { title: string; ministry: string; time: string; status: "ok" | "gap" };
const week: Record<string, EventBlock[]> = {
  Sun: [
    { title: "Sunday Service", ministry: "Worship", time: "9:00 AM", status: "ok" },
    { title: "Kids Sunday", ministry: "Kids", time: "9:00 AM", status: "gap" },
  ],
  Mon: [],
  Tue: [{ title: "Leaders Meeting", ministry: "Admin", time: "7:00 PM", status: "ok" }],
  Wed: [{ title: "Prayer Night", ministry: "Prayer", time: "7:00 PM", status: "ok" }],
  Thu: [{ title: "Rehearsal", ministry: "Worship", time: "7:00 PM", status: "ok" }],
  Fri: [{ title: "Community Dinner", ministry: "Hospitality", time: "6:00 PM", status: "gap" }],
  Sat: [{ title: "Worship Night", ministry: "Worship", time: "7:00 PM", status: "ok" }],
};

function SchedulingPage() {
  return (
    <AppShell title="Scheduling" subtitle="Week of June 22">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Scheduling</h2>
            <p className="mt-1 text-sm text-muted-foreground">Church-wide calendar across all ministries</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline"><ChevronLeft className="h-4 w-4" /></Button>
            <Button size="sm" variant="outline">This week</Button>
            <Button size="icon" variant="outline"><ChevronRight className="h-4 w-4" /></Button>
            <EventDialog
              trigger={
                <Button size="sm"><Plus className="h-4 w-4" /> Schedule event</Button>
              }
            />
          </div>
        </div>

        <Card className="overflow-hidden rounded-lg border border-border p-0 shadow-card">
          <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground">
            {days.map((d, i) => (
              <div key={d} className="px-3 py-2 text-center">
                {d} <span className="ml-1 text-foreground">{22 + i}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-border">
            {days.map((d) => (
              <div key={d} className="min-h-40 space-y-1.5 p-2">
                {week[d].map((e, i) => (
                  <div
                    key={i}
                    className={`rounded-md border px-2 py-1.5 text-xs ${
                      e.status === "gap"
                        ? "border-amber-200 bg-amber-50 text-amber-900"
                        : "border-primary/20 bg-primary/10 text-primary"
                    }`}
                  >
                    <p className="font-medium text-foreground">{e.title}</p>
                    <p className="text-[11px]">{e.ministry} · {e.time}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary/40" /> Roster complete</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-300" /> Open slots</span>
          <Badge variant="outline" className="ml-auto">2 events with gaps</Badge>
        </div>
      </div>
    </AppShell>
  );
}
