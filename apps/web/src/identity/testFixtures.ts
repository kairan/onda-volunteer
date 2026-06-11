import type { IdentityMePayload } from './types';

const defaultIdentityMe: IdentityMePayload = {
  volunteer: {
    id: 'vol-fixture',
    displayName: 'Fixture Volunteer',
    uiLocale: null,
  },
  authSubjectId: null,
  isSystemAdmin: false,
  newlyFulfilledInvites: [],
};

export function identityMeFixture(
  overrides: Partial<IdentityMePayload> = {},
): IdentityMePayload {
  return {
    ...defaultIdentityMe,
    ...overrides,
    volunteer: {
      ...defaultIdentityMe.volunteer,
      ...overrides.volunteer,
    },
    newlyFulfilledInvites:
      overrides.newlyFulfilledInvites ?? defaultIdentityMe.newlyFulfilledInvites,
  };
}

export function systemAdminIdentityMeFixture(
  overrides: Partial<IdentityMePayload> = {},
): IdentityMePayload {
  return identityMeFixture({
    isSystemAdmin: true,
    ...overrides,
  });
}
