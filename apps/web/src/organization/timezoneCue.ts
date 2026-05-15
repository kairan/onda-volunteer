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
