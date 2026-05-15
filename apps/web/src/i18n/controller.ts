import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import {
  type LocalePersistence,
  type SupportedLocale,
  browserLocalePersistence,
} from './localePersistence';
import { i18nResources, ROUTE_NAMESPACES } from './resources';
import { resolveInitialLocale } from './resolveInitialLocale';

const CORE_NAMESPACES = ['common', 'shell', ...ROUTE_NAMESPACES] as const;

let initPromise: Promise<typeof i18n> | null = null;
let localePersistence: LocalePersistence = browserLocalePersistence();

export function setLocalePersistence(adapter: LocalePersistence): void {
  localePersistence = adapter;
}

export function getLocalePersistence(): LocalePersistence {
  return localePersistence;
}

export function missingKeyDevMarker(
  lngs: readonly string[],
  ns: string,
  key: string,
): string {
  if (import.meta.env.DEV) {
    return `[missing:${lngs.join(',')}/${ns}:${key}]`;
  }
  return key;
}

export async function initI18n(
  persistence: LocalePersistence = getLocalePersistence(),
): Promise<typeof i18n> {
  if (initPromise) {
    return initPromise;
  }

  const initialLocale = resolveInitialLocale(persistence);

  initPromise = i18n
    .use(initReactI18next)
    .init({
      resources: i18nResources,
      lng: initialLocale,
      fallbackLng: {
        'pt-BR': ['en'],
        default: ['en'],
      },
      ns: [...CORE_NAMESPACES],
      defaultNS: 'common',
      interpolation: { escapeValue: false },
      returnEmptyString: false,
      parseMissingKeyHandler: missingKeyDevMarker,
    })
    .then(() => i18n);

  return initPromise;
}

export async function changeLocale(
  locale: SupportedLocale,
  persistence: LocalePersistence = getLocalePersistence(),
): Promise<void> {
  await initI18n(persistence);
  persistence.save(locale);
  await i18n.changeLanguage(locale);
}

export function getActiveLocale(): SupportedLocale {
  const lng = i18n.language;
  return lng === 'en' ? 'en' : 'pt-BR';
}

export async function loadRouteNamespace(
  namespace: (typeof ROUTE_NAMESPACES)[number],
): Promise<void> {
  await initI18n();
  if (!i18n.hasResourceBundle(i18n.language, namespace)) {
    await i18n.loadNamespaces(namespace);
  }
}

export function resetI18nForTests(): void {
  initPromise = null;
  localePersistence = browserLocalePersistence();
  void i18n.changeLanguage('pt-BR');
}
