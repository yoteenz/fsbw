import { SITE00_LOCATIONS_DIRECTORY } from '../../config/locations-directory';
import { DirectorySpine } from './DirectorySpine';
import { DirectoryCard } from './DirectoryCard';

export function LocationsDirectory() {
  const entries = SITE00_LOCATIONS_DIRECTORY;

  return (
    <section className="site00-locations-directory" aria-label="SITE 00 locations directory">
      <DirectorySpine cardCount={entries.length} />
      <div className="site00-locations-directory__cards" role="list">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="site00-locations-directory__card-wrap"
            role="listitem"
            style={{ ['--site00-directory-card-index' as string]: index }}
          >
            <DirectoryCard entry={entry} />
          </div>
        ))}
      </div>
    </section>
  );
}
