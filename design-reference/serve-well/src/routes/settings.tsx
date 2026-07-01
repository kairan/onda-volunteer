import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/onda/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDeleteDialog } from "@/components/onda/modals";
import { useCampus, TIMEZONES, type Campus } from "@/lib/campus";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Onda" },
      { name: "description", content: "Church-wide preferences and policies." },
    ],
  }),
  component: SettingsPage,
});

function CampusFormDialog({
  trigger,
  initial,
  onSubmit,
  title,
}: {
  trigger: React.ReactNode;
  initial?: Partial<Campus>;
  onSubmit: (data: { name: string; city: string; timezone: string }) => void;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [timezone, setTimezone] = useState(initial?.timezone ?? "America/Sao_Paulo");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Campus details are visible to volunteers on this location.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="c-name">Campus name</Label>
            <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Onda · Nome" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-city">City</Label>
            <Input id="c-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade, UF" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-tz">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="c-tz"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (!name.trim() || !city.trim()) {
                toast.error("Name and city are required");
                return;
              }
              onSubmit({ name: name.trim(), city: city.trim(), timezone });
              setOpen(false);
            }}
          >
            Save campus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SettingsPage() {
  const { campus, campuses, updateCampus, addCampus, removeCampus } = useCampus();

  return (
    <AppShell title="Settings" subtitle="Church preferences">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight font-display">Settings</h2>
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
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address">Primary address</Label>
              <Input id="address" defaultValue="1200 Congress Ave, Austin, TX" />
            </div>
          </div>
        </Card>

        <Card className="rounded-lg border border-border p-6 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">Campuses</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Each campus has its own timezone. Currently active:{" "}
                <span className="font-medium text-foreground">{campus.name}</span>
              </p>
            </div>
            <CampusFormDialog
              title="Add campus"
              onSubmit={(data) => {
                addCampus(data);
                toast.success(`${data.name} created`);
              }}
              trigger={
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  Add campus
                </Button>
              }
            />
          </div>

          <div className="mt-5 divide-y divide-border rounded-md border border-border">
            {campuses.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.city}</div>
                </div>
                <div className="hidden sm:block w-56">
                  <Select
                    value={c.timezone}
                    onValueChange={(v) => {
                      updateCampus(c.id, { timezone: v });
                      toast.success(`${c.name} timezone → ${v}`);
                    }}
                  >
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <CampusFormDialog
                  title={`Edit ${c.name}`}
                  initial={c}
                  onSubmit={(data) => {
                    updateCampus(c.id, data);
                    toast.success("Campus updated");
                  }}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="Edit campus">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  }
                />
                <ConfirmDeleteDialog
                  title={`Delete ${c.name}?`}
                  description="This campus and its scheduling data will be removed. This cannot be undone."
                  confirmLabel="Delete campus"
                  onConfirm={() => {
                    if (campuses.length <= 1) {
                      toast.error("Keep at least one campus");
                      return;
                    }
                    removeCampus(c.id);
                    toast.success(`${c.name} removed`);
                  }}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete campus"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            ))}
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

        <div className="flex justify-between gap-2">
          <ConfirmDeleteDialog
            title="Delete this church?"
            description="All ministries, events, and volunteer history will be permanently removed. This cannot be undone."
            confirmLabel="Delete church"
            trigger={<Button variant="outline" className="text-destructive hover:text-destructive">Delete church</Button>}
          />
          <div className="flex gap-2">
            <Button variant="outline">Cancel</Button>
            <Button onClick={() => toast.success("Settings saved")}>Save changes</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
