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
import { DesktopPanelTextOverlay } from '../desktop-lobby/panel-text/DesktopPanelTextOverlay';
import '../desktop-lobby/panel-text/DesktopPanelTextOverlay.css';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  user: Record<string, unknown> | null;
};

function go(navigate: ReturnType<typeof useNavigate>, href: string) {
  navigate(href);
}

function PanelText({
  measureRef,
  imageRect,
  lines,
  ariaLabel,
  href,
  debug,
  align = 'left',
}: {
  measureRef: RefObject<HTMLElement | null>;
  imageRect: (typeof PENTHOUSE_SUITE_PANEL_RECTS)[keyof typeof PENTHOUSE_SUITE_PANEL_RECTS];
  lines: { text: string; accent?: boolean }[];
  ariaLabel: string;
  href: string;
  debug?: boolean;
  align?: 'left' | 'center';
}) {
  const navigate = useNavigate();

  return (
    <DesktopRoomCoverRectAnchor
      measureRef={measureRef}
      imageRect={imageRect}
      image={PENTHOUSE_SUITE_IMAGE}
      zIndex={6}
    >
      <DesktopPanelTextOverlay
        lines={lines}
        ariaLabel={ariaLabel}
        onActivate={() => go(navigate, href)}
        debug={debug}
        align={align}
      />
    </DesktopRoomCoverRectAnchor>
  );
}

export function PenthouseSuiteDashboard({ measureRef, user }: Props) {
  const debug = isPenthouseSuiteHotspotDebugEnabled();
  const data = buildPenthouseSuiteDashboardData(user);
  const rects = PENTHOUSE_SUITE_PANEL_RECTS;

  return (
    <div className="penthouse-suite-dashboard" aria-label="Account dashboard labels">
      <PanelText
        measureRef={measureRef}
        imageRect={rects.hero}
        lines={[{ text: data.hero.tierLabel }]}
        ariaLabel="Membership tier"
        href={data.hero.href}
        debug={debug}
        align="center"
      />

      <PanelText
        measureRef={measureRef}
        imageRect={rects.loyaltyPoints}
        lines={[
          { text: 'Loyalty Points' },
          { text: `${data.diamondPoints.points.toLocaleString()} DP`, accent: true },
        ]}
        ariaLabel="Loyalty points"
        href={data.diamondPoints.href}
        debug={debug}
      />

      <PanelText
        measureRef={measureRef}
        imageRect={rects.slayTickets}
        lines={[
          { text: 'Slay Tickets' },
          { text: `${data.slayTickets.available} Available`, accent: true },
        ]}
        ariaLabel="Slay tickets"
        href={data.slayTickets.href}
        debug={debug}
      />

      <PanelText
        measureRef={measureRef}
        imageRect={rects.vouchers}
        lines={[
          { text: 'Vouchers' },
          { text: `${data.vouchers.activeCount} Active`, accent: true },
        ]}
        ariaLabel="Vouchers"
        href={data.vouchers.href}
        debug={debug}
      />

      <PanelText
        measureRef={measureRef}
        imageRect={rects.digitalCash}
        lines={[
          { text: 'Digital Cash' },
          { text: formatPenthouseSuiteCurrency(data.digitalCash.balance), accent: true },
        ]}
        ariaLabel="Digital cash"
        href={data.digitalCash.href}
        debug={debug}
      />

      <PanelText
        measureRef={measureRef}
        imageRect={rects.myOrders}
        lines={[
          { text: 'My Orders' },
          { text: `${data.myOrders.activeCount} Active`, accent: true },
        ]}
        ariaLabel="My orders"
        href={data.myOrders.href}
        debug={debug}
      />

      <PanelText
        measureRef={measureRef}
        imageRect={rects.rewardsCollection}
        lines={[
          { text: 'Rewards Collection' },
          { text: 'View Collection', accent: true },
        ]}
        ariaLabel="Rewards collection"
        href={data.rewardsCollection.href}
        debug={debug}
      />

      <PanelText
        measureRef={measureRef}
        imageRect={rects.referrals}
        lines={[
          { text: 'Referrals' },
          { text: `${data.referrals.successfulCount} Successful`, accent: true },
        ]}
        ariaLabel="Referrals"
        href={data.referrals.href}
        debug={debug}
      />

      <PanelText
        measureRef={measureRef}
        imageRect={rects.wishlist}
        lines={[
          { text: 'Wishlist' },
          { text: `${data.wishlist.savedCount} Saved`, accent: true },
        ]}
        ariaLabel="Wishlist"
        href={data.wishlist.href}
        debug={debug}
      />

      <PanelText
        measureRef={measureRef}
        imageRect={rects.myActivity}
        lines={[
          { text: 'My Activity' },
          { text: 'Recent', accent: true },
        ]}
        ariaLabel="My activity"
        href={data.myActivity.href}
        debug={debug}
      />

      <PanelText
        measureRef={measureRef}
        imageRect={rects.affiliate}
        lines={[
          { text: 'Affiliate' },
          { text: `${data.affiliate.totalEarnedPoints.toLocaleString()} Pts`, accent: true },
        ]}
        ariaLabel="Affiliate"
        href={data.affiliate.href}
        debug={debug}
      />

      <PanelText
        measureRef={measureRef}
        imageRect={rects.accountSettings}
        lines={[
          { text: 'Account Settings' },
          { text: 'Manage', accent: true },
        ]}
        ariaLabel="Account settings"
        href={data.accountSettings.href}
        debug={debug}
      />
    </div>
  );
}
