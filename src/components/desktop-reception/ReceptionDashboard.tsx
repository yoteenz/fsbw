import { useNavigate } from 'react-router-dom';
import type { RefObject } from 'react';
import {
  isReceptionDashboardDebugEnabled,
  RECEPTION_DASHBOARD_IMAGE,
  RECEPTION_DASHBOARD_PANEL_RECTS,
} from '../../constants/desktopReceptionDashboard';
import {
  buildReceptionDashboardContent,
  type ReceptionDiscoveryCard,
  type ReceptionFeaturedExperience,
} from '../../utils/receptionDashboardData';
import { useDesktopTowerTravelOptional } from '../desktop-tower/DesktopTowerNavProvider';
import { DesktopRoomCoverRectAnchor } from '../desktop-lobby/DesktopRoomCoverAnchor';
import {
  DesktopEmbeddedDiscoveryCard,
  DesktopEmbeddedGlassPanel,
} from '../desktop-lobby/embedded-glass/DesktopEmbeddedGlassPanel';
import '../desktop-lobby/embedded-glass/DesktopEmbeddedGlassPanel.css';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
};

function useReceptionNavigate() {
  const navigate = useNavigate();
  const towerTravel = useDesktopTowerTravelOptional();

  return (href: string) => {
    if (towerTravel) towerTravel.quickTravelTo(href);
    else navigate(href);
  };
}

function FeaturedBillboard({
  data,
  onActivate,
  debug,
}: {
  data: ReceptionFeaturedExperience;
  onActivate: () => void;
  debug?: boolean;
}) {
  return (
    <DesktopEmbeddedGlassPanel
      ariaLabel={data.ariaLabel}
      onActivate={onActivate}
      debug={debug}
      variant="billboard"
    >
      <div className="desktop-embedded-glass__row">
        {data.thumbSrc ? (
          <div className="desktop-embedded-glass__thumb" aria-hidden>
            <img src={data.thumbSrc} alt="" draggable={false} />
          </div>
        ) : null}
        <div className="desktop-embedded-glass__copy">
          <p className="desktop-embedded-glass__kicker">{data.kicker}</p>
          <p className="desktop-embedded-glass__title">{data.title}</p>
          <p className="desktop-embedded-glass__metric">{data.metric}</p>
          <p className="desktop-embedded-glass__subtext">{data.subtext}</p>
          <div className="desktop-embedded-glass__cta">{data.cta}</div>
        </div>
      </div>
    </DesktopEmbeddedGlassPanel>
  );
}

function DiscoveryPanel({
  card,
  imageRect,
  measureRef,
  onActivate,
  debug,
}: {
  card: ReceptionDiscoveryCard;
  imageRect: (typeof RECEPTION_DASHBOARD_PANEL_RECTS)[keyof typeof RECEPTION_DASHBOARD_PANEL_RECTS];
  measureRef: RefObject<HTMLElement | null>;
  onActivate: () => void;
  debug?: boolean;
}) {
  return (
    <DesktopRoomCoverRectAnchor
      measureRef={measureRef}
      imageRect={imageRect}
      image={RECEPTION_DASHBOARD_IMAGE}
      zIndex={6}
    >
      <DesktopEmbeddedDiscoveryCard
        title={card.title}
        metric={card.metric}
        subtext={card.subtext}
        cta={card.cta}
        iconSrc={card.iconSrc}
        thumbSrc={card.thumbSrc}
        ariaLabel={card.ariaLabel}
        onActivate={onActivate}
        debug={debug}
      />
    </DesktopRoomCoverRectAnchor>
  );
}

export function ReceptionDashboard({ measureRef }: Props) {
  const go = useReceptionNavigate();
  const debug = isReceptionDashboardDebugEnabled();
  const content = buildReceptionDashboardContent();
  const rects = RECEPTION_DASHBOARD_PANEL_RECTS;

  const leftPanelIds = [
    'loungeContent',
    'slayCamUploads',
    'newCollectible',
    'bawTrends',
    'communitySpotlight',
  ] as const;

  const rightPanelIds = [
    'hairAnalysisLab',
    'bawAtelier',
    'theLounge',
    'rewardsGallery',
    'slayCam',
  ] as const;

  return (
    <div className="reception-dashboard" aria-label="Reception discovery dashboard">
      {content.todayInMansion.map((card, index) => (
        <DiscoveryPanel
          key={card.id}
          card={card}
          imageRect={rects[leftPanelIds[index]]}
          measureRef={measureRef}
          onActivate={() => go(card.href)}
          debug={debug}
        />
      ))}

      <DesktopRoomCoverRectAnchor
        measureRef={measureRef}
        imageRect={rects.featuredExperience}
        image={RECEPTION_DASHBOARD_IMAGE}
        zIndex={6}
      >
        <FeaturedBillboard
          data={content.featured}
          onActivate={() => go(content.featured.href)}
          debug={debug}
        />
      </DesktopRoomCoverRectAnchor>

      {content.recommendedDestinations.map((card, index) => (
        <DiscoveryPanel
          key={card.id}
          card={card}
          imageRect={rects[rightPanelIds[index]]}
          measureRef={measureRef}
          onActivate={() => go(card.href)}
          debug={debug}
        />
      ))}
    </div>
  );
}
