import { Link, useRouterState } from '@tanstack/react-router';
import {
  Building2,
  CalendarCheck,
  CalendarDays,
  CalendarOff,
  Church,
  ClipboardList,
  LayoutDashboard,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { pickActiveNavItem, type NavManifestItem } from '@/navigation/manifest';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { ReactNode } from 'react';

const NAV_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  myAssignments: CalendarCheck,
  timeAway: CalendarOff,
  scheduling: CalendarDays,
  roster: ClipboardList,
  volunteers: Users,
  ministries: Church,
  leaders: UserCog,
};

type AppSidebarProps = {
  churchName?: string;
  navItems: NavManifestItem[];
  showSystemAdminLink: boolean;
  showDevUserSelect: boolean;
  contextControls?: ReactNode;
};

export function AppSidebar({
  churchName,
  navItems,
  showSystemAdminLink,
  showDevUserSelect,
  contextControls,
}: AppSidebarProps) {
  const { t } = useTranslation('shell');
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeNavItem = pickActiveNavItem(navItems, pathname);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-card">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight">Onda</span>
            {churchName ? (
              <span className="text-xs text-muted-foreground">{churchName}</span>
            ) : null}
          </div>
        </Link>
      </SidebarHeader>

      {contextControls ? (
        <div className="border-b border-sidebar-border pt-2 group-data-[collapsible=icon]:hidden">
          {contextControls}
        </div>
      ) : null}

      <SidebarContent>
        <nav aria-label="Primary">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = NAV_ICONS[item.id] ?? LayoutDashboard;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={activeNavItem?.id === item.id}
                        tooltip={t(item.labelKey)}
                      >
                        <Link to={item.path}>
                          <Icon className="h-4 w-4" />
                          <span>{t(item.labelKey)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
                {showSystemAdminLink ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith('/system-admin')}
                      tooltip={t('nav.systemAdmin')}
                    >
                      <Link to="/system-admin">
                        <UserCog className="h-4 w-4" />
                        <span>{t('nav.systemAdmin')}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </nav>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {showDevUserSelect ? (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t('devPersona.switchUser')}>
                <Link to="/user-select">{t('devPersona.switchUser')}</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : null}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={t('help')}>
              <a href="https://example.com/help" target="_blank" rel="noreferrer">
                {t('help')}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
