import { Link, useRouterState } from '@tanstack/react-router';
import {
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
import { IgrejaOndaWordmark } from '@/components/brand/IgrejaOndaWordmark';
import { BrandGrafismo } from '@/components/brand/BrandGrafismo';
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
          <IgrejaOndaWordmark
            variant="preto"
            compact
            className="hidden group-data-[collapsible=icon]:block"
          />
          <div className="flex flex-col gap-0.5 leading-tight group-data-[collapsible=icon]:hidden">
            <IgrejaOndaWordmark variant="preto" className="max-h-6" />
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

      <SidebarContent className="relative overflow-hidden">
        <BrandGrafismo
          variant="line"
          opacity={0.1}
          className="sidebar-brand-watermark pointer-events-none absolute -bottom-6 -right-4 w-44 object-contain print:hidden"
        />
        <nav aria-label="Primary" className="relative z-10">
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
