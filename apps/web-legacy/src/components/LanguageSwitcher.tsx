import { useTranslation } from 'react-i18next';
import { changeLocale } from '@/i18n/controller';
import type { SupportedLocale } from '@/i18n/localePersistence';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { updateIdentityMe } from '@/identity/updateIdentityMe';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('shell');
  const session = useAuthSession();
  const current = i18n.language === 'en' ? 'en' : 'pt-BR';

  async function select(locale: SupportedLocale) {
    if (locale === current) {
      return;
    }

    const onSave =
      session.status === 'authenticated'
        ? async (l: SupportedLocale) => {
            await updateIdentityMe({ uiLocale: l });
          }
        : undefined;

    await changeLocale(locale, undefined, onSave);
  }

  return (
    <fieldset className="border-0 p-0">
      <legend className="sr-only">{t('language')}</legend>
      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        <label className="flex cursor-pointer items-center gap-2 hover:text-foreground">
          <input
            type="radio"
            name="ui-locale"
            className="accent-primary"
            checked={current === 'pt-BR'}
            onChange={() => void select('pt-BR')}
          />
          {t('languagePt')}
        </label>
        <label className="flex cursor-pointer items-center gap-2 hover:text-foreground">
          <input
            type="radio"
            name="ui-locale"
            className="accent-primary"
            checked={current === 'en'}
            onChange={() => void select('en')}
          />
          {t('languageEn')}
        </label>
      </div>
    </fieldset>
  );
}
