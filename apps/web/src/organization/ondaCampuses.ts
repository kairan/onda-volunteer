import type { Church } from './types';

/**
 * Regional demo churches sourced from https://www.ondadura.com.br/campus
 * (last verified 2026-07-06).
 */
export const ONDA_DEMO_CHURCHES: Church[] = [
  {
    id: 'church-a',
    name: 'Onda Brasil',
    defaultTimezone: 'America/Sao_Paulo',
    isAccreditedAdmin: true,
    campuses: [
      { id: 'campus-joinville', name: 'Joinville', timezone: 'America/Sao_Paulo' },
      { id: 'campus-avenida-paulista', name: 'Av. Paulista', timezone: 'America/Sao_Paulo' },
      { id: 'campus-mooca', name: 'Mooca', timezone: 'America/Sao_Paulo' },
      { id: 'campus-guarulhos', name: 'Guarulhos', timezone: 'America/Sao_Paulo' },
      { id: 'campus-bauru', name: 'Bauru', timezone: 'America/Sao_Paulo' },
      { id: 'campus-belo-horizonte', name: 'Belo Horizonte', timezone: 'America/Sao_Paulo' },
      { id: 'campus-blumenau', name: 'Blumenau', timezone: 'America/Sao_Paulo' },
      { id: 'campus-cabo-frio', name: 'Cabo Frio', timezone: 'America/Sao_Paulo' },
      { id: 'campus-campinas', name: 'Campinas', timezone: 'America/Sao_Paulo' },
      { id: 'campus-caxias-do-sul', name: 'Caxias do Sul', timezone: 'America/Sao_Paulo' },
      { id: 'campus-curitiba', name: 'Curitiba', timezone: 'America/Sao_Paulo' },
      { id: 'campus-florianopolis', name: 'Florianópolis', timezone: 'America/Sao_Paulo' },
      { id: 'campus-itajai', name: 'Itajaí', timezone: 'America/Sao_Paulo' },
      { id: 'campus-jaragua-do-sul', name: 'Jaraguá do Sul', timezone: 'America/Sao_Paulo' },
      { id: 'campus-macapa', name: 'Macapá', timezone: 'America/Sao_Paulo' },
      { id: 'campus-machado', name: 'Machado', timezone: 'America/Sao_Paulo' },
      { id: 'campus-porto-alegre', name: 'Porto Alegre', timezone: 'America/Sao_Paulo' },
      { id: 'campus-recife', name: 'Recife', timezone: 'America/Sao_Paulo' },
    ],
    ministries: [{ id: 'ministry-a', name: 'Recepção' }],
  },
  {
    id: 'church-b',
    name: 'Onda USA',
    defaultTimezone: 'America/New_York',
    isAccreditedAdmin: false,
    campuses: [
      { id: 'campus-charlotte', name: 'Charlotte', timezone: 'America/New_York' },
      { id: 'campus-chicago', name: 'Chicago', timezone: 'America/Chicago' },
    ],
    ministries: [{ id: 'ministry-b', name: 'Louvor' }],
  },
  {
    id: 'church-c',
    name: 'Onda Europa',
    defaultTimezone: 'Europe/Lisbon',
    isAccreditedAdmin: false,
    campuses: [
      { id: 'campus-porto', name: 'Porto', timezone: 'Europe/Lisbon' },
      { id: 'campus-sines', name: 'Sines', timezone: 'Europe/Lisbon' },
      { id: 'campus-mallorca', name: 'Mallorca', timezone: 'Europe/Madrid' },
      { id: 'campus-londres', name: 'Londres', timezone: 'Europe/London' },
    ],
    ministries: [{ id: 'ministry-c', name: 'Mídia' }],
  },
];
