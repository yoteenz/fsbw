import type { CollectibleGalleryItem } from './useUserCollectibles';
import { CertificationCollectibleAsset } from './CertificationCollectibleAsset';
import { getEducationMasteryById, getEducationSeasonById } from '../../../content/education/hierarchy/catalog';

type CollectibleCardProps = {
  item: CollectibleGalleryItem;
  onOpen?: () => void;
};

export function CollectibleCard({ item, onOpen }: CollectibleCardProps) {
  const definition = item.definition;
  const season = definition?.seasonId ? getEducationSeasonById(definition.seasonId) : undefined;
  const mastery = season ? getEducationMasteryById(season.masteryId) : undefined;
  const earnedDate = new Date(item.earnedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const isCert = definition?.type === 'season-certification' || item.sourceType === 'education';

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        display: 'block',
        width: '100%',
        padding: 16,
        margin: 0,
        border: '1px solid rgba(0,0,0,0.08)',
        background: '#fff',
        textAlign: 'left',
        cursor: onOpen ? 'pointer' : 'default',
      }}
    >
      <CertificationCollectibleAsset
        definition={definition}
        earned
        title={definition?.title}
        size={72}
      />
      <p
        style={{
          margin: '12px 0 4px',
          fontFamily: '"Futura PT Medium"',
          fontSize: 12,
          color: '#111',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {definition?.title ?? item.collectibleId}
      </p>
      {isCert && season ? (
        <p style={{ margin: 0, fontFamily: '"Futura PT Book"', fontSize: 10, color: '#666', textTransform: 'uppercase' }}>
          {mastery?.title} · SEASON {season.seasonNumber}
        </p>
      ) : (
        <p style={{ margin: 0, fontFamily: '"Futura PT Book"', fontSize: 10, color: '#666', textTransform: 'uppercase' }}>
          {item.sourceType.replace('-', ' ')}
        </p>
      )}
      <p style={{ margin: '6px 0 0', fontFamily: '"Futura PT Medium"', fontSize: 9, color: '#EB1C24', letterSpacing: '0.08em' }}>
        {isCert ? 'CERTIFIED' : 'EARNED'} · {earnedDate}
      </p>
    </button>
  );
}
