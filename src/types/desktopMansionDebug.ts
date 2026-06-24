import type { RefObject } from 'react';
import type { PerspectivePanelId } from './perspectivePanel';
import type { DesktopRoomCoverImageSpace } from '../utils/desktopRoomCoverLayout';

export type MansionDebugCategory =
  | 'navigation'
  | 'information-panel'
  | 'clickable-destination'
  | 'elevator-control'
  | 'room-hotspot'
  | 'rewards-economy';

export type MansionDebugRegionType = 'panel' | 'hotspot' | 'nav' | 'elevator' | 'destination' | 'economy';

export type MansionDebugPageId =
  | 'lobby'
  | 'gallery'
  | 'penthouse'
  | 'concierge'
  | 'account'
  | 'alerts'
  | 'booking-suite'
  | 'shopping-bag'
  | 'acquisition';

export type MansionDebugPageFilter = 'all' | MansionDebugPageId;

export type MansionDebugFilterGroup =
  | 'membership-panels'
  | 'economy-panels'
  | 'directory-panels'
  | 'welcome-panels'
  | 'house-information-panels'
  | 'elevator-areas'
  | 'room-hotspots'
  | 'navigation-areas';

export type MansionDebugDisplayMode = 'full' | 'labels' | 'boundaries';

export type MansionDebugImageRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type MansionDebugBounds = {
  imageRect: MansionDebugImageRect;
  image: DesktopRoomCoverImageSpace;
};

export type MansionDebugRegion = {
  id: string;
  page: MansionDebugPageId;
  pageZone?: string;
  category: MansionDebugCategory;
  type: MansionDebugRegionType;
  filterGroup: MansionDebugFilterGroup;
  label: string;
  component?: string;
  route?: string;
  dataSource?: string;
  /** When set, region is tuned via perspective-panel quad corners (not a plain rect). */
  perspectivePanelId?: PerspectivePanelId;
  bounds: MansionDebugBounds;
};

export type MansionDebugViewportBinding = {
  measureRef: RefObject<HTMLElement | null>;
  page: MansionDebugPageId;
  pageZone?: string;
  pageLabel: string;
};

export type MansionDebugFilterState = Record<MansionDebugFilterGroup, boolean>;
