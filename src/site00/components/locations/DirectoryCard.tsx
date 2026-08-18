import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { LocationsDirectoryEntry } from '../../config/locations-directory';
import { Site00DirectoryArrowIcon } from '../mobile/Site00MobileIcons';

type DirectoryCardProps = {
  entry: LocationsDirectoryEntry;
  style?: CSSProperties;
};

export function DirectoryCard({ entry, style }: DirectoryCardProps) {
  const content = (
    <>
      <div className="site00-directory-card__copy">
        <span className="site00-directory-card__index">{entry.index}</span>
        <span className="site00-directory-card__title">{entry.title}</span>
        <span className="site00-directory-card__description">
          {entry.descriptionLines[0]}
          <br />
          {entry.descriptionLines[1]}
        </span>
      </div>
      <span className="site00-directory-card__arrow" aria-hidden="true">
        <Site00DirectoryArrowIcon size={18} />
      </span>
    </>
  );

  if (!entry.enabled) {
    return (
      <div className="site00-directory-card site00-directory-card--disabled" style={style} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link
      to={entry.href}
      className="site00-directory-card"
      style={style}
      aria-label={`${entry.title} — ${entry.descriptionLines.join(' ')}`}
    >
      {content}
    </Link>
  );
}
