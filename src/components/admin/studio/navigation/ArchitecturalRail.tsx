import { Link } from 'react-router-dom';
import type { ArchitecturalRailItem } from '../../../../studio-os-core/studio-warehouse/campus-nav';

type Props = {
  items: ArchitecturalRailItem[];
  activeDestinationId: string;
  arrivalComplete: boolean;
  onSelectDestination: (destinationId: string) => void;
  title?: string;
  className?: string;
};

/**
 * ArchitecturalRail™ — left vertical department / wing / district navigation only.
 * Never renders scene, workspace, or exhibit tabs.
 */
export function ArchitecturalRail({
  items,
  activeDestinationId,
  arrivalComplete,
  onSelectDestination,
  title = 'IDC™',
  className = '',
}: Props) {
  return (
    <nav
      className={`studio-architectural-rail wh-world__directory${className ? ` ${className}` : ''}`}
      aria-label="Architectural destinations"
    >
      <p className="studio-architectural-rail__title">{title}</p>
      <ul className="studio-architectural-rail__list">
        {items.map((item) => {
          if (item.kind === 'link') {
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className="studio-architectural-rail__btn"
                  title={item.label}
                >
                  <span className="studio-architectural-rail__btn__label">{item.shortLabel}</span>
                </Link>
              </li>
            );
          }

          const locked = !arrivalComplete;
          const isActive = activeDestinationId === item.zoneId;

          return (
            <li key={item.zoneId}>
              <button
                type="button"
                className={`studio-architectural-rail__btn${isActive ? ' is-active' : ''}${locked ? ' is-locked' : ''}`}
                onClick={() => onSelectDestination(item.zoneId)}
                disabled={locked}
                title={item.label}
              >
                <span className="studio-architectural-rail__btn__label">{item.shortLabel}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
