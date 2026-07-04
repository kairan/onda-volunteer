import { mutateJson } from '@/api/apiClient';

export type VoidAssignmentInput = {
  assignmentId: string;
  actingVolunteerId: string;
};

export type VoidAssignmentResult = {
  id: string;
  voidedAtUtc: string;
};

/** Leader stewardship void — not volunteer self-release. */
export async function voidAssignment(
  input: VoidAssignmentInput,
): Promise<VoidAssignmentResult> {
  return mutateJson<VoidAssignmentResult>(
    `/assignments/${input.assignmentId}/void`,
    { volunteerId: input.actingVolunteerId },
    { method: 'POST' },
  );
}
