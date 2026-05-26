import type { Resource } from 'i18next';
import commonEn from './locales/en/common.json';
import dashboardEn from './locales/en/dashboard.json';
import ministriesEn from './locales/en/ministries.json';
import schedulingEn from './locales/en/scheduling.json';
import shellEn from './locales/en/shell.json';
import timeAwayEn from './locales/en/timeAway.json';
import leaderTimeAwayEn from './locales/en/leaderTimeAway.json';
import volunteersEn from './locales/en/volunteers.json';
import commonPt from './locales/pt-BR/common.json';
import dashboardPt from './locales/pt-BR/dashboard.json';
import ministriesPt from './locales/pt-BR/ministries.json';
import schedulingPt from './locales/pt-BR/scheduling.json';
import shellPt from './locales/pt-BR/shell.json';
import timeAwayPt from './locales/pt-BR/timeAway.json';
import leaderTimeAwayPt from './locales/pt-BR/leaderTimeAway.json';
import volunteersPt from './locales/pt-BR/volunteers.json';

export const i18nResources: Resource = {
  'pt-BR': {
    common: commonPt,
    shell: shellPt,
    dashboard: dashboardPt,
    scheduling: schedulingPt,
    ministries: ministriesPt,
    volunteers: volunteersPt,
    timeAway: timeAwayPt,
    leaderTimeAway: leaderTimeAwayPt,
  },
  en: {
    common: commonEn,
    shell: shellEn,
    dashboard: dashboardEn,
    scheduling: schedulingEn,
    ministries: ministriesEn,
    volunteers: volunteersEn,
    timeAway: timeAwayEn,
    leaderTimeAway: leaderTimeAwayEn,
  },
};

export const ROUTE_NAMESPACES = [
  'dashboard',
  'scheduling',
  'ministries',
  'volunteers',
  'timeAway',
  'leaderTimeAway',
] as const;
