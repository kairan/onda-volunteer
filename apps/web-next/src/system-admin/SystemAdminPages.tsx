import { useTranslation } from 'react-i18next';
import { PlaceholderPage } from '@/routes/placeholderPage';

export function SystemAdminDashboardPage() {
  return (
    <PlaceholderPage
      namespace="systemAdmin"
      titleKey="dashboard.title"
      bodyKey="dashboard.intro"
    />
  );
}

export function SystemAdminChurchesPage() {
  return (
    <PlaceholderPage
      namespace="systemAdmin"
      titleKey="churches.title"
      bodyKey="churches.intro"
    />
  );
}

export function SystemAdminChurchDetailPage() {
  return (
    <PlaceholderPage
      namespace="systemAdmin"
      titleKey="churches.title"
      bodyKey="churches.intro"
    />
  );
}

export function SystemAdminUsersPage() {
  return (
    <PlaceholderPage
      namespace="systemAdmin"
      titleKey="users.title"
      bodyKey="users.intro"
    />
  );
}

export function SystemAdminUserDetailPage() {
  return (
    <PlaceholderPage
      namespace="systemAdmin"
      titleKey="users.title"
      bodyKey="users.intro"
    />
  );
}

export function SystemAdminSchedulingPage() {
  return (
    <PlaceholderPage
      namespace="systemAdmin"
      titleKey="scheduling.title"
      bodyKey="scheduling.intro"
    />
  );
}

export function SystemAdminSchedulingEventDetailPage({
  data,
}: {
  data: import('@/eventDetailPayload').EventDetailPayload;
}) {
  const { t } = useTranslation('systemAdmin');
  return (
    <section className="flex flex-col gap-3">
      <h1 className="text-2xl font-semibold">{data.event.title}</h1>
      <p className="text-sm text-muted-foreground">{t('scheduling.readOnlyNotice')}</p>
    </section>
  );
}
