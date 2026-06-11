import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { initI18n } from '@/i18n/controller';
import { SchedulingEventDetailPending } from './schedulingEventDetail';

describe('SchedulingEventDetailPending', () => {
  it('renders HOPE-bordered pulse placeholders with screen-reader loading text', async () => {
    await initI18n();
    const { container } = render(
      <I18nProvider>
        <SchedulingEventDetailPending />
      </I18nProvider>,
    );

    const placeholders = container.querySelectorAll('.animate-pulse');
    expect(placeholders.length).toBeGreaterThanOrEqual(2);
    for (const el of placeholders) {
      expect(el.className).toContain('border-2');
      expect(el.className).toContain('border-border');
      expect(el.className).toContain('bg-surface-2');
    }
    expect(document.querySelector('.sr-only')).toBeTruthy();
  });
});
