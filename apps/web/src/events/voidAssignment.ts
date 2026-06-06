import { fetchWithProtectedHeaders } from '@/apiAuthHeaders';
import { apiErrorFromResponse } from '@/apiError';

export type VoidAssignmentResult = {
  id: string;
  voidedAtUtc: string;
};

export async function voidAssignment(input: {
  assignmentId: string;
  actingVolunteerId: string;
}): Promise<VoidAssignmentResult> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const res = await fetchWithProtectedHeaders(
    `${base}/assignments/${input.assignmentId}/void`,
    { volunteerId: input.actingVolunteerId },
    {
      method: 'POST',
    },
  );
  if (!res.ok) {
    throw await apiErrorFromResponse(res);
  }
  return res.json() as Promise<VoidAssignmentResult>;
}
