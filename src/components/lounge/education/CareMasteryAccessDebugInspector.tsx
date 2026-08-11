import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_TEXT_GRAY } from '../loungeTvTheme';
import { isLoungeTvDebugUiEnabled } from '../loungeTvDebugUi';
import type { ResolvedPsaSeasonAccess } from '../../../content/education/types';
import { CARE_MASTERY_CANONICAL_SEASON_ID } from '../../../content/education/hierarchy/care/seasons';

type CareMasteryAccessDebugInspectorProps = {
  seasonAccess?: ResolvedPsaSeasonAccess | null;
  loading?: boolean;
  careGuideUnlockedCount?: number;
};

/** Dev-only Care Mastery entitlement inspector — separate from Care Guides. */
export function CareMasteryAccessDebugInspector({
  seasonAccess,
  loading,
  careGuideUnlockedCount,
}: CareMasteryAccessDebugInspectorProps) {
  if (!isLoungeTvDebugUiEnabled()) return null;

  return (
    <details
      style={{
        marginTop: loungeTvGlassCqw(1, 2.5, 5),
        padding: loungeTvGlassCqw(1, 2.5, 5),
        background: 'rgba(40,20,80,0.14)',
        border: '1px dashed rgba(160,120,220,0.55)',
        fontFamily: LOUNGE_TV_FONT_BOOK,
        fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
        color: LOUNGE_TV_TEXT_GRAY,
        textTransform: 'none',
      }}
    >
      <summary style={{ cursor: 'pointer' }}>CARE MASTERY ACCESS DEBUG (PAID PATH ONLY)</summary>
      <pre style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(
          {
            seasonId: CARE_MASTERY_CANONICAL_SEASON_ID,
            loading,
            curriculum: 'PARTIALLY APPROVED — EP 01 ONLY',
            careGuideUnlockedCount,
            note: 'Hair purchase unlocks Care Guides only — not Care Mastery unless paid/promo/admin pass exists.',
            access: seasonAccess
              ? {
                  hasAccess: seasonAccess.hasAccess,
                  accessScope: seasonAccess.accessScope,
                  accessSource: seasonAccess.accessSource,
                  seasonOwned: seasonAccess.seasonOwned,
                  episodeOwned: seasonAccess.episodeOwned,
                  complimentary: seasonAccess.complimentary,
                  displayState: seasonAccess.displayState,
                  canPurchaseSeasonPass: seasonAccess.canPurchaseSeasonPass,
                  canPurchaseEpisode: seasonAccess.canPurchaseEpisode,
                }
              : null,
          },
          null,
          2,
        )}
      </pre>
    </details>
  );
}
