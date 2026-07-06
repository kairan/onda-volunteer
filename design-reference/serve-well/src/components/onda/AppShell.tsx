import { Link } from "@tanstack/react-router";
import { Bell, Search, Shield, User, Settings, LogOut, Building2, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppSidebar, SystemAdminSidebar } from "./AppSidebar";
import { useRole, ROLE_LABELS, type Role } from "@/lib/role";
import { useCampus, CAMPUS_REGIONS } from "@/lib/campus";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

function CampusSwitcher({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { campus, campuses, setCampusId } = useCampus();
  const isDark = variant === "dark";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={
            "flex h-9 items-center gap-2 rounded-md border px-2.5 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring " +
            (isDark
              ? "border-background/20 bg-background/5 text-background hover:bg-background/10"
              : "border-border bg-background hover:bg-accent")
          }
          aria-label="Switch campus"
        >
          <Building2 className="h-4 w-4 shrink-0" />
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-xs font-semibold truncate max-w-[140px]">{campus.name}</span>
            <span className={"text-[10px] truncate max-w-[140px] " + (isDark ? "text-background/60" : "text-muted-foreground")}>{campus.city}</span>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
          Campus / Igreja
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {CAMPUS_REGIONS.map((region) => {
          const regionCampuses = campuses.filter((c) => c.region === region);
          if (regionCampuses.length === 0) return null;
          return (
            <div key={region}>
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {region}
              </DropdownMenuLabel>
              {regionCampuses.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => {
                    setCampusId(c.id);
                    toast.success(`Switched to ${c.name}`);
                  }}
                  className="flex items-start gap-2"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.city}</div>
                  </div>
                  {c.id === campus.id && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </div>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings" className="text-xs text-muted-foreground">
            Manage churches…
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu({ variant = "light" }: { variant?: "light" | "dark" }) {
  const isDark = variant === "dark";
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const email = user?.email ?? "—";
  const initials = (email.match(/[a-zA-Z]/g) ?? ["A"]).slice(0, 2).join("").toUpperCase();
  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Open account menu"
        >
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarFallback
              className={
                isDark
                  ? "bg-background text-foreground text-xs"
                  : "bg-primary text-primary-foreground text-xs"
              }
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Signed in</span>
            <span className="text-xs font-normal text-muted-foreground truncate">
              {email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/account">
            <User className="mr-2 h-4 w-4" />
            Account settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Church settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { role, setRole } = useRole();
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur md:px-6">
      <SidebarTrigger />
      <CampusSwitcher />
      <div className="hidden xl:block">
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
        <UserMenu />
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
              <CampusSwitcher variant="dark" />
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-background hover:bg-background/10 hover:text-background"
              >
                <Link to="/">Exit operator mode</Link>
              </Button>
              <UserMenu variant="dark" />
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
