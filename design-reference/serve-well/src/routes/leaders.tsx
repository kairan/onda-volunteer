import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/onda/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeaderDialog, ConfirmDeleteDialog } from "@/components/onda/modals";

export const Route = createFileRoute("/leaders")({
  head: () => ({
    meta: [
      { title: "Leaders · Onda" },
      { name: "description", content: "Ministry leaders and their permissions." },
    ],
  }),
  component: LeadersPage,
});

const leaders = [
  { name: "David Kim", email: "dkim@grace.org", ministry: "Worship", since: "Jan 2023", status: "Active" },
  { name: "Hannah Lee", email: "hannah@grace.org", ministry: "Kids", since: "Aug 2022", status: "Active" },
  { name: "Emily Rhodes", email: "erhodes@grace.org", ministry: "Hospitality", since: "Mar 2024", status: "Active" },
  { name: "James O'Connor", email: "james@grace.org", ministry: "Tech & Media", since: "Oct 2023", status: "Active" },
  { name: "Esther Cho", email: "esther@grace.org", ministry: "Prayer", since: "Jun 2024", status: "Active" },
];

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("");
}

function LeadersPage() {
  return (
    <AppShell title="Leaders" subtitle="Ministry leadership">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Leaders</h2>
            <p className="mt-1 text-sm text-muted-foreground">{leaders.length} ministry leaders</p>
          </div>
          <LeaderDialog
            trigger={
              <Button size="sm">
                <UserPlus className="h-4 w-4" /> Add leader
              </Button>
            }
          />
        </div>
        <Card className="overflow-hidden rounded-lg border border-border p-0 shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Leader</TableHead>
                <TableHead>Ministry</TableHead>
                <TableHead>Leader since</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaders.map((l) => (
                <TableRow key={l.email}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs">{initials(l.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{l.name}</p>
                        <p className="text-xs text-muted-foreground">{l.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{l.ministry}</TableCell>
                  <TableCell className="text-muted-foreground">{l.since}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">{l.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <LeaderDialog
                        mode="edit"
                        initial={{ name: l.name, email: l.email, ministry: l.ministry }}
                        trigger={
                          <Button size="icon" variant="ghost" aria-label="Edit leader">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <ConfirmDeleteDialog
                        title={`Remove ${l.name} as leader?`}
                        description="They'll lose access to manage their ministry. Their volunteer profile is kept."
                        confirmLabel="Remove"
                        trigger={
                          <Button size="icon" variant="ghost" aria-label="Remove leader">
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
