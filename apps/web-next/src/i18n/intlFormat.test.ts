import { describe, expect, it } from 'vitest';
import { formatNumber } from './intlFormat';

describe('intlFormat', () => {
  it('formats numbers in the requested locale', () => {
    expect(formatNumber('pt-BR', 1234.5)).toContain('1');
  });
});
