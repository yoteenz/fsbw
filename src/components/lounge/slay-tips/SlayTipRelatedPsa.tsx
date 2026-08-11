import type { PSATodayEpisode } from '../psa-today/types';
import { getPsaTodayEpisodeById } from '../psa-today/psaTodayCatalog';
import { SlayTipRelatedContent } from './SlayTipDetailSections';

type SlayTipRelatedPsaProps = {
  episodeId: string;
  onViewFullClass: (episode: PSATodayEpisode) => void;
};

/** @deprecated Prefer SlayTipRelatedContent — thin wrapper for legacy imports. */
export function SlayTipRelatedPsa({ episodeId, onViewFullClass }: SlayTipRelatedPsaProps) {
  const episode = getPsaTodayEpisodeById(episodeId);
  if (!episode) return null;
  return <SlayTipRelatedContent episode={episode} onViewClass={onViewFullClass} />;
}
