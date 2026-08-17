import { Link } from 'react-router-dom';
import { AIOLogo } from '../AIOLogo';
import type { ContextRailConfig, ContextRailItem } from './types';

type Props = {
  config: ContextRailConfig;
  onItemClick?: (item: ContextRailItem) => void;
};

export function AioContextRail({ config, onItemClick }: Props) {
  const {
    eyebrow,
    title,
    description,
    showLogo = true,
    itemsLabel,
    items = [],
    progress,
    status,
    footer,
    help,
    trust,
    ariaLabel,
  } = config;

  return (
    <aside className="acr-rail" aria-label={ariaLabel ?? title}>
      <div className="acr-rail__inner">
        {showLogo && (
          <div className="acr-rail__brand">
            <AIOLogo variant="footer" />
          </div>
        )}

        {eyebrow && <p className="acr-rail__eyebrow">{eyebrow}</p>}
        <h2 className="acr-rail__title">{title}</h2>
        {description && <p className="acr-rail__desc">{description}</p>}

        {progress && (
          <div className="acr-rail__progress" role="status">
            <span className="acr-rail__progress-label">{progress.label}</span>
            <div className="acr-rail__progress-track" aria-hidden="true">
              <div className="acr-rail__progress-fill" style={{ width: `${Math.min(100, Math.max(0, progress.value))}%` }} />
            </div>
            <span className="acr-rail__progress-value">{Math.round(progress.value)}%</span>
          </div>
        )}

        {status && status.length > 0 && (
          <dl className="acr-rail__status">
            {status.map((row) => (
              <div key={row.label} className="acr-rail__status-row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {items.length > 0 && (
          <nav className="acr-rail__nav" aria-label={itemsLabel ?? 'Page sections'}>
            {itemsLabel && <p className="acr-rail__nav-label">{itemsLabel}</p>}
            <ol className="acr-rail__items">
              {items.map((item, index) => (
                <ContextRailItemRow key={item.id} item={item} index={index} onItemClick={onItemClick} />
              ))}
            </ol>
          </nav>
        )}

        {footer && <div className="acr-rail__footer">{footer}</div>}

        {help && (
          <div className="acr-rail__help">
            <p className="acr-rail__help-title">{help.title}</p>
            {help.copy && <p className="acr-rail__help-copy">{help.copy}</p>}
            <Link to={help.href} className="acr-rail__help-link">
              {help.linkLabel} →
            </Link>
          </div>
        )}

        {trust && (
          <div className="acr-rail__trust">
            <span className="acr-rail__trust-icon" aria-hidden="true">
              <ShieldIcon />
            </span>
            <div>
              <p className="acr-rail__trust-title">{trust.title}</p>
              <p className="acr-rail__trust-copy">{trust.copy}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function ContextRailItemRow({
  item,
  index,
  onItemClick,
}: {
  item: ContextRailItem;
  index: number;
  onItemClick?: (item: ContextRailItem) => void;
}) {
  const state = item.state ?? 'default';
  const content = (
    <>
      <div className="acr-rail-item__marker" aria-hidden="true">
        {state === 'complete' ? (
          <span className="acr-rail-item__check">✓</span>
        ) : (
          <span className="acr-rail-item__num">{String(index + 1).padStart(2, '0')}</span>
        )}
      </div>
      <div className="acr-rail-item__text">
        <span className="acr-rail-item__label">{item.label}</span>
        {item.subtitle && <span className="acr-rail-item__subtitle">{item.subtitle}</span>}
      </div>
    </>
  );

  const className = `acr-rail-item acr-rail-item--${state}`;

  if (item.href) {
    return (
      <li className={className} aria-current={state === 'current' ? 'step' : undefined}>
        {item.external ? (
          <a href={item.href} className="acr-rail-item__link" onClick={() => onItemClick?.(item)}>
            {content}
          </a>
        ) : (
          <Link to={item.href} className="acr-rail-item__link" onClick={() => onItemClick?.(item)}>
            {content}
          </Link>
        )}
      </li>
    );
  }

  if (item.scrollTarget) {
    return (
      <li className={className} aria-current={state === 'current' ? 'location' : undefined}>
        <button
          type="button"
          className="acr-rail-item__link"
          onClick={() => {
            onItemClick?.(item);
            document.getElementById(item.scrollTarget!)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          {content}
        </button>
      </li>
    );
  }

  return (
    <li className={className} aria-current={state === 'current' ? 'step' : undefined}>
      <div className="acr-rail-item__static">{content}</div>
    </li>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M12 3l8 3v6c0 5-3.5 9-8 9s-8-4-8-9V6l8-3z" />
    </svg>
  );
}
