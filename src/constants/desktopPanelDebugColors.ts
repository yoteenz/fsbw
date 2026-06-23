import type { PanelDebugColorGroup } from '../types/desktopPanelDebug';

export const PANEL_DEBUG_COLOR_RGB: Record<PanelDebugColorGroup, string> = {
  red: '235, 28, 36',
  blue: '37, 99, 235',
  green: '34, 197, 94',
  purple: '168, 85, 247',
  yellow: '234, 179, 8',
  orange: '249, 115, 22',
  cyan: '6, 182, 212',
};

export function panelDebugColorStyles(group: PanelDebugColorGroup): {
  background: string;
  borderColor: string;
  tag: string;
} {
  const rgb = PANEL_DEBUG_COLOR_RGB[group];
  return {
    background: `rgba(${rgb}, 0.20)`,
    borderColor: `rgb(${rgb})`,
    tag: group.toUpperCase(),
  };
}
