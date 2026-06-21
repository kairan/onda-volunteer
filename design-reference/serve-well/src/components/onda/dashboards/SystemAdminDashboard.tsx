import { Plus, Mail, Eye, MoreHorizontal, Building2, Users, Send, Lock } from "lucide-react";
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

const stats = [
  { label: "Churches", value: "42", icon: Building2 },
  { label: "Volunteers", value: "6,184", icon: Users },
  { label: "Pending invites", value: "7", icon: Send },
  { label: "Access mode", value: "Read-only", icon: Lock },
];

const churches = [
  { name: "Grace Chapel", city: "Austin, TX", campuses: 2, admins: 3, status: "Active" },
  { name: "Hope Community", city: "Denver, CO", campuses: 1, admins: 2, status: "Active" },
  { name: "Riverside Church", city: "Portland, OR", campuses: 3, admins: 4, status: "Active" },
  { name: "New Life Fellowship", city: "Nashville, TN", campuses: 1, admins: 1, status: "Onboarding" },
];

const invites = [
  { email: "pastor@newcity.church", church: "New City Church", sent: "2 days ago", status: "Pending" },
  { email: "admin@northridge.org", church: "Northridge Bible", sent: "5 days ago", status: "Pending" },
  { email: "leader@cornerstone.net", church: "Cornerstone Fellowship", sent: "1 week ago", status: "Expired" },
];

export function SystemAdminDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Operator console</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform-wide support access · scheduling writes are disabled
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4" /> Invite church admin
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4" /> New church
          </Button>
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
          </Card>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="text-base font-semibold">Churches</h3>
            <p className="text-sm text-muted-foreground">All tenants on the platform</p>
          </div>
          <Button size="sm" variant="ghost">
            <Eye className="h-4 w-4" /> View scheduling (read-only)
          </Button>
        </div>
        <Card className="overflow-hidden rounded-lg border border-border p-0 shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Church</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Campuses</TableHead>
                <TableHead className="text-right">Admins</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {churches.map((c) => (
                <TableRow key={c.name}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.city}</TableCell>
                  <TableCell className="text-right">{c.campuses}</TableCell>
                  <TableCell className="text-right">{c.admins}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        c.status === "Active"
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-amber-200 bg-amber-50 text-amber-800"
                      }
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h3 className="text-base font-semibold">Admin invites</h3>
          <Button size="sm" variant="outline">
            <Mail className="h-4 w-4" /> New invite
          </Button>
        </div>
        <Card className="overflow-hidden rounded-lg border border-border p-0 shadow-card">
          <ul className="divide-y divide-border">
            {invites.map((i) => (
              <li key={i.email} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{i.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.church} · sent {i.sent}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    i.status === "Pending"
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-border bg-muted text-muted-foreground"
                  }
                >
                  {i.status}
                </Badge>
                <Button size="sm" variant="ghost">Resend</Button>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
