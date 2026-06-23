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
  type PenthouseSuiteDashboardData,
} from '../../utils/penthouseSuiteDashboardData';
import { DesktopRoomCoverRectAnchor } from '../desktop-lobby/DesktopRoomCoverAnchor';
import { PenthouseSuiteGlassPanel, PenthouseSuiteStatPanel } from './PenthouseSuiteGlassPanel';
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

function HeroPanel({
  data,
  onActivate,
  debug,
}: {
  data: PenthouseSuiteDashboardData['hero'];
  onActivate: () => void;
  debug?: boolean;
}) {
  return (
    <PenthouseSuiteGlassPanel ariaLabel="Membership overview" onActivate={onActivate} debug={debug} variant="hero">
      <div className="penthouse-suite-hero__badge">
        <img src={ICONS.badge} alt="" draggable={false} />
      </div>
      <p className="penthouse-suite-hero__tier">{data.tierLabel}</p>
      <p className="penthouse-suite-hero__since">Member since {data.memberSinceYear}</p>
    </PenthouseSuiteGlassPanel>
  );
}

export function PenthouseSuiteDashboard({ measureRef, user }: Props) {
  const navigate = useNavigate();
  const debug = isPenthouseSuiteHotspotDebugEnabled();
  const data = buildPenthouseSuiteDashboardData(user);
  const rects = PENTHOUSE_SUITE_PANEL_RECTS;

  return (
    <div className="penthouse-suite-dashboard" aria-label="Account dashboard panels">
      <DesktopRoomCoverRectAnchor measureRef={measureRef} imageRect={rects.hero} image={PENTHOUSE_SUITE_IMAGE} zIndex={6}>
        <HeroPanel data={data.hero} onActivate={() => go(navigate, data.hero.href)} debug={debug} />
      </DesktopRoomCoverRectAnchor>

      <DesktopRoomCoverRectAnchor
        measureRef={measureRef}
        imageRect={rects.loyaltyPoints}
        image={PENTHOUSE_SUITE_IMAGE}
        zIndex={6}
      >
        <PenthouseSuiteStatPanel
          iconSrc={ICONS.diamond}
          title="Diamond Points"
          metric={`${data.diamondPoints.points.toLocaleString()} DP`}
          subtext={[
            `Lifetime earned ${data.diamondPoints.lifetimeEarned.toLocaleString()} DP`,
            `Next milestone ${data.diamondPoints.nextMilestoneLabel}`,
          ]}
          progressPct={data.diamondPoints.progressPct}
          cta="View rewards →"
          ariaLabel="Loyalty points and rewards"
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
        <PenthouseSuiteStatPanel
          iconSrc={ICONS.tickets}
          title="Slay Tickets"
          metric={`${data.slayTickets.available} available`}
          cta="View history →"
          ariaLabel="Slay tickets balance and history"
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
        <PenthouseSuiteStatPanel
          iconSrc={ICONS.vouchers}
          title="Vouchers"
          metric={`${data.vouchers.activeCount} active`}
          cta="View vouchers →"
          ariaLabel="Vouchers and voucher history"
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
        <PenthouseSuiteStatPanel
          iconSrc={ICONS.cash}
          title="Digital Cash"
          metric={formatPenthouseSuiteCurrency(data.digitalCash.balance)}
          subtext="Available balance"
          cta="View transactions →"
          ariaLabel="Digital cash balance and transactions"
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
        <PenthouseSuiteStatPanel
          iconSrc={ICONS.orders}
          title="My Orders"
          metric={`${data.myOrders.activeCount} active order${data.myOrders.activeCount === 1 ? '' : 's'}`}
          cta="View orders →"
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
        <PenthouseSuiteStatPanel
          iconSrc={ICONS.rewards}
          title="Rewards Collection"
          metric={data.rewardsCollection.rewardCount > 0 ? `${data.rewardsCollection.rewardCount} unlocked` : 'Start collecting'}
          cta="View collection →"
          ariaLabel="Rewards collection and collectibles"
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
        <PenthouseSuiteStatPanel
          iconSrc={ICONS.referrals}
          title="Referrals"
          metric={`${data.referrals.successfulCount} successful`}
          subtext={`Next bonus: ${data.referrals.nextBonusRemaining} more`}
          progressPct={data.referrals.progressPct}
          cta="View referrals →"
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
        <PenthouseSuiteStatPanel
          iconSrc={ICONS.wishlist}
          title="Wishlist"
          metric={`${data.wishlist.savedCount} saved item${data.wishlist.savedCount === 1 ? '' : 's'}`}
          cta="View wishlist →"
          ariaLabel="Wishlist and saved items"
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
        <PenthouseSuiteGlassPanel
          ariaLabel="Activity history"
          onActivate={() => go(navigate, data.myActivity.href)}
          debug={debug}
          variant="compact"
        >
          <div className="penthouse-suite-glass__head">
            <img src={ICONS.activity} alt="" className="penthouse-suite-glass__icon" draggable={false} />
            <div className="penthouse-suite-glass__body">
              <p className="penthouse-suite-glass__title">My Activity</p>
              <ul className="penthouse-suite-glass__activity-list">
                {data.myActivity.items.map((item) => (
                  <li key={`${item.label}-${item.when}`} className="penthouse-suite-glass__activity-item">
                    <span className="penthouse-suite-glass__activity-dot" aria-hidden />
                    <span className="penthouse-suite-glass__activity-copy">
                      {item.label}
                      <span className="penthouse-suite-glass__activity-when">({item.when})</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="penthouse-suite-glass__cta">View all activity →</div>
        </PenthouseSuiteGlassPanel>
      </DesktopRoomCoverRectAnchor>

      <DesktopRoomCoverRectAnchor
        measureRef={measureRef}
        imageRect={rects.affiliate}
        image={PENTHOUSE_SUITE_IMAGE}
        zIndex={6}
      >
        <PenthouseSuiteStatPanel
          iconSrc={ICONS.affiliate}
          title="Affiliate"
          metric={`${data.affiliate.totalEarnedPoints.toLocaleString()} pts earned`}
          subtext={`Commission rate ${data.affiliate.commissionRateLabel}`}
          cta="View affiliate dashboard →"
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
        <PenthouseSuiteGlassPanel
          ariaLabel="Account settings, security, addresses, and payment"
          onActivate={() => go(navigate, data.accountSettings.href)}
          debug={debug}
          variant="settings"
        >
          <div className="penthouse-suite-glass__head">
            <img src={ICONS.settings} alt="" className="penthouse-suite-glass__icon" draggable={false} />
            <div className="penthouse-suite-glass__body">
              <p className="penthouse-suite-glass__title">Account Settings</p>
              <p className="penthouse-suite-glass__subtext">
                Manage your preferences, security, addresses and payment methods.
              </p>
            </div>
          </div>
          <div className="penthouse-suite-glass__cta">Manage settings →</div>
        </PenthouseSuiteGlassPanel>
      </DesktopRoomCoverRectAnchor>
    </div>
  );
}
