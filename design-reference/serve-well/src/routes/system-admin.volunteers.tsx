import { createFileRoute } from "@tanstack/react-router";
import { Search, Lock } from "lucide-react";
import { OperatorShell } from "@/components/onda/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export const Route = createFileRoute("/system-admin/volunteers")({
  head: () => ({ meta: [{ title: "Volunteers · Operator · Onda" }] }),
  component: SysVolunteersPage,
});

const rows = [
  { name: "Sarah Chen", email: "sarah.chen@grace.org", church: "Grace Chapel", ministries: 1, status: "Active" },
  { name: "Marcus Wright", email: "mwright@hope.org", church: "Hope Community", ministries: 2, status: "Active" },
  { name: "Aisha Brown", email: "aisha@riverside.org", church: "Riverside Church", ministries: 3, status: "Active" },
  { name: "Lucas Silva", email: "lsilva@newlife.org", church: "New Life Fellowship", ministries: 1, status: "Onboarding" },
  { name: "Priya Patel", email: "priya@grace.org", church: "Grace Chapel", ministries: 2, status: "Active" },
  { name: "Ethan Wright", email: "ethan@cornerstone.org", church: "Cornerstone Bible", ministries: 1, status: "Active" },
];

function initials(n: string) { return n.split(" ").map(p => p[0]).slice(0, 2).join(""); }

function SysVolunteersPage() {
  return (
    <OperatorShell title="Volunteers" subtitle="Read-only directory">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Volunteers</h2>
            <p className="mt-1 text-sm text-muted-foreground inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Platform-wide · read-only support view
            </p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search across churches…" className="h-9 w-72 pl-8" />
          </div>
        </div>
        <Card className="overflow-hidden rounded-lg border border-border p-0 shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Name</TableHead>
                <TableHead>Church</TableHead>
                <TableHead className="text-right">Ministries</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.email}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs">{initials(r.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.church}</TableCell>
                  <TableCell className="text-right">{r.ministries}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={r.status === "Active" ? "border-primary/20 bg-primary/10 text-primary" : "border-amber-200 bg-amber-50 text-amber-800"}>
                      {r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </OperatorShell>
  );
}
