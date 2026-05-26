import type { Church } from './types';

export const DEMO_CHURCHES: Church[] = [
  {
    id: 'church-a',
    name: 'Igreja Central',
    defaultTimezone: 'America/Sao_Paulo',
    isAdminAccredited: false,
    campuses: [
      { id: 'campus-a1', name: 'Sede', timezone: 'America/Sao_Paulo' },
      { id: 'campus-a2', name: 'Zona Sul', timezone: 'America/Sao_Paulo' },
    ],
    ministries: [{ id: 'ministry-a', name: 'Recepção' }],
  },
  {
    id: 'church-b',
    name: 'Comunidade Norte',
    defaultTimezone: 'America/Manaus',
    isAdminAccredited: false,
    campuses: [
      { id: 'campus-b1', name: 'Único', timezone: 'America/Manaus' },
    ],
    ministries: [{ id: 'ministry-b', name: 'Louvor' }],
  },
];
