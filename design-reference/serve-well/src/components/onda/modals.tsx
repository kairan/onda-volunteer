import { useState, type ReactNode, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

/* -------------------------------------------------------------------------- */
/* Confirm delete                                                             */
/* -------------------------------------------------------------------------- */

export function ConfirmDeleteDialog({
  trigger,
  title = "Delete this item?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  onConfirm,
}: {
  trigger: ReactNode;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm?: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              onConfirm?.();
              toast.success(`${confirmLabel} confirmed`);
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Generic form dialog wrapper                                                */
/* -------------------------------------------------------------------------- */

function FormDialog({
  trigger,
  title,
  description,
  submitLabel = "Save",
  onSubmit,
  children,
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  submitLabel?: string;
  onSubmit?: (close: () => void) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            onSubmit?.(close);
            close();
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="space-y-4 py-4">{children}</div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Time away                                                                  */
/* -------------------------------------------------------------------------- */

export function TimeAwayDialog({
  trigger,
  mode = "create",
  initial,
}: {
  trigger: ReactNode;
  mode?: "create" | "edit";
  initial?: { from?: string; to?: string; reason?: string };
}) {
  return (
    <FormDialog
      trigger={trigger}
      title={mode === "edit" ? "Edit time away" : "Add time away"}
      description="Pick the dates you're unavailable to serve."
      submitLabel={mode === "edit" ? "Save changes" : "Add period"}
      onSubmit={() =>
        toast.success(mode === "edit" ? "Time away updated" : "Time away added")
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="ta-from">From</Label>
          <Input id="ta-from" type="date" defaultValue={initial?.from} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ta-to">To</Label>
          <Input id="ta-to" type="date" defaultValue={initial?.to} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ta-reason">Reason (optional)</Label>
        <Input
          id="ta-reason"
          defaultValue={initial?.reason}
          placeholder="Family vacation"
        />
      </div>
    </FormDialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Event                                                                      */
/* -------------------------------------------------------------------------- */

const MINISTRY_OPTIONS = ["Worship", "Kids", "Hospitality", "Tech & Media", "Prayer", "Youth"] as const;

export function EventDialog({
  trigger,
  mode = "create",
  initial,
  lockBasics = false,
  onlyMinistry,
}: {
  trigger: ReactNode;
  mode?: "create" | "edit" | "claim";
  initial?: { title?: string; date?: string; location?: string; ministries?: string[] };
  /** When true, name & date are read-only (used by ministry leaders claiming an event). */
  lockBasics?: boolean;
  /** When set, restrict the ministry pickers to a single ministry (leader claim flow). */
  onlyMinistry?: string;
}) {
  const initialMinistries = new Set(initial?.ministries ?? []);
  const [selected, setSelected] = useState<Set<string>>(initialMinistries);
  const toggle = (m: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });
  };

  const isClaim = mode === "claim";
  const title = isClaim
    ? `Assign ${onlyMinistry ?? "ministry"} to event`
    : mode === "edit"
      ? "Edit event"
      : "New event";
  const submitLabel = isClaim
    ? "Add my ministry"
    : mode === "edit"
      ? "Save event"
      : "Create event";
  const description = isClaim
    ? "Only the church admin can change the event name or date."
    : "Plan an event and open it for roster assignment. Ministries are optional — leaders can claim it later.";

  const ministryList = onlyMinistry ? [onlyMinistry] : MINISTRY_OPTIONS;

  return (
    <FormDialog
      trigger={trigger}
      title={title}
      description={description}
      submitLabel={submitLabel}
      onSubmit={() =>
        toast.success(
          isClaim
            ? `${onlyMinistry} added to ${initial?.title ?? "event"}`
            : mode === "edit"
              ? "Event updated"
              : selected.size === 0
                ? "Event created (no ministry yet)"
                : `Event created · ${selected.size} ministr${selected.size === 1 ? "y" : "ies"}`,
        )
      }
    >
      <div className="space-y-1.5">
        <Label htmlFor="ev-title">
          Event name {lockBasics && <span className="text-xs text-muted-foreground">(locked)</span>}
        </Label>
        <Input
          id="ev-title"
          defaultValue={initial?.title}
          placeholder="Sunday Service"
          required
          readOnly={lockBasics}
          disabled={lockBasics}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="ev-date">
            Date & time {lockBasics && <span className="text-xs text-muted-foreground">(locked)</span>}
          </Label>
          <Input
            id="ev-date"
            type="datetime-local"
            defaultValue={initial?.date}
            required
            readOnly={lockBasics}
            disabled={lockBasics}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ev-location">Location</Label>
          <Input
            id="ev-location"
            defaultValue={initial?.location}
            placeholder="Main Auditorium"
            readOnly={lockBasics}
            disabled={lockBasics}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Label>Ministries {isClaim ? "" : <span className="text-xs font-normal text-muted-foreground">(optional · pick one or many)</span>}</Label>
          {!isClaim && selected.size > 0 && (
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-muted/20 p-2">
          {ministryList.map((m) => {
            const checked = selected.has(m);
            return (
              <label
                key={m}
                className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm transition ${
                  checked ? "bg-primary/10 text-primary" : "hover:bg-background"
                }`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggle(m)}
                />
                <span>{m}</span>
              </label>
            );
          })}
        </div>
        {!isClaim && selected.size === 0 && (
          <p className="text-xs text-muted-foreground">
            No ministry selected — leaders will be able to claim this event for their team.
          </p>
        )}
      </div>
      {!lockBasics && (
        <div className="space-y-1.5">
          <Label htmlFor="ev-notes">Notes</Label>
          <Textarea id="ev-notes" placeholder="Optional notes for the team" rows={3} />
        </div>
      )}
    </FormDialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Ministry                                                                   */
/* -------------------------------------------------------------------------- */

export function MinistryDialog({
  trigger,
  mode = "create",
  initial,
}: {
  trigger: ReactNode;
  mode?: "create" | "edit";
  initial?: { name?: string; leader?: string };
}) {
  return (
    <FormDialog
      trigger={trigger}
      title={mode === "edit" ? "Edit ministry" : "Add ministry"}
      submitLabel={mode === "edit" ? "Save ministry" : "Create ministry"}
      onSubmit={() =>
        toast.success(mode === "edit" ? "Ministry updated" : "Ministry created")
      }
    >
      <div className="space-y-1.5">
        <Label htmlFor="m-name">Ministry name</Label>
        <Input id="m-name" defaultValue={initial?.name} placeholder="Worship" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="m-leader">Leader</Label>
        <Input id="m-leader" defaultValue={initial?.leader} placeholder="Search leaders…" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="m-desc">Description</Label>
        <Textarea id="m-desc" rows={3} placeholder="What this ministry does" />
      </div>
    </FormDialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Leader                                                                     */
/* -------------------------------------------------------------------------- */

export function LeaderDialog({
  trigger,
  mode = "create",
  initial,
}: {
  trigger: ReactNode;
  mode?: "create" | "edit";
  initial?: { name?: string; email?: string; ministry?: string };
}) {
  return (
    <FormDialog
      trigger={trigger}
      title={mode === "edit" ? "Edit leader" : "Add leader"}
      description="Leaders can manage their ministry roster and events."
      submitLabel={mode === "edit" ? "Save leader" : "Send invite"}
      onSubmit={() =>
        toast.success(mode === "edit" ? "Leader updated" : "Leader invited")
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="l-name">Name</Label>
          <Input id="l-name" defaultValue={initial?.name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="l-email">Email</Label>
          <Input id="l-email" type="email" defaultValue={initial?.email} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="l-ministry">Ministry</Label>
        <Select defaultValue={initial?.ministry?.toLowerCase() ?? "worship"}>
          <SelectTrigger id="l-ministry">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="worship">Worship</SelectItem>
            <SelectItem value="kids">Kids</SelectItem>
            <SelectItem value="hospitality">Hospitality</SelectItem>
            <SelectItem value="tech">Tech & Media</SelectItem>
            <SelectItem value="prayer">Prayer</SelectItem>
            <SelectItem value="youth">Youth</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FormDialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Volunteer invite / edit                                                    */
/* -------------------------------------------------------------------------- */

export function VolunteerDialog({
  trigger,
  mode = "create",
  initial,
}: {
  trigger: ReactNode;
  mode?: "create" | "edit";
  initial?: { name?: string; email?: string };
}) {
  return (
    <FormDialog
      trigger={trigger}
      title={mode === "edit" ? "Edit volunteer" : "Invite volunteer"}
      submitLabel={mode === "edit" ? "Save volunteer" : "Send invite"}
      onSubmit={() =>
        toast.success(mode === "edit" ? "Volunteer updated" : "Invite sent")
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="v-name">Name</Label>
          <Input id="v-name" defaultValue={initial?.name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="v-email">Email</Label>
          <Input id="v-email" type="email" defaultValue={initial?.email} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="v-ministry">Default ministry</Label>
        <Select defaultValue="worship">
          <SelectTrigger id="v-ministry">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="worship">Worship</SelectItem>
            <SelectItem value="kids">Kids</SelectItem>
            <SelectItem value="hospitality">Hospitality</SelectItem>
            <SelectItem value="tech">Tech & Media</SelectItem>
            <SelectItem value="prayer">Prayer</SelectItem>
            <SelectItem value="youth">Youth</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FormDialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Slot assign                                                                */
/* -------------------------------------------------------------------------- */

export function AssignSlotDialog({
  trigger,
  role,
  event,
}: {
  trigger: ReactNode;
  role?: string;
  event?: string;
}) {
  return (
    <FormDialog
      trigger={trigger}
      title="Assign volunteer"
      description={
        role && event ? `${event} · ${role}` : "Pick a volunteer for this slot."
      }
      submitLabel="Assign"
      onSubmit={() => toast.success("Volunteer assigned")}
    >
      <div className="space-y-1.5">
        <Label htmlFor="slot-vol">Volunteer</Label>
        <Select defaultValue="sarah">
          <SelectTrigger id="slot-vol">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sarah">Sarah Chen</SelectItem>
            <SelectItem value="michael">Michael Torres</SelectItem>
            <SelectItem value="priya">Priya Patel</SelectItem>
            <SelectItem value="daniel">Daniel Park</SelectItem>
            <SelectItem value="james">James O'Connor</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="slot-note">Note for the volunteer</Label>
        <Textarea id="slot-note" rows={3} placeholder="Optional" />
      </div>
    </FormDialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Church (system admin)                                                      */
/* -------------------------------------------------------------------------- */

export function ChurchDialog({
  trigger,
  mode = "create",
  initial,
}: {
  trigger: ReactNode;
  mode?: "create" | "edit";
  initial?: { name?: string; city?: string };
}) {
  return (
    <FormDialog
      trigger={trigger}
      title={mode === "edit" ? "Edit church" : "New church"}
      description="Tenants are isolated — admins can only see their own data."
      submitLabel={mode === "edit" ? "Save church" : "Create tenant"}
      onSubmit={() =>
        toast.success(mode === "edit" ? "Church updated" : "Church created")
      }
    >
      <div className="space-y-1.5">
        <Label htmlFor="ch-name">Church name</Label>
        <Input id="ch-name" defaultValue={initial?.name} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="ch-city">City</Label>
          <Input id="ch-city" defaultValue={initial?.city} placeholder="Austin, TX" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ch-tz">Timezone</Label>
          <Input id="ch-tz" defaultValue="America/Chicago" />
        </div>
      </div>
    </FormDialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Admin invite (system admin)                                                */
/* -------------------------------------------------------------------------- */

export function AdminInviteDialog({
  trigger,
}: {
  trigger: ReactNode;
}) {
  return (
    <FormDialog
      trigger={trigger}
      title="Invite church admin"
      description="They'll receive an email to bootstrap their tenant."
      submitLabel="Send invite"
      onSubmit={() => toast.success("Invite sent")}
    >
      <div className="space-y-1.5">
        <Label htmlFor="ai-email">Admin email</Label>
        <Input id="ai-email" type="email" placeholder="admin@church.org" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ai-church">Church name</Label>
        <Input id="ai-church" placeholder="New Hope Church" required />
      </div>
    </FormDialog>
  );
}
