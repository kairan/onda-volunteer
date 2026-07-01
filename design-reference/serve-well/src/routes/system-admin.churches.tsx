import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { OperatorShell } from "@/components/onda/AppShell";
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
import { ChurchDialog, ConfirmDeleteDialog } from "@/components/onda/modals";

export const Route = createFileRoute("/system-admin/churches")({
  head: () => ({ meta: [{ title: "Churches · Operator · Onda" }] }),
  component: ChurchesPage,
});

const churches = [
  { name: "Grace Chapel", city: "Austin, TX", campuses: 2, admins: 3, volunteers: 248, status: "Active" },
  { name: "Hope Community", city: "Denver, CO", campuses: 1, admins: 2, volunteers: 137, status: "Active" },
  { name: "Riverside Church", city: "Portland, OR", campuses: 3, admins: 4, volunteers: 412, status: "Active" },
  { name: "New Life Fellowship", city: "Nashville, TN", campuses: 1, admins: 1, volunteers: 56, status: "Onboarding" },
  { name: "Cornerstone Bible", city: "Phoenix, AZ", campuses: 2, admins: 3, volunteers: 198, status: "Active" },
  { name: "Northridge Faith", city: "Seattle, WA", campuses: 1, admins: 2, volunteers: 89, status: "Active" },
];

function ChurchesPage() {
  return (
    <OperatorShell title="Churches" subtitle="All tenants">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Churches</h2>
            <p className="mt-1 text-sm text-muted-foreground">{churches.length} active tenants</p>
          </div>
          <ChurchDialog
            trigger={
              <Button size="sm"><Plus className="h-4 w-4" /> New church</Button>
            }
          />
        </div>
        <Card className="overflow-hidden rounded-lg border border-border p-0 shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Church</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Campuses</TableHead>
                <TableHead className="text-right">Admins</TableHead>
                <TableHead className="text-right">Volunteers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {churches.map((c) => (
                <TableRow key={c.name}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.city}</TableCell>
                  <TableCell className="text-right">{c.campuses}</TableCell>
                  <TableCell className="text-right">{c.admins}</TableCell>
                  <TableCell className="text-right">{c.volunteers}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={c.status === "Active" ? "border-primary/20 bg-primary/10 text-primary" : "border-amber-200 bg-amber-50 text-amber-800"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <ChurchDialog
                        mode="edit"
                        initial={{ name: c.name, city: c.city }}
                        trigger={
                          <Button size="icon" variant="ghost" aria-label="Edit church">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <ConfirmDeleteDialog
                        title={`Archive ${c.name}?`}
                        description="Archived tenants lose access. Data is retained for 30 days."
                        confirmLabel="Archive"
                        trigger={
                          <Button size="icon" variant="ghost" aria-label="Archive church">
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
    </OperatorShell>
  );
}
