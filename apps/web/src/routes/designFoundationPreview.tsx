import { Calendar } from 'lucide-react';
import { Icon } from '../components/icon';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

/** Dev-only surface to verify slice 09 tokens and primitives (not linked in prod nav yet). */
export function DesignFoundationPreview() {
  return (
    <section aria-labelledby="design-foundation-heading" className="mt-8 space-y-4">
      <h2 id="design-foundation-heading" className="font-display text-xl font-bold uppercase tracking-tight">
        Design foundation
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Primitives</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button>Primary (ink)</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <span className="inline-flex items-center gap-2 text-sm">
            <Icon icon={Calendar} />
            Thin icon
          </span>
        </CardContent>
      </Card>
    </section>
  );
}
