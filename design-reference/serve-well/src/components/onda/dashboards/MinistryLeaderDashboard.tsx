import { Plus, UserPlus, UserMinus, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const events = [
  {
    title: "Sunday Service",
    date: "Sun, Jun 22 · 9:00 AM",
    slots: [
      { role: "Lead Vocalist", volunteer: "Sarah Chen", status: "filled" },
      { role: "Acoustic Guitar", volunteer: "Michael Torres", status: "filled" },
      { role: "Keys", volunteer: "Priya Patel", status: "pending" },
      { role: "Drums", volunteer: null, status: "open" },
      { role: "Bass", volunteer: null, status: "open" },
    ],
  },
  {
    title: "Evening Worship Night",
    date: "Sat, Jun 28 · 7:00 PM",
    slots: [
      { role: "Lead Vocalist", volunteer: "James O'Connor", status: "filled" },
      { role: "Keys", volunteer: "Priya Patel", status: "filled" },
      { role: "Guitar", volunteer: null, status: "open" },
    ],
  },
];

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("");
}

export function MinistryLeaderDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Worship ministry</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            2 events this week · 3 open slots · 1 pending response
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4" /> New event
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4" /> Assign volunteer
          </Button>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-base font-semibold">Roster</h3>
        {events.map((event) => (
          <Card
            key={event.title}
            className="overflow-hidden rounded-lg border border-border p-0 shadow-card"
          >
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
              <div>
                <h4 className="font-medium">{event.title}</h4>
                <p className="text-xs text-muted-foreground">{event.date}</p>
              </div>
              <Badge variant="outline" className="rounded-md">
                {event.slots.filter((s) => s.status !== "open").length}/
                {event.slots.length} filled
              </Badge>
            </div>
            <ul className="divide-y divide-border">
              {event.slots.map((slot, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 px-4 py-3 text-sm"
                >
                  <span className="w-36 text-muted-foreground">{slot.role}</span>
                  <div className="flex flex-1 items-center gap-2">
                    {slot.volunteer ? (
                      <>
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                            {initials(slot.volunteer)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{slot.volunteer}</span>
                        {slot.status === "pending" && (
                          <Badge
                            variant="outline"
                            className="border-amber-200 bg-amber-50 text-amber-800"
                          >
                            Pending
                          </Badge>
                        )}
                      </>
                    ) : (
                      <span className="italic text-muted-foreground">Unfilled</span>
                    )}
                  </div>
                  {slot.volunteer ? (
                    <Button size="sm" variant="ghost">
                      <UserMinus className="h-4 w-4" /> Release
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline">
                      <UserPlus className="h-4 w-4" /> Assign
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </section>
    </div>
  );
}
