export function placeholderPage(title: string) {
  return function PlaceholderPage() {
    return (
      <section className="rounded-lg border border-border bg-card p-6 shadow-card">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Coming soon.</p>
      </section>
    );
  };
}
