import type { CSSProperties, ReactNode, RefObject } from 'react';
import {
  DESKTOP_ROOM_HERO_ART_HEIGHT,
  DESKTOP_ROOM_HERO_ART_WIDTH,
} from '../../constants/desktopRoomHeroArt';
import { PERSPECTIVE_PANEL_BY_ID } from '../../constants/perspectivePanelConfig';
import type { PerspectivePanelId } from '../../types/perspectivePanel';
import type { DesktopRoomCoverImageSpace } from '../../utils/desktopRoomCoverLayout';
import { isPerspectivePanelDebugEnabled } from '../../utils/perspectivePanelDebug';
import { PerspectivePanelDebugPolygon } from './PerspectivePanelDebugPolygon';
import { usePerspectivePanelQuad } from './PerspectivePanelDebugProvider';
import { PerspectivePanelHost } from './PerspectivePanelHost';

const DEFAULT_IMAGE: DesktopRoomCoverImageSpace = {
  width: DESKTOP_ROOM_HERO_ART_WIDTH,
  height: DESKTOP_ROOM_HERO_ART_HEIGHT,
};

type Props = {
  id: PerspectivePanelId;
  measureRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  image?: DesktopRoomCoverImageSpace;
  className?: string;
  style?: CSSProperties;
  zIndex?: number;
};

/**
 * Maps UI content into a perspective-warped architectural surface.
 * Coordinates come from `perspectivePanelConfig` + optional localStorage overrides.
 */
export function PerspectivePanel({
  id,
  measureRef,
  children,
  image = DEFAULT_IMAGE,
  className = '',
  style,
  zIndex = 6,
}: Props) {
  const quad = usePerspectivePanelQuad(id);
  const debug = isPerspectivePanelDebugEnabled();
  const label = PERSPECTIVE_PANEL_BY_ID[id]?.label ?? id;

  return (
    <>
      <PerspectivePanelHost
        measureRef={measureRef}
        quad={quad}
        image={image}
        className={className}
        style={style}
        zIndex={zIndex}
      >
        {children}
      </PerspectivePanelHost>
      {debug ? (
        <PerspectivePanelDebugPolygon
          id={id}
          label={label}
          measureRef={measureRef}
          image={image}
          quad={quad}
        />
      ) : null}
    </>
  );
}
