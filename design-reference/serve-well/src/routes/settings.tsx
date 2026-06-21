import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/onda/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Onda" },
      { name: "description", content: "Church-wide preferences and policies." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="Church preferences">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">Configure Grace Chapel on Onda</p>
        </div>

        <Card className="rounded-lg border border-border p-6 shadow-card">
          <h3 className="text-base font-semibold">Church profile</h3>
          <p className="mt-1 text-sm text-muted-foreground">Public info shown to volunteers</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Church name</Label>
              <Input id="name" defaultValue="Grace Chapel" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tz">Timezone</Label>
              <Input id="tz" defaultValue="America/Chicago" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address">Primary address</Label>
              <Input id="address" defaultValue="1200 Congress Ave, Austin, TX" />
            </div>
          </div>
        </Card>

        <Card className="rounded-lg border border-border p-6 shadow-card">
          <h3 className="text-base font-semibold">Scheduling policy</h3>
          <div className="mt-4 space-y-4">
            {[
              { id: "auto", title: "Auto-assign from rotations", desc: "Fill open slots based on volunteer rotation order.", on: true },
              { id: "remind", title: "Send reminders 48h before", desc: "Email and push reminders to scheduled volunteers.", on: true },
              { id: "swap", title: "Allow volunteer swaps", desc: "Let volunteers request swaps without leader approval.", on: false },
            ].map((p) => (
              <div key={p.id} className="flex items-start justify-between gap-4">
                <div>
                  <Label htmlFor={p.id} className="text-sm font-medium">{p.title}</Label>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
                <Switch id={p.id} defaultChecked={p.on} />
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save changes</Button>
        </div>
      </div>
    </AppShell>
  );
}
