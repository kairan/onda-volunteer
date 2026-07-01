import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { User, Bell, Lock, LogOut } from "lucide-react";
import { AppShell } from "@/components/onda/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRole, ROLE_LABELS } from "@/lib/role";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

function AccountPage() {
  const { role } = useRole();
  const [profile, setProfile] = useState({
    name: "Ana Moreira",
    email: "ana.moreira@onda.app",
    phone: "+55 11 99999-0000",
  });
  const [prefs, setPrefs] = useState({
    emailReminders: true,
    pushReminders: false,
    weeklyDigest: true,
  });

  return (
    <AppShell title="Account settings" subtitle="Manage your profile, notifications and security">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary text-primary-foreground">AM</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-semibold">{profile.name}</p>
              <p className="text-xs text-muted-foreground">{profile.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">Role: {ROLE_LABELS[role]}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.success("Avatar updated")}>
              Change photo
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
            <TabsTrigger value="security"><Lock className="mr-2 h-4 w-4" />Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personal info</CardTitle>
                <CardDescription>Keep your contact details up to date.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => toast.success("Profile saved")}>Save changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification preferences</CardTitle>
                <CardDescription>Choose how Onda contacts you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "emailReminders", label: "Email reminders", desc: "Receive emails before your scheduled events." },
                  { key: "pushReminders", label: "Push notifications", desc: "Get instant alerts on your device." },
                  { key: "weeklyDigest", label: "Weekly digest", desc: "Summary of upcoming serves every Monday." },
                ].map((p) => (
                  <div key={p.key} className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">{p.label}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                    <Switch
                      checked={prefs[p.key as keyof typeof prefs]}
                      onCheckedChange={(v) => {
                        setPrefs({ ...prefs, [p.key]: v });
                        toast.success("Preferences updated");
                      }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Password & access</CardTitle>
                <CardDescription>Update your password and manage sessions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current">Current password</Label>
                  <Input id="current" type="password" placeholder="••••••••" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new">New password</Label>
                  <Input id="new" type="password" placeholder="••••••••" />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => toast.success("Password updated")}>Update password</Button>
                </div>
                <Separator />
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => toast("Signed out (demo)")}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out of all devices
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
