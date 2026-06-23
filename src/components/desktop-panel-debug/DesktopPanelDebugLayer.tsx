import type { RefObject } from 'react';
import type { DesktopRoomCoverImageSpace } from '../../utils/desktopRoomCoverLayout';
import type { PanelDebugPanelDef } from '../../types/desktopPanelDebug';
import { DesktopPanelDebugInspector } from './DesktopPanelDebugInspector';
import { DesktopPanelDebugRect } from './DesktopPanelDebugRect';
import { useDesktopPanelDebug } from './DesktopPanelDebugProvider';
import './desktopPanelDebug.css';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  image: DesktopRoomCoverImageSpace;
  panels: PanelDebugPanelDef[];
};

/** Draggable/resizable alignment rectangles for desktop dashboard panel mapping. */
export function DesktopPanelDebugLayer({ measureRef, image, panels }: Props) {
  const editor = useDesktopPanelDebug();
  if (!editor) return null;

  return (
    <>
      <div className="desktop-panel-debug-layer" aria-hidden={!editor.overlaysVisible}>
        {panels.map((panel) => (
          <DesktopPanelDebugRect
            key={panel.id}
            measureRef={measureRef}
            image={image}
            panel={panel}
          />
        ))}
      </div>
      <DesktopPanelDebugInspector />
    </>
  );
}
