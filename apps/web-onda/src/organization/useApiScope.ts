import { useAuthSession } from '@/auth/AuthSessionProvider';
import type { ProtectedScope } from '@/api/apiClient';
import { useOrganization } from './OrganizationProvider';

export function useApiScope(): ProtectedScope {
  const { workingContext } = useOrganization();
  const auth = useAuthSession();
  const volunteerId =
    auth.status === 'authenticated' || auth.status === 'dev-bypass'
      ? auth.volunteerId
      : undefined;

  return {
    volunteerId,
    leaderMinistryId:
      workingContext?.mode === 'leader'
        ? workingContext.ministryId
        : undefined,
  };
}
