import { Calendar, Clock, MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TimeAwayDialog, ConfirmDeleteDialog } from "@/components/onda/modals";
import { WeekTimeline } from "@/components/onda/WeekTimeline";

const assignments = [
  {
    event: "Sunday Service",
    date: "Sun, Jun 22 · 9:00 AM",
    ministry: "Worship",
    role: "Lead Vocalist",
    location: "Main Auditorium",
    status: "Confirmed",
  },
  {
    event: "Wednesday Prayer",
    date: "Wed, Jun 25 · 7:00 PM",
    ministry: "Prayer",
    role: "Intercessor",
    location: "Chapel",
    status: "Pending",
  },
  {
    event: "Community Dinner",
    date: "Fri, Jun 27 · 6:00 PM",
    ministry: "Hospitality",
    role: "Greeter",
    location: "Fellowship Hall",
    status: "Confirmed",
  },
];

const timeAway = [
  { from: "Jul 5", to: "Jul 12", reason: "Family vacation" },
  { from: "Aug 2", to: "Aug 3", reason: "Wedding out of town" },
];

export function VolunteerDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Hi Maria 👋</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          3 upcoming assignments · 1 awaiting your response
        </p>
      </div>

      <WeekTimeline />

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="text-base font-semibold">My upcoming assignments</h3>
            <p className="text-sm text-muted-foreground">Next 30 days</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {assignments.map((a) => (
            <Card
              key={a.event}
              className="rounded-lg border border-border p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-medium">{a.event}</h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.ministry} · {a.role}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    a.status === "Confirmed"
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  }
                >
                  {a.status}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> {a.date}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {a.location}
                </span>
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
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="text-base font-semibold">Time away</h3>
            <p className="text-sm text-muted-foreground">
              Periods you're unavailable to serve
            </p>
          </div>
          <TimeAwayDialog
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4" /> Add period
              </Button>
            }
          />
        </div>
        <Card className="rounded-lg border border-border p-0 shadow-card">
          <ul className="divide-y divide-border">
            {timeAway.map((t) => (
              <li
                key={t.reason}
                className="flex items-center gap-4 px-4 py-3"
              >
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {t.from} – {t.to}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.reason}</p>
                </div>
                <TimeAwayDialog
                  mode="edit"
                  initial={{ reason: t.reason }}
                  trigger={
                    <Button size="icon" variant="ghost" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  }
                />
                <ConfirmDeleteDialog
                  title="Remove this time away?"
                  description={`${t.from} – ${t.to} · ${t.reason}`}
                  confirmLabel="Remove"
                  trigger={
                    <Button size="icon" variant="ghost" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
