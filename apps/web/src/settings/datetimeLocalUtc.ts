const DATETIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function wallTimePartsInZone(utcMs: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(utcMs));

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
    minute: read('minute'),
  };
}

function wallTimeToUtcMs(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number {
  return Date.UTC(year, month - 1, day, hour, minute);
}

/** Format a UTC instant for `<input type="datetime-local">` in an IANA timezone. */
export function utcIsoToDatetimeLocal(isoUtc: string, timeZone: string): string {
  const { year, month, day, hour, minute } = wallTimePartsInZone(
    new Date(isoUtc).getTime(),
    timeZone,
  );
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
}

/** Parse `<input type="datetime-local">` wall time in an IANA timezone to UTC ISO. */
export function datetimeLocalToUtcIso(localValue: string, timeZone: string): string {
  if (!DATETIME_LOCAL_PATTERN.test(localValue)) {
    return new Date(localValue).toISOString();
  }

  const [datePart, timePart] = localValue.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  let utcMs = wallTimeToUtcMs(year, month, day, hour, minute);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const actual = wallTimePartsInZone(utcMs, timeZone);
    const desiredMs = wallTimeToUtcMs(year, month, day, hour, minute);
    const actualMs = wallTimeToUtcMs(
      actual.year,
      actual.month,
      actual.day,
      actual.hour,
      actual.minute,
    );
    const diff = desiredMs - actualMs;
    if (diff === 0) {
      break;
    }
    utcMs += diff;
  }

  return new Date(utcMs).toISOString();
}
