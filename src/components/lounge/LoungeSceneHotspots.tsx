import { useCallback, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { FINAL_LOUNGE_HIT_REGIONS } from '../../constants/finalLobbySceneAssets';
import { useLoungeChandelierHitDebugEnabled } from '../../utils/sceneHitDebug';
import { SceneHitDebugBanner } from '../lobby/SceneHitDebugBanner';
import { SceneHitRegion } from '../lobby/SceneHitRegion';

type Props = {
  viewportMeasureRef: RefObject<HTMLElement | null>;
};

/** Transparent taps on `final-lounge.png` (chandelier → concierge, etc.). */
export function LoungeSceneHotspots({ viewportMeasureRef: _viewportMeasureRef }: Props) {
  const navigate = useNavigate();
  const goToConcierge = useCallback(() => navigate('/account/concierge'), [navigate]);

  const chandelierHitDebug = useLoungeChandelierHitDebugEnabled();

  return (
    <>
      <SceneHitDebugBanner active={chandelierHitDebug}>
        Hit debug ON — amber box on lounge chandelier. Shelves: open <strong>/lobby?sceneHitDebug=1</strong>.
      </SceneHitDebugBanner>
    <SceneHitRegion
      rect={FINAL_LOUNGE_HIT_REGIONS.chandelier}
      ariaLabel="Go to account concierge"
      onActivate={goToConcierge}
      zIndex={chandelierHitDebug ? 24 : 20}
      debugOverlay={chandelierHitDebug}
      debugLabel="chandelier → /account/concierge"
    />
    </>
  );
}
