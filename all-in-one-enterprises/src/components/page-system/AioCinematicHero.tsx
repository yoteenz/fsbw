import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AioEyebrow } from './AioEyebrow';

type Breadcrumb = { label: string; href?: string };

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  compact?: boolean;
  /** CSS background image URL for cinematic treatment */
  backgroundImage?: string;
  className?: string;
};

export function AioCinematicHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
  compact = false,
  backgroundImage,
  className = '',
}: Props) {
  const style = backgroundImage
    ? ({ '--aio-ps-hero-bg': `url(${backgroundImage})` } as React.CSSProperties)
    : undefined;

  return (
    <header
      className={`aio-ps-hero${compact ? ' aio-ps-hero--compact' : ''}${className ? ` ${className}` : ''}`}
      style={style}
    >
      <div className="aio-ps-hero__bg" aria-hidden="true" />
      <div className="aio-ps-hero__overlay" aria-hidden="true" />
      <div className="aio-container aio-ps-hero__inner">
        {breadcrumbs?.length ? (
          <nav className="aio-ps-hero__breadcrumb" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={`${crumb.label}-${i}`}>
                {i > 0 ? <span className="aio-ps-hero__breadcrumb-sep"> / </span> : null}
                {crumb.href ? <Link to={crumb.href}>{crumb.label}</Link> : <span>{crumb.label}</span>}
              </span>
            ))}
          </nav>
        ) : null}
        {eyebrow ? <AioEyebrow>{eyebrow}</AioEyebrow> : null}
        <h1 className="aio-ps-hero__title">{title}</h1>
        {description ? <p className="aio-ps-hero__desc">{description}</p> : null}
        {actions ? <div className="aio-ps-hero__actions">{actions}</div> : null}
      </div>
    </header>
  );
}
