import { createFileRoute } from "@tanstack/react-router";
import { Plus, MoreHorizontal } from "lucide-react";
import { AppShell } from "@/components/onda/AppShell";
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

export const Route = createFileRoute("/ministries")({
  head: () => ({
    meta: [
      { title: "Ministries · Onda" },
      { name: "description", content: "All ministries at a glance." },
    ],
  }),
  component: MinistriesPage,
});

const ministries = [
  { name: "Worship", leader: "David Kim", volunteers: 24, events: 8, status: "Active" },
  { name: "Kids", leader: "Hannah Lee", volunteers: 18, events: 6, status: "Active" },
  { name: "Hospitality", leader: "Emily Rhodes", volunteers: 12, events: 5, status: "Active" },
  { name: "Tech & Media", leader: "James O'Connor", volunteers: 9, events: 8, status: "Active" },
  { name: "Outreach", leader: "Marcus Wright", volunteers: 15, events: 3, status: "Needs leader" },
  { name: "Prayer", leader: "Esther Cho", volunteers: 21, events: 4, status: "Active" },
  { name: "Youth", leader: "Aaron Liu", volunteers: 17, events: 5, status: "Active" },
];

function MinistriesPage() {
  return (
    <AppShell title="Ministries" subtitle="Grace Chapel">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Ministries</h2>
            <p className="mt-1 text-sm text-muted-foreground">{ministries.length} ministries · 1 needs a leader</p>
          </div>
          <Button size="sm"><Plus className="h-4 w-4" /> Add ministry</Button>
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
                      className={m.status === "Active" ? "border-primary/20 bg-primary/10 text-primary" : "border-amber-200 bg-amber-50 text-amber-800"}
                    >
                      {m.status}
                    </Badge>
                  </TableCell>
                  <TableCell><Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppShell>
  );
}
