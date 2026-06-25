import { fetchWithProtectedHeaders } from '@/apiAuthHeaders';
import { apiErrorFromResponse } from '@/apiError';

export type ReleaseAssignmentResult = {
  ministryId: string;
  window: {
    startsAtUtc: string;
    endsAtUtc: string;
  };
};

export async function releaseAssignment(input: {
  assignmentId: string;
  volunteerId: string;
}): Promise<ReleaseAssignmentResult> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const res = await fetchWithProtectedHeaders(
    `${base}/assignments/${input.assignmentId}/release`,
    { volunteerId: input.volunteerId },
    {
      method: 'POST',
    },
  );
  if (!res.ok) {
    throw await apiErrorFromResponse(res);
  }
  return res.json() as Promise<ReleaseAssignmentResult>;
}
