import { render } from '@testing-library/react';
import { Calendar } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { Icon } from './icon';

describe('Icon facade', () => {
  it('defaults Lucide icons to thin stroke width', () => {
    const { container } = render(
      <Icon icon={Calendar} data-testid="calendar-icon" />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('stroke-width')).toBe('1.5');
  });
});
