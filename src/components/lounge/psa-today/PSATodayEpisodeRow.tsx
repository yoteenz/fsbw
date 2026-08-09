import type { PSATodayEpisode } from './types';
import { PSAEpisodeCard } from './PSAEpisodeCard';
import { LoungeTvSectionTitle } from '../LoungeTvUiPrimitives';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { getPsaEpisodeProgress } from './psaTodayProgress';
import {
  psaEpisodeEntitlementBadge,
  usePsaEntitlementsByEpisode,
} from '../../../hooks/usePsaEntitlementsByEpisode';

type PSATodayEpisodeRowProps = {
  title: string;
  episodes: PSATodayEpisode[];
  onSelect: (episode: PSATodayEpisode) => void;
  emptyLabel?: string;
};

export function PSATodayEpisodeRow({
  title,
  episodes,
  onSelect,
  emptyLabel,
}: PSATodayEpisodeRowProps) {
  const { byEpisode } = usePsaEntitlementsByEpisode();
  if (!episodes.length && emptyLabel) {
    return (
      <section style={{ marginBottom: loungeTvGlassCqw(2, 5, 10) }}>
        <LoungeTvSectionTitle title={title} />
        <p
          style={{
            margin: 0,
            fontFamily: '"Futura PT Book", Futura, sans-serif',
            fontSize: loungeTvGlassCqw(1.4, 3.2, 6.5),
            color: '#808080',
            textTransform: 'uppercase',
          }}
        >
          {emptyLabel}
        </p>
      </section>
    );
  }

  if (!episodes.length) return null;

  return (
    <section style={{ marginBottom: loungeTvGlassCqw(2, 5, 10) }}>
      <LoungeTvSectionTitle title={title} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: loungeTvGlassCqw(1.2, 3, 6),
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x proximity',
        }}
      >
        {episodes.map((ep) => {
          const progress = getPsaEpisodeProgress(ep);
          const ent = byEpisode.get(ep.id);
          const locked = ep.accessType !== 'free' && !ent;
          const badge = psaEpisodeEntitlementBadge(ent, locked);
          return (
            <PSAEpisodeCard
              key={ep.id}
              episode={ep}
              onSelect={onSelect}
              progressPercent={progress.durationSeconds ? progress.progressSeconds / progress.durationSeconds * 100 : undefined}
              entitlementBadge={badge}
            />
          );
        })}
      </div>
    </section>
  );
}
