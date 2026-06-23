import { useNavigate } from 'react-router-dom';
import type { RefObject } from 'react';
import {
  isPenthouseSuiteHotspotDebugEnabled,
  PENTHOUSE_SUITE_IMAGE,
  PENTHOUSE_SUITE_PANEL_RECTS,
} from '../../constants/desktopPenthouseSuite';
import {
  buildPenthouseSuiteDashboardData,
  formatPenthouseSuiteCurrency,
} from '../../utils/penthouseSuiteDashboardData';
import { DesktopRoomCoverRectAnchor } from '../desktop-lobby/DesktopRoomCoverAnchor';
import { PenthouseSuiteEtchedPanel, PenthouseSuiteGlassPanel } from './PenthouseSuiteGlassPanel';
import './PenthouseSuiteDashboard.css';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  user: Record<string, unknown> | null;
};

const ICONS = {
  diamond: '/assets/member-status.svg',
  tickets: '/assets/challenge-icon.svg',
  vouchers: '/assets/special-offer.svg',
  cash: '/assets/gift-card.svg',
  orders: '/assets/active-bag-icon.svg',
  rewards: '/assets/membership-icon.svg',
  referrals: '/assets/more-ways-earn-icon.svg',
  wishlist: '/assets/wishlist-heart.svg',
  activity: '/assets/line-icon.svg',
  affiliate: '/assets/affiliate-icon.svg',
  settings: '/assets/hub-icon.svg',
  badge: '/assets/member-status.svg',
} as const;

function go(navigate: ReturnType<typeof useNavigate>, href: string) {
  navigate(href);
}

