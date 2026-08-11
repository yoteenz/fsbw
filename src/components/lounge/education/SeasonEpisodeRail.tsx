import type { SeasonEpisodePreviewItem } from './seasonPreviewMeta';
import { SeasonEpisodeThumbnail } from './SeasonEpisodeThumbnail';

type SeasonEpisodeRailProps = {
  seasonId: string;
  items: SeasonEpisodePreviewItem[];
  onSelectEpisode?: (episodeId: string) => void;
};

export function SeasonEpisodeRail({ seasonId, items, onSelectEpisode }: SeasonEpisodeRailProps) {
  if (!items.length) return null;

  return (
    <div className="lounge-tv-season-episode-rail-wrap">
      <div
        className="lounge-tv-season-episode-rail"
        data-lounge-tv-rail-scroll
        role="list"
        aria-label="Season episodes"
      >
        {items.map((item) => (
          <div key={item.slotId} className="lounge-tv-season-episode-rail__cell" role="listitem">
            <SeasonEpisodeThumbnail
              item={item}
              focusId={`season-${seasonId}-ep-${item.episodeNumber}`}
              onActivate={onSelectEpisode}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
