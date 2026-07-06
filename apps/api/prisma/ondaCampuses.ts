/**
 * Regional churches and campuses sourced from https://www.ondadura.com.br/campus
 * (last verified 2026-07-06).
 */
export type OndaCampusSeed = {
  id: string;
  name: string;
  timezone: string;
};

export type OndaRegionalChurchSeed = {
  id: string;
  name: string;
  defaultTimezone: string;
  campuses: OndaCampusSeed[];
};

export const ONDA_REGIONAL_CHURCHES: OndaRegionalChurchSeed[] = [
  {
    id: 'seed-church-demo',
    name: 'Onda Brasil',
    defaultTimezone: 'America/Sao_Paulo',
    campuses: [
      { id: 'seed-campus-joinville', name: 'Joinville', timezone: 'America/Sao_Paulo' },
      { id: 'seed-campus-avenida-paulista', name: 'Av. Paulista', timezone: 'America/Sao_Paulo' },
      { id: 'seed-campus-mooca', name: 'Mooca', timezone: 'America/Sao_Paulo' },
      { id: 'seed-campus-guarulhos', name: 'Guarulhos', timezone: 'America/Sao_Paulo' },
      { id: 'seed-campus-bauru', name: 'Bauru', timezone: 'America/Sao_Paulo' },
      { id: 'seed-campus-belo-horizonte', name: 'Belo Horizonte', timezone: 'America/Sao_Paulo' },
      { id: 'seed-campus-blumenau', name: 'Blumenau', timezone: 'America/Sao_Paulo' },
      { id: 'seed-campus-cabo-frio', name: 'Cabo Frio', timezone: 'America/Sao_Paulo' },
      { id: 'seed-campus-campinas', name: 'Campinas', timezone: 'America/Sao_Paulo' },
      { id: 'seed-campus-caxias-do-sul', name: 'Caxias do Sul', timezone: 'America/Sao_Paulo' },
      { id: 'seed-campus-curitiba', name: 'Curitiba', timezone: 'America/Sao_Paulo' },
      { id: 'seed-campus-florianopolis', name: 'Florianópolis', timezone: 'America/Sao_Paulo' },
      { id: 'seed-campus-itajai', name: 'Itajaí', timezone: 'America/Sao_Paulo' },
      { id: 'seed-campus-jaragua-do-sul', name: 'Jaraguá do Sul', timezone: 'America/Sao_Paulo' },
      { id: 'seed-campus-macapa', name: 'Macapá', timezone: 'America/Sao_Paulo' },
      { id: 'seed-campus-machado', name: 'Machado', timezone: 'America/Sao_Paulo' },
      { id: 'seed-campus-porto-alegre', name: 'Porto Alegre', timezone: 'America/Sao_Paulo' },
      { id: 'seed-campus-recife', name: 'Recife', timezone: 'America/Sao_Paulo' },
    ],
  },
  {
    id: 'seed-church-norte',
    name: 'Onda USA',
    defaultTimezone: 'America/New_York',
    campuses: [
      { id: 'seed-campus-charlotte', name: 'Charlotte', timezone: 'America/New_York' },
      { id: 'seed-campus-chicago', name: 'Chicago', timezone: 'America/Chicago' },
    ],
  },
  {
    id: 'seed-church-europa',
    name: 'Onda Europa',
    defaultTimezone: 'Europe/Lisbon',
    campuses: [
      { id: 'seed-campus-porto', name: 'Porto', timezone: 'Europe/Lisbon' },
      { id: 'seed-campus-sines', name: 'Sines', timezone: 'Europe/Lisbon' },
      { id: 'seed-campus-mallorca', name: 'Mallorca', timezone: 'Europe/Madrid' },
      { id: 'seed-campus-londres', name: 'Londres', timezone: 'Europe/London' },
    ],
  },
];

/** Legacy campus ids replaced by the Onda Dura regional seed. */
export const OBSOLETE_SEED_CAMPUS_IDS = [
  'seed-campus-central-sede',
  'seed-campus-central-sul',
  'seed-campus-norte-unico',
] as const;
