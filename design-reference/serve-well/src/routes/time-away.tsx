import { createFileRoute } from "@tanstack/react-router";
import { Plus, Clock, Pencil } from "lucide-react";
import { AppShell } from "@/components/onda/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { TimeAwayDialog, ConfirmDeleteDialog } from "@/components/onda/modals";

export const Route = createFileRoute("/time-away")({
  head: () => ({
    meta: [
      { title: "Time Away · Onda" },
      { name: "description", content: "Block out dates you can't serve." },
    ],
  }),
  component: TimeAwayPage,
});

const timeAway = [
  { from: "2025-07-05", to: "2025-07-12", reason: "Family vacation", label: "Jul 5 – Jul 12" },
  { from: "2025-08-02", to: "2025-08-03", reason: "Wedding out of town", label: "Aug 2 – Aug 3" },
  { from: "2025-09-14", to: "2025-09-14", reason: "Medical appointment", label: "Sep 14" },
];

function TimeAwayPage() {
  return (
    <AppShell title="Time Away" subtitle="Manage when you're unavailable">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Time away</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Periods when you won't be scheduled
            </p>
          </div>
          <TimeAwayDialog
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4" /> Add period
              </Button>
            }
          />
        </div>
        <Card className="rounded-lg border border-border p-0 shadow-card">
          <ul className="divide-y divide-border">
            {timeAway.map((t) => (
              <li key={t.reason} className="flex items-center gap-4 px-4 py-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.reason}</p>
                </div>
                <TimeAwayDialog
                  mode="edit"
                  initial={{ from: t.from, to: t.to, reason: t.reason }}
                  trigger={
                    <Button size="icon" variant="ghost" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  }
                />
                <ConfirmDeleteDialog
                  title="Remove this time away?"
                  description={`${t.label} · ${t.reason}`}
                  confirmLabel="Remove"
                  trigger={
                    <Button size="icon" variant="ghost" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
