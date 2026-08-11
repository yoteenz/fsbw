import type { SlayTip } from '../../../content/education/types';
import { SlayTipCard } from './SlayTipCard';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_TEXT_GRAY } from '../loungeTvTheme';
import { trackSlayTipEvent } from './slayTipAnalytics';
import { trackPsaTodayEvent } from '../psa-today/psaTodayAnalytics';

type PSARelatedSlayTipsProps = {
  episodeId: string;
  tips: SlayTip[];
  onSelectTip: (tip: SlayTip) => void;
  title?: string;
};

/** Contextual companion tips — educational, not aggressive upsell. */
export function PSARelatedSlayTips({
  episodeId,
  tips,
  onSelectTip,
  title = 'GO DEEPER',
}: PSARelatedSlayTipsProps) {
  if (!tips.length) return null;

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(1, 2.5, 5),
        textTransform: 'uppercase',
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
            color: LOUNGE_TV_TEXT_GRAY,
            letterSpacing: '0.06em',
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: `${loungeTvGlassCqw(0.35, 0.8, 1.6)} 0 0`,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: loungeTvGlassCqw(0.9, 2, 4),
            color: LOUNGE_TV_TEXT_GRAY,
            lineHeight: 1.4,
            maxWidth: '36em',
          }}
        >
          COMPANION SLAY TIPS — ORIGINAL MICRO-LESSONS, NOT SUMMARIES OF THIS CLASS.
        </p>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: loungeTvGlassCqw(1, 2.5, 5),
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {tips.map((tip) => (
          <SlayTipCard
            key={tip.id}
            tip={tip}
            variant="rail"
            onSelect={(t) => {
              trackPsaTodayEvent('psa_related_slay_tip_clicked', {
                episodeId,
                tipId: t.id,
              });
              trackSlayTipEvent('slay_tip_opened', { tipId: t.id, relatedPsaEpisodeId: episodeId });
              onSelectTip(t);
            }}
          />
        ))}
      </div>
    </section>
  );
}
