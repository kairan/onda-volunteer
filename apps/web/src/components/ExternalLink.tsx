import type { ReactNode } from 'react';
import { Icon } from '@/components/icon';
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';

export function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        'inline-flex items-center gap-1 underline-offset-4 hover:underline',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
      <Icon icon={ExternalLinkIcon} size={16} aria-hidden />
    </a>
  );
}
