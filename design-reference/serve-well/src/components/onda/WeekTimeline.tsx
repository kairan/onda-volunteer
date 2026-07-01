import { ChevronLeft, ChevronRight, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventDialog } from "@/components/onda/modals";
import { useRole, type Role } from "@/lib/role";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type TimelineEvent = {
  title: string;
  time: string;
  ministries: string[]; // empty array = no ministry assigned yet
  status: "ok" | "gap";
  mine?: boolean; // for volunteer: this event has me assigned
};

const defaultWeek: Record<string, TimelineEvent[]> = {
  Sun: [
    { title: "Sunday Service", time: "9:00 AM", ministries: ["Worship", "Kids", "Hospitality"], status: "ok", mine: true },
    { title: "Evening Gathering", time: "6:00 PM", ministries: [], status: "gap" },
  ],
  Mon: [],
  Tue: [{ title: "Leaders Meeting", time: "7:00 PM", ministries: ["Admin"], status: "ok" }],
  Wed: [{ title: "Prayer Night", time: "7:00 PM", ministries: ["Prayer"], status: "ok", mine: true }],
  Thu: [{ title: "Rehearsal", time: "7:00 PM", ministries: ["Worship"], status: "ok" }],
  Fri: [{ title: "Community Dinner", time: "6:00 PM", ministries: ["Hospitality"], status: "gap", mine: true }],
  Sat: [{ title: "Worship Night", time: "7:00 PM", ministries: ["Worship", "Tech & Media"], status: "ok" }],
};

const myMinistryByRole: Partial<Record<Role, string>> = {
  leader: "Worship",
};

export function WeekTimeline({
  week = defaultWeek,
  weekLabel = "Week of Jun 22",
  startDay = 22,
  showHeader = true,
  compact = false,
  readOnly = false,
}: {
  week?: Record<string, TimelineEvent[]>;
  weekLabel?: string;
  startDay?: number;
  showHeader?: boolean;
  compact?: boolean;
  readOnly?: boolean;
}) {
  const { role } = useRole();
  const myMinistry = myMinistryByRole[role];
  const canCreate = role === "admin" && !readOnly;
  const canClaim = role === "leader" && !readOnly;
  const isReadOnly = readOnly || role === "volunteer";

  return (
    <section className="space-y-3">
      {showHeader && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">This week</h3>
            <p className="text-sm text-muted-foreground">
              {weekLabel}
              {isReadOnly && " · your events highlighted"}
              {canClaim && ` · claim events for ${myMinistry}`}
              {role === "admin" && " · all ministries"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" aria-label="Previous week">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">This week</Button>
            <Button size="icon" variant="outline" aria-label="Next week">
              <ChevronRight className="h-4 w-4" />
            </Button>
            {canCreate && (
              <EventDialog
                trigger={
                  <Button size="sm">
                    <Plus className="h-4 w-4" /> Schedule event
                  </Button>
                }
              />
            )}
          </div>
        </div>
      )}

      <Card className="overflow-hidden rounded-lg border border-border p-0 shadow-card">
        <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground">
          {days.map((d, i) => (
            <div key={d} className="px-2 py-2 text-center">
              {d} <span className="ml-1 text-foreground">{startDay + i}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-border">
          {days.map((d) => (
            <div key={d} className={`${compact ? "min-h-28" : "min-h-40"} space-y-1.5 p-1.5`}>
              {(week[d] ?? []).map((e, i) => {
                const claimed = myMinistry ? e.ministries.includes(myMinistry) : false;
                const isMine = e.mine || claimed;
                const hasNoMinistry = e.ministries.length === 0;
                const showClaim = canClaim && !claimed;
                const tone = isMine
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : e.status === "gap"
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-border bg-muted/40 text-foreground";
                return (
                  <div
                    key={i}
                    className={`rounded-md border px-2 py-1.5 text-[11px] ${tone}`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-medium text-foreground leading-tight">{e.title}</p>
                      {isMine && <CheckCircle2 className="mt-0.5 h-3 w-3 text-primary" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{e.time}</p>
                    {!compact && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {hasNoMinistry ? (
                          <Badge variant="outline" className="h-4 rounded border-dashed px-1 text-[10px] font-normal text-muted-foreground">
                            No ministry
                          </Badge>
                        ) : (
                          e.ministries.map((m) => (
                            <Badge
                              key={m}
                              variant="outline"
                              className={`h-4 rounded px-1 text-[10px] font-normal ${
                                m === myMinistry
                                  ? "border-primary/30 bg-primary/10 text-primary"
                                  : "border-border bg-background text-muted-foreground"
                              }`}
                            >
                              {m}
                            </Badge>
                          ))
                        )}
                      </div>
                    )}
                    {showClaim && (
                      <button
                        type="button"
                        onClick={() =>
                          toast.success(`${myMinistry} added to ${e.title}`)
                        }
                        className="mt-1.5 w-full rounded border border-primary/30 bg-background px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/5"
                      >
                        + Add {myMinistry}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary/40" />
          {isReadOnly ? "You're serving" : canClaim ? `${myMinistry} on roster` : "Roster complete"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-300" /> Open / no ministry
        </span>
      </div>
    </section>
  );
}
