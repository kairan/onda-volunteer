import { BadRequestException } from '@nestjs/common';
import { IANAZone } from 'luxon';

export function isValidIanaTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export function parseIanaTimezone(
  value: string | undefined,
  label = 'defaultTimezone',
): string {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed || !IANAZone.isValidZone(trimmed)) {
    throw new BadRequestException({
      code: 'INVALID_TIMEZONE',
      message: `${label} must be a valid IANA timezone.`,
    });
  }
  return trimmed;
}
