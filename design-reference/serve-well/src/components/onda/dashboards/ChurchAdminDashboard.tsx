import { Plus, Pencil, Trash2, Church, Users, Calendar, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EventDialog, MinistryDialog, ConfirmDeleteDialog } from "@/components/onda/modals";
import { WeekTimeline } from "@/components/onda/WeekTimeline";

const stats = [
  { label: "Active ministries", value: "12", icon: Church, change: "+1 this month" },
  { label: "Volunteers", value: "248", icon: Users, change: "+14 this month" },
  { label: "Events scheduled", value: "37", icon: Calendar, change: "Next 30 days" },
  { label: "Fill rate", value: "92%", icon: TrendingUp, change: "+4% vs. last month" },
];

const ministries = [
  { name: "Worship", leader: "David Kim", volunteers: 24, events: 8, status: "Active" },
  { name: "Kids", leader: "Hannah Lee", volunteers: 18, events: 6, status: "Active" },
  { name: "Hospitality", leader: "Emily Rhodes", volunteers: 12, events: 5, status: "Active" },
  { name: "Tech & Media", leader: "James O'Connor", volunteers: 9, events: 8, status: "Active" },
  { name: "Outreach", leader: "Marcus Wright", volunteers: 15, events: 3, status: "Needs leader" },
];

const events = [
  { name: "Sunday Service", date: "Jun 22", scope: "Church-wide", status: "Published" },
  { name: "Youth Retreat", date: "Jul 4–6", scope: "Youth", status: "Draft" },
  { name: "Membership Class", date: "Jul 14", scope: "Church-wide", status: "Published" },
];

export function ChurchAdminDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Grace Chapel · Austin</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Central Time (UTC−6) · 2 campuses · You're an accredited admin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Manage role catalog</Button>
          <EventDialog
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4" /> Create event
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-lg border border-border p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.change}</p>
          </Card>
        ))}
      </div>

      <WeekTimeline />

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="text-base font-semibold">Ministries</h3>
            <p className="text-sm text-muted-foreground">Leaders, scope, and membership</p>
          </div>
          <MinistryDialog
            trigger={
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" /> Add ministry
              </Button>
            }
          />
        </div>
        <Card className="overflow-hidden rounded-lg border border-border p-0 shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Ministry</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead className="text-right">Volunteers</TableHead>
                <TableHead className="text-right">Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ministries.map((m) => (
                <TableRow key={m.name}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-muted-foreground">{m.leader}</TableCell>
                  <TableCell className="text-right">{m.volunteers}</TableCell>
                  <TableCell className="text-right">{m.events}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        m.status === "Active"
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-amber-200 bg-amber-50 text-amber-800"
                      }
                    >
                      {m.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <MinistryDialog
                        mode="edit"
                        initial={{ name: m.name, leader: m.leader }}
                        trigger={
                          <Button size="icon" variant="ghost" aria-label="Edit ministry">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <ConfirmDeleteDialog
                        title={`Delete "${m.name}" ministry?`}
                        description="Volunteers and events tied to this ministry will be unassigned."
                        trigger={
                          <Button size="icon" variant="ghost" aria-label="Delete ministry">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h3 className="text-base font-semibold">Upcoming events</h3>
          <Button size="sm" variant="ghost">View all</Button>
        </div>
        <Card className="overflow-hidden rounded-lg border border-border p-0 shadow-card">
          <ul className="divide-y divide-border">
            {events.map((e) => (
              <li key={e.name} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{e.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.date} · {e.scope}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    e.status === "Published"
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-border bg-muted text-muted-foreground"
                  }
                >
                  {e.status}
                </Badge>
                <EventDialog
                  mode="edit"
                  initial={{ title: e.name }}
                  trigger={<Button size="sm" variant="ghost">Edit</Button>}
                />
                <ConfirmDeleteDialog
                  title={`Delete ${e.name}?`}
                  description={`${e.date} · ${e.scope}`}
                  trigger={
                    <Button size="icon" variant="ghost" aria-label="Delete event">
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
