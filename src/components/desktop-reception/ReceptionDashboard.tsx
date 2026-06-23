import { useNavigate } from 'react-router-dom';
import type { RefObject } from 'react';
import {
  isReceptionDashboardDebugEnabled,
  RECEPTION_DASHBOARD_IMAGE,
} from '../../constants/desktopReceptionDashboard';
import { buildReceptionDashboardContent } from '../../utils/receptionDashboardData';
import { useDesktopTowerTravelOptional } from '../desktop-tower/DesktopTowerNavProvider';
import { DesktopPanelTextOverlay } from '../desktop-lobby/panel-text/DesktopPanelTextOverlay';
import { PerspectivePanel } from '../perspective-panel/PerspectivePanel';
import '../desktop-lobby/panel-text/DesktopPanelTextOverlay.css';
import '../perspective-panel/perspectivePanelDebug.css';

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

  return (
    <div className="reception-dashboard" aria-label="Reception discovery labels">
      <PerspectivePanel
        id="reception-left"
        measureRef={measureRef}
        image={RECEPTION_DASHBOARD_IMAGE}
        zIndex={6}
      >
        <div className="reception-perspective-panel reception-perspective-panel--column">
          {LEFT_LABELS.map((label, index) => (
            <div key={label} className="reception-perspective-panel__row">
              <DesktopPanelTextOverlay
                lines={[{ text: label }]}
                ariaLabel={label}
                onActivate={() => go(content.todayInMansion[index].href)}
                debug={debug}
              />
            </div>
          ))}
        </div>
      </PerspectivePanel>

      <PerspectivePanel
        id="reception-center"
        measureRef={measureRef}
        image={RECEPTION_DASHBOARD_IMAGE}
        zIndex={6}
      >
        <div className="reception-perspective-panel reception-perspective-panel--center">
          <div className="reception-perspective-panel__row">
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
          </div>
        </div>
      </PerspectivePanel>

      <PerspectivePanel
        id="reception-right"
        measureRef={measureRef}
        image={RECEPTION_DASHBOARD_IMAGE}
        zIndex={6}
      >
        <div className="reception-perspective-panel reception-perspective-panel--column">
          {RIGHT_LABELS.map((label, index) => (
            <div key={label} className="reception-perspective-panel__row">
              <DesktopPanelTextOverlay
                lines={[{ text: label }]}
                ariaLabel={label}
                onActivate={() => go(content.recommendedDestinations[index].href)}
                debug={debug}
              />
            </div>
          ))}
        </div>
      </PerspectivePanel>
    </div>
  );
}
