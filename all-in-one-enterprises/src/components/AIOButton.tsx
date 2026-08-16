import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'gold' | 'outline' | 'outline-gold' | 'outline-dark';
type Size = 'default' | 'sm';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  href?: string;
  /** Append → for primary/marketing CTAs (default: gold buttons, not sm) */
  showArrow?: boolean;
};

const variantClass: Record<Variant, string> = {
  gold: 'aio-btn--gold',
  outline: 'aio-btn--outline',
  'outline-gold': 'aio-btn--outline-gold',
  'outline-dark': 'aio-btn--outline-dark',
};

function hasArrow(children: ReactNode): boolean {
  if (typeof children === 'string') return children.includes('→');
  return false;
}

function renderLabel(children: ReactNode, showArrow: boolean) {
  if (!showArrow || hasArrow(children)) return children;
  return (
    <>
      {children}
      <span className="aio-btn__arrow" aria-hidden="true">
        {' '}
        →
      </span>
    </>
  );
}

export function AIOButton({
  variant = 'gold',
  size = 'default',
  children,
  href,
  className = '',
  showArrow,
  ...rest
}: Props) {
  const arrow =
    showArrow ?? (variant === 'gold' && size !== 'sm' && !hasArrow(children));

  const classes = ['aio-btn', variantClass[variant], size === 'sm' ? 'aio-btn--sm' : '', className]
    .filter(Boolean)
    .join(' ');

  const label = renderLabel(children, arrow);

  if (href) {
    return (
      <a href={href} className={classes}>
        {label}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {label}
    </button>
  );
}
