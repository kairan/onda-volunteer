import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, UserMinus, Plus } from "lucide-react";
import { AppShell } from "@/components/onda/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AssignSlotDialog, ConfirmDeleteDialog, EventDialog } from "@/components/onda/modals";

export const Route = createFileRoute("/roster")({
  head: () => ({
    meta: [
      { title: "Roster · Onda" },
      { name: "description", content: "Assign volunteers to event slots." },
    ],
  }),
  component: RosterPage,
});

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
      { role: "Sound", volunteer: "Daniel Park", status: "filled" },
    ],
  },
  {
    title: "Evening Worship Night",
    date: "Sat, Jun 28 · 7:00 PM",
    slots: [
      { role: "Lead Vocalist", volunteer: "James O'Connor", status: "filled" },
      { role: "Keys", volunteer: "Priya Patel", status: "filled" },
      { role: "Guitar", volunteer: null, status: "open" },
      { role: "Drums", volunteer: "Aaron Liu", status: "filled" },
    ],
  },
];

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("");
}

function RosterPage() {
  return (
    <AppShell title="Roster" subtitle="Worship ministry">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Roster</h2>
            <p className="mt-1 text-sm text-muted-foreground">Assign people to event roles</p>
          </div>
          <div className="flex gap-2">
            <EventDialog
              trigger={
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" /> New event
                </Button>
              }
            />
            <AssignSlotDialog
              trigger={
                <Button size="sm">
                  <UserPlus className="h-4 w-4" /> Assign volunteer
                </Button>
              }
            />
          </div>
        </div>
        {events.map((event) => (
          <Card key={event.title} className="overflow-hidden rounded-lg border border-border p-0 shadow-card">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
              <div>
                <h4 className="font-medium">{event.title}</h4>
                <p className="text-xs text-muted-foreground">{event.date}</p>
              </div>
              <Badge variant="outline" className="rounded-md">
                {event.slots.filter((s) => s.status !== "open").length}/{event.slots.length} filled
              </Badge>
            </div>
            <ul className="divide-y divide-border">
              {event.slots.map((slot, idx) => (
                <li key={idx} className="flex items-center gap-3 px-4 py-3 text-sm">
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
                          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Pending</Badge>
                        )}
                      </>
                    ) : (
                      <span className="italic text-muted-foreground">Unfilled</span>
                    )}
                  </div>
                  {slot.volunteer ? (
                    <ConfirmDeleteDialog
                      title={`Release ${slot.volunteer}?`}
                      description={`They'll be notified that they're no longer on ${event.title} as ${slot.role}.`}
                      confirmLabel="Release"
                      trigger={
                        <Button size="sm" variant="ghost">
                          <UserMinus className="h-4 w-4" /> Release
                        </Button>
                      }
                    />
                  ) : (
                    <AssignSlotDialog
                      role={slot.role}
                      event={event.title}
                      trigger={
                        <Button size="sm" variant="outline">
                          <UserPlus className="h-4 w-4" /> Assign
                        </Button>
                      }
                    />
                  )}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
