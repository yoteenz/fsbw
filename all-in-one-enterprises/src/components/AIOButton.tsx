import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'gold' | 'outline' | 'outline-gold' | 'outline-dark';
type Size = 'default' | 'sm';

type BaseProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  /** External anchor href */
  href?: string;
  /** In-app React Router destination — renders a single accessible link control */
  to?: string;
  /** Append → for primary/marketing CTAs (default: gold buttons, not sm) */
  showArrow?: boolean;
  className?: string;
};

type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    to?: undefined;
    href?: undefined;
  };

type LinkProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    to: string;
    href?: undefined;
  };

type ExternalLinkProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
    to?: undefined;
  };

type Props = ButtonProps | LinkProps | ExternalLinkProps;

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

function buildClasses(variant: Variant, size: Size, className: string) {
  return ['aio-btn', variantClass[variant], size === 'sm' ? 'aio-btn--sm' : '', className]
    .filter(Boolean)
    .join(' ');
}

export function AIOButton({
  variant = 'gold',
  size = 'default',
  children,
  href,
  to,
  className = '',
  showArrow,
  ...rest
}: Props) {
  const arrow =
    showArrow ?? (variant === 'gold' && size !== 'sm' && !hasArrow(children));

  const classes = buildClasses(variant, size, className);
  const label = renderLabel(children, arrow);

  if (to) {
    const { type: _type, ...linkRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <Link to={to} className={classes} {...linkRest}>
        {label}
      </Link>
    );
  }

  if (href) {
    const { type: _type, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} className={classes} {...anchorRest}>
        {label}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {label}
    </button>
  );
}
