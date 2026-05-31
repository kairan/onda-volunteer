export type IdentityMePayload = {
  volunteer: {
    id: string;
    displayName: string;
    uiLocale: string | null;
  };
  authSubjectId: string | null;
  isSystemAdmin: boolean;
};
