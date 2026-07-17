import { useState } from 'react';
import logoBranco from '@/assets/brand/logo-igreja-onda-branco.png';
import logoPreto from '@/assets/brand/logo-igreja-onda-preto.png';
import { cn } from '@/lib/utils';

const LOGO_SRC = {
  preto: logoPreto,
  branco: logoBranco,
} as const;

const ACCESSIBLE_NAME = 'igreja onda';

export type IgrejaOndaWordmarkProps = {
  variant: 'preto' | 'branco';
  className?: string;
  compact?: boolean;
};

export function IgrejaOndaWordmark({
  variant,
  className,
  compact = false,
}: IgrejaOndaWordmarkProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <span
        className={cn('text-sm font-semibold tracking-tight lowercase', className)}
        aria-label={ACCESSIBLE_NAME}
      >
        {ACCESSIBLE_NAME}
      </span>
    );
  }

  return (
    <img
      src={LOGO_SRC[variant]}
      alt={ACCESSIBLE_NAME}
      onError={() => setHasError(true)}
      className={cn(
        'h-auto w-auto',
        compact
          ? 'max-h-8 w-8 object-cover object-left'
          : 'max-h-8 object-contain',
        className,
      )}
    />
  );
}
