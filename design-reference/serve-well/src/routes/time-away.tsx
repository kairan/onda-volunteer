import { createFileRoute } from "@tanstack/react-router";
import { Plus, Clock, Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/onda/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  { from: "Jul 5", to: "Jul 12", reason: "Family vacation" },
  { from: "Aug 2", to: "Aug 3", reason: "Wedding out of town" },
  { from: "Sep 14", to: "Sep 14", reason: "Medical appointment" },
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
          <Button size="sm">
            <Plus className="h-4 w-4" /> Add period
          </Button>
        </div>
        <Card className="rounded-lg border border-border p-0 shadow-card">
          <ul className="divide-y divide-border">
            {timeAway.map((t) => (
              <li key={t.reason} className="flex items-center gap-4 px-4 py-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.from} – {t.to}</p>
                  <p className="text-xs text-muted-foreground">{t.reason}</p>
                </div>
                <Button size="icon" variant="ghost" aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
