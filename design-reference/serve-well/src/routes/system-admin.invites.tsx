import { createFileRoute } from "@tanstack/react-router";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { OperatorShell } from "@/components/onda/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminInviteDialog, ConfirmDeleteDialog } from "@/components/onda/modals";

export const Route = createFileRoute("/system-admin/invites")({
  head: () => ({ meta: [{ title: "Admin Invites · Operator · Onda" }] }),
  component: InvitesPage,
});

const invites = [
  { email: "pastor@newcity.church", church: "New City Church", sent: "2 days ago", status: "Pending" },
  { email: "admin@northridge.org", church: "Northridge Bible", sent: "5 days ago", status: "Pending" },
  { email: "leader@cornerstone.net", church: "Cornerstone Fellowship", sent: "1 week ago", status: "Expired" },
  { email: "ops@harvest.org", church: "Harvest Center", sent: "today", status: "Pending" },
  { email: "elder@livingword.org", church: "Living Word", sent: "3 days ago", status: "Accepted" },
];

function InvitesPage() {
  return (
    <OperatorShell title="Admin Invites" subtitle="Onboard church admins">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Admin invites</h2>
            <p className="mt-1 text-sm text-muted-foreground">Invite a church admin by email to bootstrap a new tenant</p>
          </div>
          <AdminInviteDialog
            trigger={
              <Button size="sm"><Send className="h-4 w-4" /> New invite</Button>
            }
          />
        </div>

        <Card className="rounded-lg border border-border p-5 shadow-card">
          <form
            className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Invite sent");
              (e.currentTarget as HTMLFormElement).reset();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Admin email</Label>
              <Input id="invite-email" type="email" placeholder="admin@church.org" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-church">Church name</Label>
              <Input id="invite-church" placeholder="New Hope Church" required />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full sm:w-auto"><Send className="h-4 w-4" /> Send invite</Button>
            </div>
          </form>
        </Card>

        <Card className="overflow-hidden rounded-lg border border-border p-0 shadow-card">
          <ul className="divide-y divide-border">
            {invites.map((i) => (
              <li key={i.email} className="flex items-center gap-4 px-4 py-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{i.email}</p>
                  <p className="text-xs text-muted-foreground">{i.church} · sent {i.sent}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    i.status === "Pending" ? "border-amber-200 bg-amber-50 text-amber-800"
                    : i.status === "Accepted" ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-border bg-muted text-muted-foreground"
                  }
                >
                  {i.status}
                </Badge>
                {i.status !== "Accepted" && (
                  <Button size="sm" variant="ghost" onClick={() => toast.success(`Invite resent to ${i.email}`)}>
                    Resend
                  </Button>
                )}
                {i.status !== "Accepted" && (
                  <ConfirmDeleteDialog
                    title="Revoke this invite?"
                    description={`${i.email} will no longer be able to accept this invite.`}
                    confirmLabel="Revoke"
                    trigger={
                      <Button size="sm" variant="ghost">Revoke</Button>
                    }
                  />
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </OperatorShell>
  );
}
