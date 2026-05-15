import type { LucideIcon } from 'lucide-react';

const DEFAULT_STROKE_WIDTH = 1.5;
const DEFAULT_SIZE = 20;

export type IconProps = {
  icon: LucideIcon;
  className?: string;
  size?: number;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
  'data-testid'?: string;
};

export function Icon({
  icon: LucideGlyph,
  className,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  'aria-hidden': ariaHidden = true,
  'data-testid': testId,
}: IconProps) {
  return (
    <LucideGlyph
      className={className}
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden={ariaHidden}
      data-testid={testId}
    />
  );
}
