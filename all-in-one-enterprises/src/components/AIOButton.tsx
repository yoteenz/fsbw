import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'gold' | 'outline' | 'outline-dark';
type Size = 'default' | 'sm';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  href?: string;
};

const variantClass: Record<Variant, string> = {
  gold: 'aio-btn--gold',
  outline: 'aio-btn--outline',
  'outline-dark': 'aio-btn--outline-dark',
};

export function AIOButton({ variant = 'gold', size = 'default', children, href, className = '', ...rest }: Props) {
  const classes = ['aio-btn', variantClass[variant], size === 'sm' ? 'aio-btn--sm' : '', className]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
