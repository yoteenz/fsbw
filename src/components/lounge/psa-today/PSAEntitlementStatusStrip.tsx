import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_TEXT_GRAY } from '../loungeTvTheme';
import type { PSAEpisodeEntitlement } from './types';
import { formatPsaAccessUntil, watchesRemainingDetail } from './psaWatchPolicy';

type PSAEntitlementStatusStripProps = {
  entitlement: PSAEpisodeEntitlement;
};

/** Restrained active-entitlement status — watches remaining + access expiration. */
export function PSAEntitlementStatusStrip({ entitlement }: PSAEntitlementStatusStripProps) {
  if (entitlement.watchesRemaining <= 0) return null;

  return (
    <p
      style={{
        margin: 0,
        fontFamily: LOUNGE_TV_FONT_BOOK,
        fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
        color: LOUNGE_TV_TEXT_GRAY,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
    >
      {watchesRemainingDetail(entitlement.watchesRemaining, entitlement.totalWatches)}
      {' · '}
      ACCESS UNTIL {formatPsaAccessUntil(entitlement.expiresAt)}
    </p>
  );
}