export function PenthouseSuiteDashboard({ measureRef, user }: Props) {
  const navigate = useNavigate();
  const debug = isPenthouseSuiteHotspotDebugEnabled();
  const data = buildPenthouseSuiteDashboardData(user);
  const rects = PENTHOUSE_SUITE_PANEL_RECTS;

  const ordersLabel =
    data.myOrders.activeCount === 1
      ? '1 ACTIVE ORDER'
      : `${data.myOrders.activeCount} ACTIVE ORDERS`;

  const wishlistLabel =
    data.wishlist.savedCount === 1
      ? '1 SAVED ITEM'
      : `${data.wishlist.savedCount} SAVED ITEMS`;

  return (
    <div className="penthouse-suite-dashboard" aria-label="Account dashboard panels">
      <DesktopRoomCoverRectAnchor measureRef={measureRef} imageRect={rects.hero} image={PENTHOUSE_SUITE_IMAGE} zIndex={6}>
        <PenthouseSuiteGlassPanel
          ariaLabel="Membership overview"
          onActivate={() => go(navigate, data.hero.href)}
          debug={debug}
          variant="hero"
        >
          <div className="penthouse-suite-hero__badge">
            <img src={ICONS.badge} alt="" draggable={false} />
          </div>
          <p className="penthouse-suite-hero__tier">{data.hero.tierLabel}</p>
          <div className="penthouse-suite-glass__rule" aria-hidden />
          <p className="penthouse-suite-hero__since">Member since {data.hero.memberSinceYear}</p>
        </PenthouseSuiteGlassPanel>
      </DesktopRoomCoverRectAnchor>

      <DesktopRoomCoverRectAnchor
        measureRef={measureRef}
        imageRect={rects.loyaltyPoints}
        image={PENTHOUSE_SUITE_IMAGE}
        zIndex={6}
      >
        <PenthouseSuiteEtchedPanel
          label="Diamond Points"
          value={`${data.diamondPoints.points.toLocaleString()} DP`}
          iconSrc={ICONS.diamond}
          ariaLabel="Diamond points and rewards"
          onActivate={() => go(navigate, data.diamondPoints.href)}
          debug={debug}
        />
      </DesktopRoomCoverRectAnchor>

      <DesktopRoomCoverRectAnchor
        measureRef={measureRef}
        imageRect={rects.slayTickets}
        image={PENTHOUSE_SUITE_IMAGE}
        zIndex={6}
      >
        <PenthouseSuiteEtchedPanel
          label="Slay Tickets"
          value={`${data.slayTickets.available} AVAILABLE`}
          iconSrc={ICONS.tickets}
          ariaLabel="Slay tickets balance"
          onActivate={() => go(navigate, data.slayTickets.href)}
          debug={debug}
        />
      </DesktopRoomCoverRectAnchor>

      <DesktopRoomCoverRectAnchor
        measureRef={measureRef}
        imageRect={rects.vouchers}
        image={PENTHOUSE_SUITE_IMAGE}
        zIndex={6}
      >
        <PenthouseSuiteEtchedPanel
          label="Vouchers"
          value={`${data.vouchers.activeCount} ACTIVE`}
          iconSrc={ICONS.vouchers}
          ariaLabel="Vouchers"
          onActivate={() => go(navigate, data.vouchers.href)}
          debug={debug}
        />
      </DesktopRoomCoverRectAnchor>

      <DesktopRoomCoverRectAnchor
        measureRef={measureRef}
        imageRect={rects.digitalCash}
        image={PENTHOUSE_SUITE_IMAGE}
        zIndex={6}
      >
        <PenthouseSuiteEtchedPanel
          label="Digital Cash"
          value={formatPenthouseSuiteCurrency(data.digitalCash.balance)}
          iconSrc={ICONS.cash}
          ariaLabel="Digital cash balance"
          onActivate={() => go(navigate, data.digitalCash.href)}
          debug={debug}
        />
      </DesktopRoomCoverRectAnchor>

      <DesktopRoomCoverRectAnchor
        measureRef={measureRef}
        imageRect={rects.myOrders}
        image={PENTHOUSE_SUITE_IMAGE}
        zIndex={6}
      >
        <PenthouseSuiteEtchedPanel
          label="My Orders"
          value={ordersLabel}
          iconSrc={ICONS.orders}
          ariaLabel="My orders"
          onActivate={() => go(navigate, data.myOrders.href)}
          debug={debug}
        />
      </DesktopRoomCoverRectAnchor>

      <DesktopRoomCoverRectAnchor
        measureRef={measureRef}
        imageRect={rects.rewardsCollection}
        image={PENTHOUSE_SUITE_IMAGE}
        zIndex={6}
      >
        <PenthouseSuiteEtchedPanel
          label="Rewards Collection"
          value="View Collection"
          iconSrc={ICONS.rewards}
          ariaLabel="Rewards collection"
          onActivate={() => go(navigate, data.rewardsCollection.href)}
          debug={debug}
        />
      </DesktopRoomCoverRectAnchor>

      <DesktopRoomCoverRectAnchor
        measureRef={measureRef}
        imageRect={rects.referrals}
        image={PENTHOUSE_SUITE_IMAGE}
        zIndex={6}
      >
        <PenthouseSuiteEtchedPanel
          label="Referrals"
          value={`${data.referrals.successfulCount} SUCCESSFUL`}
          iconSrc={ICONS.referrals}
          ariaLabel="Referrals"
          onActivate={() => go(navigate, data.referrals.href)}
          debug={debug}
        />
      </DesktopRoomCoverRectAnchor>

      <DesktopRoomCoverRectAnchor
        measureRef={measureRef}
        imageRect={rects.wishlist}
        image={PENTHOUSE_SUITE_IMAGE}
        zIndex={6}
      >
        <PenthouseSuiteEtchedPanel
          label="Wishlist"
          value={wishlistLabel}
          iconSrc={ICONS.wishlist}
          ariaLabel="Wishlist"
          onActivate={() => go(navigate, data.wishlist.href)}
          debug={debug}
        />
      </DesktopRoomCoverRectAnchor>

      <DesktopRoomCoverRectAnchor
        measureRef={measureRef}
        imageRect={rects.myActivity}
        image={PENTHOUSE_SUITE_IMAGE}
        zIndex={6}
      >
        <PenthouseSuiteEtchedPanel
          label="My Activity"
          value="Recent Activity"
          iconSrc={ICONS.activity}
          ariaLabel="Activity history"
          onActivate={() => go(navigate, data.myActivity.href)}
          debug={debug}
        />
      </DesktopRoomCoverRectAnchor>

      <DesktopRoomCoverRectAnchor
        measureRef={measureRef}
        imageRect={rects.affiliate}
        image={PENTHOUSE_SUITE_IMAGE}
        zIndex={6}
      >
        <PenthouseSuiteEtchedPanel
          label="Affiliate"
          value={`${data.affiliate.totalEarnedPoints.toLocaleString()} PTS EARNED`}
          iconSrc={ICONS.affiliate}
          ariaLabel="Affiliate dashboard"
          onActivate={() => go(navigate, data.affiliate.href)}
          debug={debug}
        />
      </DesktopRoomCoverRectAnchor>

      <DesktopRoomCoverRectAnchor
        measureRef={measureRef}
        imageRect={rects.accountSettings}
        image={PENTHOUSE_SUITE_IMAGE}
        zIndex={6}
      >
        <PenthouseSuiteEtchedPanel
          label="Account Settings"
          value="Manage Settings"
          iconSrc={ICONS.settings}
          ariaLabel="Account settings"
          onActivate={() => go(navigate, data.accountSettings.href)}
          debug={debug}
        />
      </DesktopRoomCoverRectAnchor>
    </div>
  );
}
