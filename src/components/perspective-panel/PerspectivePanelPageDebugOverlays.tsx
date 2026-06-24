import type { RefObject } from 'react';
import type { DesktopRoomCoverImageSpace } from '../../utils/desktopRoomCoverLayout';
import {
  getPerspectivePanelsForPage,
  PERSPECTIVE_PANEL_BY_ID,
} from '../../constants/perspectivePanelConfig';
import type { PerspectivePanelPage } from '../../types/perspectivePanel';
import { PerspectivePanelDebugPolygon } from './PerspectivePanelDebugPolygon';
import { usePerspectivePanelDebug } from './PerspectivePanelDebugProvider';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  page: PerspectivePanelPage;
  image: DesktopRoomCoverImageSpace;
};

/** Renders quad debug overlays for every perspective panel registered on a page. */
export function PerspectivePanelPageDebugOverlays({ measureRef, page, image }: Props) {
  const editor = usePerspectivePanelDebug();
  if (!editor?.debugEnabled) return null;

  const panels = getPerspectivePanelsForPage(page);

  return (
    <>
      {panels.map((panel) => (
        <PerspectivePanelDebugPolygon
          key={panel.id}
          id={panel.id}
          label={PERSPECTIVE_PANEL_BY_ID[panel.id]?.label ?? panel.id}
          measureRef={measureRef}
          image={image}
          quad={editor.resolveQuad(panel.id)}
        />
      ))}
    </>
  );
}
