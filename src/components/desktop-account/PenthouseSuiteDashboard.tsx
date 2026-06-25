import { useNavigate } from 'react-router-dom';
import type { RefObject } from 'react';
import {
  isPenthouseSuiteHotspotDebugEnabled,
  PENTHOUSE_SUITE_IMAGE,
  type PenthouseSuitePanelId,
} from '../../constants/desktopPenthouseSuite';
import { ACCOUNT_PANEL_TO_PERSPECTIVE_PANEL } from '../../constants/desktopPagePerspectivePanels';
import {
  buildPenthouseSuiteDashboardData,
  formatPenthouseSuiteCurrency,
} from '../../utils/penthouseSuiteDashboardData';
import { DesktopPerspectivePanelAnchor } from '../desktop-shared/DesktopPerspectivePanelAnchor';
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
  panelId,
  lines,
  ariaLabel,
  href,
  debug,
  align = 'left',
}: {
  measureRef: RefObject<HTMLElement | null>;
  panelId: PenthouseSuitePanelId;
  lines: { text: string; accent?: boolean }[];
  ariaLabel: string;
  href: string;
  debug?: boolean;
  align?: 'left' | 'center';
}) {
  const navigate = useNavigate();

  return (
    <DesktopPerspectivePanelAnchor
      id={ACCOUNT_PANEL_TO_PERSPECTIVE_PANEL[panelId]}
      measureRef={measureRef}
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
    </DesktopPerspectivePanelAnchor>
  );
}

export function PenthouseSuiteDashboard({ measureRef, user }: Props) {
  const debug = isPenthouseSuiteHotspotDebugEnabled();
  const data = buildPenthouseSuiteDashboardData(user);

  return (
    <div className="penthouse-suite-dashboard" aria-label="Account dashboard labels">
      <PanelText
        measureRef={measureRef}
        panelId="hero"
        lines={[{ text: data.hero.tierLabel }]}
        ariaLabel="Membership tier"
        href={data.hero.href}
        debug={debug}
        align="center"
      />

      <PanelText
        measureRef={measureRef}
        panelId="loyaltyPoints"
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
        panelId="slayTickets"
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
        panelId="vouchers"
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
        panelId="digitalCash"
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
        panelId="myOrders"
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
        panelId="rewardsCollection"
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
        panelId="referrals"
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
        panelId="wishlist"
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
        panelId="myActivity"
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
        panelId="affiliate"
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
        panelId="accountSettings"
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
