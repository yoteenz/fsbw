import type { MansionDebugCategory } from '../types/desktopMansionDebug';
import type { PanelDebugColorGroup } from '../types/desktopPanelDebug';

export const MANSION_DEBUG_CATEGORY_COLOR_GROUP: Record<MansionDebugCategory, PanelDebugColorGroup> = {
  navigation: 'red',
  'information-panel': 'blue',
  'clickable-destination': 'green',
  'elevator-control': 'purple',
  'room-hotspot': 'orange',
  'rewards-economy': 'yellow',
};
