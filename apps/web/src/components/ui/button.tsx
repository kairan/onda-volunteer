import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] border-2 border-border text-sm font-semibold uppercase tracking-[0.08em] shadow-[4px_4px_0_0_hsl(var(--border))] transition-[background-color,color,box-shadow,transform] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_hsl(var(--border))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-foreground text-surface hover:bg-primary hover:text-primary-foreground',
        accent:
          'bg-brand text-brand-foreground hover:bg-foreground hover:text-surface',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'bg-transparent text-foreground hover:bg-foreground hover:text-surface',
        ghost:
          'border-transparent bg-transparent text-foreground shadow-none hover:bg-surface hover:text-foreground hover:shadow-none',
        link: 'border-transparent bg-transparent text-foreground underline-offset-4 shadow-none hover:text-primary hover:underline hover:shadow-none',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-7',
        icon: 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
