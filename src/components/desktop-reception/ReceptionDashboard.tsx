import { useNavigate } from 'react-router-dom';
import type { RefObject } from 'react';
import {
  isReceptionDashboardDebugEnabled,
  RECEPTION_DASHBOARD_IMAGE,
  RECEPTION_DASHBOARD_PANEL_RECTS,
} from '../../constants/desktopReceptionDashboard';
import { buildReceptionDashboardContent } from '../../utils/receptionDashboardData';
import { useDesktopTowerTravelOptional } from '../desktop-tower/DesktopTowerNavProvider';
import { DesktopRoomCoverRectAnchor } from '../desktop-lobby/DesktopRoomCoverAnchor';
import { DesktopPanelTextOverlay } from '../desktop-lobby/panel-text/DesktopPanelTextOverlay';
import '../desktop-lobby/panel-text/DesktopPanelTextOverlay.css';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
};

const LEFT_LABELS = [
  'New Lounge Content',
  'New Slay Cam Uploads',
  'New Collectible',
  'Build-A-Wig Trends',
  'Community Spotlight',
] as const;

const RIGHT_LABELS = [
  'Hair Analysis Lab',
  'Build-A-Wig Atelier',
  'The Lounge',
  'Rewards Gallery',
  'Slay Cam',
] as const;

const LEFT_PANEL_IDS = [
  'loungeContent',
  'slayCamUploads',
  'newCollectible',
  'bawTrends',
  'communitySpotlight',
] as const;

const RIGHT_PANEL_IDS = [
  'hairAnalysisLab',
  'bawAtelier',
  'theLounge',
  'rewardsGallery',
  'slayCam',
] as const;

function useReceptionNavigate() {
  const navigate = useNavigate();
  const towerTravel = useDesktopTowerTravelOptional();

  return (href: string) => {
    if (towerTravel) towerTravel.quickTravelTo(href);
    else navigate(href);
  };
}

export function ReceptionDashboard({ measureRef }: Props) {
  const go = useReceptionNavigate();
  const debug = isReceptionDashboardDebugEnabled();
  const content = buildReceptionDashboardContent();
  const rects = RECEPTION_DASHBOARD_PANEL_RECTS;

  return (
    <div className="reception-dashboard" aria-label="Reception discovery labels">
      {LEFT_LABELS.map((label, index) => (
        <DesktopRoomCoverRectAnchor
          key={LEFT_PANEL_IDS[index]}
          measureRef={measureRef}
          imageRect={rects[LEFT_PANEL_IDS[index]]}
          image={RECEPTION_DASHBOARD_IMAGE}
          zIndex={6}
        >
          <DesktopPanelTextOverlay
            lines={[{ text: label }]}
            ariaLabel={label}
            onActivate={() => go(content.todayInMansion[index].href)}
            debug={debug}
          />
        </DesktopRoomCoverRectAnchor>
      ))}

      <DesktopRoomCoverRectAnchor
        measureRef={measureRef}
        imageRect={rects.featuredExperience}
        image={RECEPTION_DASHBOARD_IMAGE}
        zIndex={6}
      >
        <DesktopPanelTextOverlay
          lines={[
            { text: 'Featured Experience' },
            { text: 'The Lounge' },
            { text: 'Watch Now', accent: true },
          ]}
          ariaLabel="Featured experience: The Lounge"
          onActivate={() => go(content.featured.href)}
          debug={debug}
          align="center"
        />
      </DesktopRoomCoverRectAnchor>

      {RIGHT_LABELS.map((label, index) => (
        <DesktopRoomCoverRectAnchor
          key={RIGHT_PANEL_IDS[index]}
          measureRef={measureRef}
          imageRect={rects[RIGHT_PANEL_IDS[index]]}
          image={RECEPTION_DASHBOARD_IMAGE}
          zIndex={6}
        >
          <DesktopPanelTextOverlay
            lines={[{ text: label }]}
            ariaLabel={label}
            onActivate={() => go(content.recommendedDestinations[index].href)}
            debug={debug}
          />
        </DesktopRoomCoverRectAnchor>
      ))}
    </div>
  );
}
