import { Calendar } from 'lucide-react';
import { Icon } from '../components/icon';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

/** Dev-only surface to verify slice 09 tokens and primitives (not linked in prod nav yet). */
export function DesignFoundationPreview() {
  return (
    <section
      aria-labelledby="design-foundation-heading"
      className="mt-8 flex flex-col gap-4"
    >
      <h2
        id="design-foundation-heading"
        className="font-display text-4xl font-bold uppercase leading-none tracking-tight"
      >
        Design foundation
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Brand primitives</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button>Primary gold</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Icon icon={Calendar} />
            Thin icon
          </span>
        </CardContent>
      </Card>
    </section>
  );
}
