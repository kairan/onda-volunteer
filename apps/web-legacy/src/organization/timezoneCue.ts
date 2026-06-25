export function resolveSchedulingPresentationTimezone(input: {
  activeCampus?: { timezone: string } | null;
  activeChurch?: { defaultTimezone: string } | null;
}): string {
  return (
    input.activeCampus?.timezone ??
    input.activeChurch?.defaultTimezone ??
    'UTC'
  );
}

export function shortTimezoneLabel(iana: string): string {
  try {
    const parts = new Intl.DateTimeFormat('pt-BR', {
      timeZone: iana,
      timeZoneName: 'short',
    })
      .formatToParts(new Date())
      .find((part) => part.type === 'timeZoneName');
    return parts?.value ?? iana;
  } catch {
    return iana;
  }
}
