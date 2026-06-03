import { useCallback, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { FINAL_LOUNGE_HIT_REGIONS } from '../../constants/finalLobbySceneAssets';
import { isLoungeChandelierHitDebugEnabled } from '../../utils/sceneHitDebug';
import { SceneHitRegion } from '../lobby/SceneHitRegion';

type Props = {
  viewportMeasureRef: RefObject<HTMLElement | null>;
};

/** Transparent taps on `final-lounge.png` (chandelier → concierge, etc.). */
export function LoungeSceneHotspots({ viewportMeasureRef: _viewportMeasureRef }: Props) {
  const navigate = useNavigate();
  const goToConcierge = useCallback(() => navigate('/account/concierge'), [navigate]);

  const chandelierHitDebug = isLoungeChandelierHitDebugEnabled();

  return (
    <SceneHitRegion
      rect={FINAL_LOUNGE_HIT_REGIONS.chandelier}
      ariaLabel="Go to account concierge"
      onActivate={goToConcierge}
      zIndex={chandelierHitDebug ? 24 : 20}
      debugOverlay={chandelierHitDebug}
      debugLabel="chandelier"
    />
  );
}
