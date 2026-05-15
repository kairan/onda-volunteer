export type IdentityMePayload = {
  volunteer: {
    id: string;
    displayName: string;
  };
  authSubjectId: string | null;
};
