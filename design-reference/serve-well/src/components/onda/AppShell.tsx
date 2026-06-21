import { Link } from "@tanstack/react-router";
import { Bell, Search, Shield } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppSidebar, SystemAdminSidebar } from "./AppSidebar";
import { useRole, ROLE_LABELS, type Role } from "@/lib/role";
import type { ReactNode } from "react";

function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { role, setRole } = useRole();
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur md:px-6">
      <SidebarTrigger />
      <div className="hidden md:block">
        <h1 className="text-sm font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search…" className="h-9 w-64 pl-8" />
        </div>
        <Select value={role} onValueChange={(v) => setRole(v as Role)}>
          <SelectTrigger className="h-9 w-[180px]" aria-label="Switch role (demo)">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" asChild aria-label="System admin">
          <Link to="/system-admin">
            <Shield className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            AM
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-sans">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopBar title={title} subtitle={subtitle} />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function OperatorShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[oklch(0.2428_0.0760_277.02)] font-sans text-background">
        <SystemAdminSidebar />
        <div className="flex flex-1 flex-col bg-background text-foreground">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-foreground px-4 text-background md:px-6">
            <SidebarTrigger className="text-background hover:bg-background/10" />
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <div>
                <h1 className="text-sm font-semibold tracking-tight">{title}</h1>
                {subtitle && <p className="text-xs text-background/60">{subtitle}</p>}
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-background hover:bg-background/10 hover:text-background"
              >
                <Link to="/">Exit operator mode</Link>
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-background text-foreground text-xs">
                  OP
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
