import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { useOrganization } from '@/organization/OrganizationContextProvider';
import { fetchMinistryRoles, type MinistryRole } from '@/organization/fetchMinistryDetails';
import { createMinistryRole, updateMinistryRole } from '@/organization/roleActions';
import { Button } from '@/components/ui/button';
import { useToasts } from '@/feedback/ToastHost';

import { DestructiveConfirmDialog } from '@/components/DestructiveConfirmDialog';

export function MinistriesPage() {
  const { t } = useTranslation(['ministries', 'common']);
  const auth = useAuthSession();
  const { activeChurch } = useOrganization();
  const toasts = useToasts();

  const [selectedMinistryId, setSelectedMinistryId] = useState('');
  const [roles, setRoles] = useState<MinistryRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [newRoleName, setNewRoleName] = useState('');

  const volunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : undefined;

  const accessibleMinistries = useMemo(() => activeChurch?.ministries ?? [], [activeChurch]);

  useEffect(() => {
    if (accessibleMinistries.length > 0 && !selectedMinistryId) {
      setSelectedMinistryId(accessibleMinistries[0].id);
    }
  }, [accessibleMinistries, selectedMinistryId]);

  const loadRoles = async () => {
    if (!selectedMinistryId) return;
    setLoading(true);
    try {
      const data = await fetchMinistryRoles({ ministryId: selectedMinistryId, volunteerId });
      setRoles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRoles();
  }, [selectedMinistryId, volunteerId]);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMinistryId || !newRoleName) return;
    setBusy(true);
    try {
      await createMinistryRole({ ministryId: selectedMinistryId, name: newRoleName, volunteerId });
      toasts.push({ id: crypto.randomUUID(), kind: 'success', message: 'Role added' });
      setNewRoleName('');
      void loadRoles();
    } catch (err) {
      toasts.push({ id: crypto.randomUUID(), kind: 'error', message: 'Failed to add role' });
    } finally {
      setBusy(false);
    }
  };

  const handleRetireRole = async (roleId: string) => {
    setBusy(true);
    try {
      await updateMinistryRole({ ministryId: selectedMinistryId, roleId, retired: true, volunteerId });
      toasts.push({ id: crypto.randomUUID(), kind: 'success', message: 'Role retired' });
      void loadRoles();
    } catch (err) {
      toasts.push({ id: crypto.randomUUID(), kind: 'error', message: 'Failed to retire role' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-8">
      <header className="border-2 border-border bg-surface p-6 shadow-[8px_8px_0_0_hsl(var(--border))]">
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight">
          Ministries
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage your team roles and catalog.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
           <div className="border-2 border-border bg-surface p-4 flex flex-col gap-4">
              <h2 className="text-sm font-bold uppercase tracking-wider">Select Ministry</h2>
              <div className="flex flex-col gap-1">
                {accessibleMinistries.map(m => (
                  <button
                    key={m.id}
                    className={`text-left px-3 py-2 text-sm font-bold uppercase transition-colors ${selectedMinistryId === m.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => setSelectedMinistryId(m.id)}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
           <div className="border-2 border-border bg-surface p-6">
              <h2 className="font-display text-xl font-bold uppercase tracking-tight mb-6">Role Catalog</h2>
              
              {loading ? (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-10 w-full animate-pulse bg-surface-2 border-2 border-border" />)}
                </div>
              ) : roles.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No roles defined yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {roles.map(r => (
                    <div key={r.id} className="border-2 border-border p-3 flex justify-between items-center group">
                       <input
                         type="text"
                         className="flex-1 bg-transparent font-bold text-sm uppercase outline-none focus:ring-2 focus:ring-primary px-1"
                         defaultValue={r.name}
                         onBlur={async (e) => {
                           if (e.target.value && e.target.value !== r.name) {
                             try {
                               await updateMinistryRole({ ministryId: selectedMinistryId, roleId: r.id, name: e.target.value, volunteerId });
                               toasts.push({ id: crypto.randomUUID(), kind: 'success', message: 'Role renamed' });
                               void loadRoles();
                             } catch (err) {
                               toasts.push({ id: crypto.randomUUID(), kind: 'error', message: 'Failed to rename role' });
                             }
                           }
                         }}
                         disabled={busy}
                       />
                       <DestructiveConfirmDialog
                         trigger={
                           <Button
                            variant="outline"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={busy}
                           >
                             Retire
                           </Button>
                         }
                         title="Retire Role?"
                         description={`Are you sure you want to retire the "${r.name}" role? It will no longer be available for new assignments.`}
                         onConfirm={() => void handleRetireRole(r.id)}
                         confirmLabel="Yes, retire role"
                       />
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleCreateRole} className="mt-8 flex gap-2">
                 <input
                   type="text"
                   className="flex-1 border-2 border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                   placeholder="New role name..."
                   value={newRoleName}
                   onChange={e => setNewRoleName(e.target.value)}
                   required
                 />
                 <Button type="submit" disabled={busy || !newRoleName}>
                   Add Role
                 </Button>
              </form>
           </div>
        </div>
      </div>
    </section>
  );
}
