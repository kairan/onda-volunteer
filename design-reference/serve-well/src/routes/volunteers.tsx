import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, Search, Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/onda/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VolunteerDialog, ConfirmDeleteDialog } from "@/components/onda/modals";

export const Route = createFileRoute("/volunteers")({
  head: () => ({
    meta: [
      { title: "Volunteers · Onda" },
      { name: "description", content: "Volunteer directory across ministries." },
    ],
  }),
  component: VolunteersPage,
});

const volunteers = [
  { name: "Sarah Chen", email: "sarah.chen@grace.org", ministries: ["Worship"], serves: 22, status: "Active" },
  { name: "Michael Torres", email: "m.torres@grace.org", ministries: ["Worship", "Tech & Media"], serves: 18, status: "Active" },
  { name: "Priya Patel", email: "priya@grace.org", ministries: ["Worship", "Prayer"], serves: 31, status: "Active" },
  { name: "Daniel Park", email: "dpark@grace.org", ministries: ["Tech & Media"], serves: 14, status: "Active" },
  { name: "Hannah Lee", email: "hannah.lee@grace.org", ministries: ["Kids"], serves: 27, status: "Active" },
  { name: "James O'Connor", email: "james@grace.org", ministries: ["Worship"], serves: 9, status: "On break" },
  { name: "Emily Rhodes", email: "erhodes@grace.org", ministries: ["Hospitality"], serves: 12, status: "Active" },
];

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("");
}

function VolunteersPage() {
  return (
    <AppShell title="Volunteers" subtitle="Directory">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Volunteers</h2>
            <p className="mt-1 text-sm text-muted-foreground">{volunteers.length} people on the team</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search volunteers…" className="h-9 w-64 pl-8" />
            </div>
            <VolunteerDialog
              trigger={
                <Button size="sm">
                  <UserPlus className="h-4 w-4" /> Invite
                </Button>
              }
            />
          </div>
        </div>
        <Card className="overflow-hidden rounded-lg border border-border p-0 shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Name</TableHead>
                <TableHead>Ministries</TableHead>
                <TableHead className="text-right">Serves YTD</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {volunteers.map((v) => (
                <TableRow key={v.email}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                          {initials(v.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{v.name}</p>
                        <p className="text-xs text-muted-foreground">{v.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {v.ministries.map((m) => (
                        <Badge key={m} variant="outline" className="border-border bg-muted/50 text-foreground">{m}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{v.serves}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={v.status === "Active" ? "border-primary/20 bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground"}>
                      {v.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <VolunteerDialog
                        mode="edit"
                        initial={{ name: v.name, email: v.email }}
                        trigger={
                          <Button size="icon" variant="ghost" aria-label="Edit volunteer">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <ConfirmDeleteDialog
                        title={`Remove ${v.name}?`}
                        description="They'll be unassigned from upcoming events and lose access to the team."
                        confirmLabel="Remove"
                        trigger={
                          <Button size="icon" variant="ghost" aria-label="Remove volunteer">
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
      </div>
    </AppShell>
  );
}
