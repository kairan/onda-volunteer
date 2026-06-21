import { createFileRoute } from "@tanstack/react-router";
import { Lock, Calendar } from "lucide-react";
import { OperatorShell } from "@/components/onda/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/system-admin/scheduling")({
  head: () => ({ meta: [{ title: "Scheduling · Operator · Onda" }] }),
  component: SysSchedulingPage,
});

const events = [
  { church: "Grace Chapel", title: "Sunday Service", date: "Jun 22 · 9:00 AM", fill: "10/12" },
  { church: "Hope Community", title: "Worship Night", date: "Jun 22 · 6:00 PM", fill: "7/8" },
  { church: "Riverside Church", title: "Kids Sunday", date: "Jun 22 · 10:00 AM", fill: "6/9" },
  { church: "Cornerstone Bible", title: "Prayer Meeting", date: "Jun 25 · 7:00 PM", fill: "4/4" },
  { church: "New Life Fellowship", title: "Youth Service", date: "Jun 28 · 7:00 PM", fill: "3/6" },
  { church: "Grace Chapel", title: "Evening Worship", date: "Jun 28 · 7:00 PM", fill: "5/8" },
];

function SysSchedulingPage() {
  return (
    <OperatorShell title="Scheduling" subtitle="Read-only platform view">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Scheduling</h2>
            <p className="mt-1 text-sm text-muted-foreground inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Cross-church scheduling · writes are disabled
            </p>
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="h-9 w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All churches</SelectItem>
              <SelectItem value="grace">Grace Chapel</SelectItem>
              <SelectItem value="hope">Hope Community</SelectItem>
              <SelectItem value="riverside">Riverside Church</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="overflow-hidden rounded-lg border border-border p-0 shadow-card">
          <ul className="divide-y divide-border">
            {events.map((e, i) => (
              <li key={i} className="flex items-center gap-4 px-4 py-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.church} · {e.date}</p>
                </div>
                <Badge variant="outline" className="border-border bg-muted/50">{e.fill} filled</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </OperatorShell>
  );
}
