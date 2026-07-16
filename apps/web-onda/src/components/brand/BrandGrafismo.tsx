import grafismoFilled from '@/assets/brand/grafismo-ondas-filled.png';
import grafismoLine from '@/assets/brand/grafismo-ondas-line.png';
import { cn } from '@/lib/utils';

const GRAFISMO_SRC = {
  filled: grafismoFilled,
  line: grafismoLine,
} as const;

export type BrandGrafismoProps = {
  variant: 'filled' | 'line';
  opacity?: number;
  decorative?: boolean;
  className?: string;
};

export function BrandGrafismo({
  variant,
  opacity,
  decorative = true,
  className,
}: BrandGrafismoProps) {
  const style = opacity !== undefined ? { opacity } : undefined;

  return (
    <img
      src={GRAFISMO_SRC[variant]}
      alt={decorative ? '' : 'ondas grafismo'}
      aria-hidden={decorative ? true : undefined}
      data-testid="brand-grafismo"
      data-variant={variant}
      className={cn('pointer-events-none select-none', className)}
      style={style}
    />
  );
}
