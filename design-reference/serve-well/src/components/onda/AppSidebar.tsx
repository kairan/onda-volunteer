import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarOff,
  Users,
  Church,
  CalendarDays,
  ClipboardList,
  UserCog,
  Settings,
  Building2,
  Send,
  Eye,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRole, type Role } from "@/lib/role";

type Item = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
};

const navByRole: Record<Role, Item[]> = {
  volunteer: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "My Assignments", url: "/assignments", icon: CalendarCheck },
    { title: "Time Away", url: "/time-away", icon: CalendarOff },
  ],
  leader: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Events", url: "/events", icon: CalendarDays },
    { title: "Roster", url: "/roster", icon: ClipboardList },
    { title: "Volunteers", url: "/volunteers", icon: Users },
    { title: "Time Away", url: "/time-away", icon: CalendarOff },
  ],
  admin: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Scheduling", url: "/scheduling", icon: CalendarDays },
    { title: "Ministries", url: "/ministries", icon: Church },
    { title: "Volunteers", url: "/volunteers", icon: Users },
    { title: "Leaders", url: "/leaders", icon: UserCog },
    { title: "Settings", url: "/settings", icon: Settings },
  ],
};

export function AppSidebar() {
  const { role } = useRole();
  const items = navByRole[role];
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">Onda</span>
            <span className="text-xs text-muted-foreground">Grace Chapel</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function SystemAdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items: Item[] = [
    { title: "Overview", url: "/system-admin", icon: LayoutDashboard },
    { title: "Churches", url: "/system-admin/churches", icon: Church },
    { title: "Volunteers", url: "/system-admin/volunteers", icon: Users },
    { title: "Admin Invites", url: "/system-admin/invites", icon: Send },
    { title: "Scheduling", url: "/system-admin/scheduling", icon: Eye, hint: "read-only" },
  ];
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/system-admin" className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
            <Settings className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">Onda</span>
            <span className="text-xs text-muted-foreground">System operator</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                      {item.hint && (
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {item.hint}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
