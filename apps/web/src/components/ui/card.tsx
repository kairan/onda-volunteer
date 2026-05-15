import * as React from 'react';
import { cn } from '../../lib/utils';

export function Card({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius)] border border-border bg-background text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />
  );
}

export function CardTitle({
  className,
  ...props
}: React.ComponentProps<'h3'>) {
  return (
    <h3
      className={cn(
        'font-display text-lg font-bold uppercase tracking-tight',
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}
