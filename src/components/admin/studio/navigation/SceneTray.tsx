import type { SceneTrayEntry } from './types';

type Props = {
  entries: SceneTrayEntry[];
  activeId: string;
  onSelect: (id: string) => void;
  ariaLabel?: string;
  className?: string;
};

/**
 * SceneTray™ — bottom horizontal scene / workspace / exhibit navigation only.
 * Never renders department or district destinations. Stays bottom on all breakpoints.
 */
export function SceneTray({
  entries,
  activeId,
  onSelect,
  ariaLabel = 'Scene and workspace selection',
  className = '',
}: Props) {
  if (entries.length <= 1) return null;

  return (
    <nav
      className={`studio-scene-tray wh-world__nav${className ? ` ${className}` : ''}`}
      aria-label={ariaLabel}
    >
      <div className="studio-scene-tray__track">
        {entries.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={`studio-scene-tray__btn${activeId === entry.id ? ' is-active' : ''}`}
            onClick={() => onSelect(entry.id)}
            disabled={entry.locked}
            title={entry.label}
          >
            {entry.shortLabel}
          </button>
        ))}
      </div>
    </nav>
  );
}
