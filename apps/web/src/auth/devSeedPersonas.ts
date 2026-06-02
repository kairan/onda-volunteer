export type DevSeedPersona = {
  id: string;
  displayName: string;
  capabilityKeys: readonly string[];
};

/** Seed volunteers for local dev header impersonation (see apps/api/prisma/seed.ts). */
export const DEV_SEED_PERSONAS: readonly DevSeedPersona[] = [
  {
    id: 'seed-volunteer-demo',
    displayName: 'Demo Volunteer',
    capabilityKeys: [
      'shell:devPersona.capabilities.leader',
      'shell:devPersona.capabilities.volunteer',
    ],
  },
  {
    id: 'seed-volunteer-hospitality',
    displayName: 'Hospitality Volunteer',
    capabilityKeys: ['shell:devPersona.capabilities.volunteer'],
  },
  {
    id: 'seed-volunteer-admin',
    displayName: 'Kairan Moraes',
    capabilityKeys: ['shell:devPersona.capabilities.churchAdmin'],
  },
  {
    id: 'seed-volunteer-system-admin',
    displayName: 'System Operator',
    capabilityKeys: ['shell:devPersona.capabilities.systemAdmin'],
  },
] as const;
