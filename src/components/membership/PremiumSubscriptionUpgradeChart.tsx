import type { CSSProperties } from 'react';
import { PREMIUM_BENEFITS_BY_TIER } from '../../constants/premiumBenefitsByTier';
import {
  BRAND_GRAY,
  CHART_BORDER,
  PremiumChartBenefitRow,
} from './premiumChartTable';
import type { SubscriptionTierId } from '../../constants/subscriptionPricing';

export type SubscriptionTierOption = {
  name: string;
  price: number;
};

export type PremiumSubscriptionUpgradeChartProps = {
  onClose: () => void;
  hasPremiumSubscription: boolean;
  selectedTier: string | null;
  setSelectedTier: (tier: string | null) => void;
  showAllBenefits: boolean;
  setShowAllBenefits: (value: boolean | ((prev: boolean) => boolean)) => void;
  formatPrice: (price: number) => { __html: string };
  subscriptionTiers: Record<SubscriptionTierId, SubscriptionTierOption>;
  /** When true, render without outer bordered wrapper (parent card supplies chrome). */
  embedded?: boolean;
};

export default function PremiumSubscriptionUpgradeChart({
  onClose,
  hasPremiumSubscription,
  selectedTier,
  setSelectedTier,
  showAllBenefits,
  setShowAllBenefits,
  formatPrice,
  subscriptionTiers,
  embedded = false,
}: PremiumSubscriptionUpgradeChartProps) {
  const chartBody = (
    <>
  {/* PREMIUM MEMBERSHIP Header */}
  <div style={{ marginBottom: '32px' }}>
    <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '12px' }}>
      <h2
        style={{
          fontFamily: '"Futura PT Medium"',
          color: '#EB1C24',
          fontSize: '12px',
          fontWeight: '500',
          margin: '0',
          textTransform: 'uppercase'
        }}
      >
        PREMIUM MEMBERSHIP
      </h2>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close premium membership chart"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          marginTop: '-2px',
          flexShrink: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img
          src="/assets/close-icon.svg"
          alt=""
          style={{
            width: '16px',
            height: '16px',
            objectFit: 'contain',
            filter:
              'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(7404%) hue-rotate(353deg) brightness(92%) contrast(92%)'
          }}
        />
      </button>
    </div>

    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '-8px',
        marginBottom: '6px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <img
        src="/assets/premium-membership-upgrade.png"
        alt="Premium membership comparison"
        decoding="async"
        style={{
          width: '100%',
          maxWidth: 'min(100%, 200px)',
          height: 'auto',
          objectFit: 'contain',
          display: 'block',
          /* Draft CSS; DOM supports it but TS `ImageRendering` union does not yet */
          imageRendering: 'high-quality' as CSSProperties['imageRendering'],
        }}
      />
    </div>

    <button
      type="button"
      onClick={() => setShowAllBenefits((v) => !v)}
      aria-expanded={showAllBenefits}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'center',
        fontFamily: '"Futura PT Medium"',
        fontWeight: '500',
        color: '#000000',
        fontSize: '10px',
        textTransform: 'uppercase',
        margin: '0 0 18px 0',
        padding: 0,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        lineHeight: 1.35
      }}
    >
      {showAllBenefits ? 'HIDE ALL BENEFITS' : 'VIEW ALL BENEFITS'}
    </button>
    {showAllBenefits && (
      <div
        style={{
          marginBottom: '16px',
          paddingLeft: '8px',
          paddingRight: '8px',
          boxSizing: 'border-box'
        }}
      >
        {(['3months', '6months', '12months'] as const).map((tierKey) => (
          <div key={tierKey} style={{ marginBottom: '14px' }}>
            <p
              style={{
                fontFamily: '"Futura PT Medium"',
                fontSize: '10px',
                color: '#000000',
                margin: '0 0 6px 0',
                textTransform: 'uppercase',
                textAlign: 'center',
                fontWeight: '500'
              }}
            >
              {tierKey === '3months'
                ? '3 MONTHS PREMIUM'
                : tierKey === '6months'
                  ? '6 MONTHS PREMIUM'
                  : '12 MONTHS PREMIUM'}
            </p>
            <ul
              style={{
                margin: 0,
                paddingLeft: '20px',
                fontFamily: '"Futura PT Book"',
                fontSize: '9px',
                color: '#000000',
                textTransform: 'uppercase',
                lineHeight: 1.4
              }}
            >
              {PREMIUM_BENEFITS_BY_TIER[tierKey].map((b) => (
                <li key={b} style={{ marginBottom: '3px' }}>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )}

    {/* Comparison Table */}
      <div style={{ overflowX: 'auto', marginTop: '44px', marginBottom: '38px', display: 'flex', justifyContent: 'center' }}>
        <table style={{ width: 'max-content', borderCollapse: 'collapse', fontSize: '9px', transform: 'translateZ(0)' }}>
          <thead>
            <tr>
<th style={{ 
                fontFamily: '"Futura PT Medium"', 
                padding: '4px 4px 10px',
                textAlign: 'center',
                borderBottom: CHART_BORDER,
                borderRight: CHART_BORDER,
                fontWeight: '500',
                textTransform: 'uppercase',
                color: '#EB1C24',
                minWidth: '68px',
                maxWidth: '68px'
              }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>BENEFITS</span></th>
              <th style={{ 
                fontFamily: '"Futura PT Medium"', 
                padding: '4px 4px 10px', 
                textAlign: 'center', 
                borderBottom: CHART_BORDER,
                borderRight: CHART_BORDER,
                fontWeight: '500',
                textTransform: 'uppercase',
                minWidth: '58px',
                maxWidth: '58px'
              }}>STANDARD</th>
              <th style={{ 
                fontFamily: '"Futura PT Medium"', 
                padding: '4px 4px 10px', 
                textAlign: 'center', 
                borderBottom: CHART_BORDER,
                borderRight: CHART_BORDER,
                fontWeight: '500',
                textTransform: 'uppercase',
                color: BRAND_GRAY,
                lineHeight: '1.25',
                minWidth: '58px',
                maxWidth: '58px'
              }}>3 MONTHS PREMIUM</th>
              <th style={{ 
                fontFamily: '"Futura PT Medium"', 
                padding: '4px 4px 10px', 
                textAlign: 'center', 
                borderBottom: CHART_BORDER,
                borderRight: CHART_BORDER,
                fontWeight: '500',
                textTransform: 'uppercase',
                color: BRAND_GRAY,
                lineHeight: '1.25',
                minWidth: '58px',
                maxWidth: '58px'
              }}>6 MONTHS PREMIUM</th>
              <th style={{ 
                fontFamily: '"Futura PT Medium"', 
                padding: '4px 4px 10px', 
                textAlign: 'center', 
                borderBottom: CHART_BORDER,
                fontWeight: '500',
                textTransform: 'uppercase',
                color: BRAND_GRAY,
                lineHeight: '1.25',
                minWidth: '62px',
                maxWidth: '62px'
              }}>
                <span style={{ display: 'inline-block', marginLeft: '12px', textAlign: 'center' }}>
                  <span style={{ display: 'block', whiteSpace: 'nowrap' }}>12 MONTHS</span>
                  <span style={{ display: 'block', whiteSpace: 'nowrap' }}>PREMIUM</span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>WELCOME DISCOUNT</span></td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', fontSize: '10px', padding: '6px 4px', textAlign: 'center', whiteSpace: 'nowrap', lineHeight: '1.25' }}><span dangerouslySetInnerHTML={formatPrice(10)} /></td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', fontSize: '10px', padding: '6px 4px', textAlign: 'center', whiteSpace: 'nowrap', lineHeight: '1.25' }}><span dangerouslySetInnerHTML={formatPrice(20)} /></td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', fontSize: '10px', padding: '6px 4px', textAlign: 'center', whiteSpace: 'nowrap', lineHeight: '1.25' }}><span dangerouslySetInnerHTML={formatPrice(40)} /></td>
              <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', fontSize: '10px', padding: '6px 4px', textAlign: 'center', whiteSpace: 'nowrap', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '12px' }}><span dangerouslySetInnerHTML={formatPrice(60)} /></span></td>
            </tr>
            <tr>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>BIRTHDAY GIFT</span></td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                </div>
              </td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                </div>
              </td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                </div>
              </td>
              <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                  </div>
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>REDUCED SHIPPING</span></td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                </div>
              </td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                </div>
              </td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                </div>
              </td>
              <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                  </div>
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>PREMIUM<br />BUILD-A-WIG</span></td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                </div>
              </td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                </div>
              </td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                </div>
              </td>
              <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                  </div>
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>LOUNGE ACCESS</span></td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                </div>
              </td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                </div>
              </td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                </div>
              </td>
              <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                  </div>
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>VIP SUPPORT</span></td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                </div>
              </td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                </div>
              </td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                </div>
              </td>
              <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                  </div>
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>PRIORITY BOOKING</span></td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                </div>
              </td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                </div>
              </td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                </div>
              </td>
              <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                  </div>
                </span>
              </td>
            </tr>
            <PremiumChartBenefitRow label="CHALLENGES" m3 m6 m12 />
            <PremiumChartBenefitRow label="PRIORITY MESSAGES" m3={false} m6 m12 />
            <tr>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>LIVE ORDER TRACKING</span></td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                </div>
              </td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                </div>
              </td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                </div>
              </td>
              <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                  </div>
                </span>
              </td>
            </tr>
            <PremiumChartBenefitRow label="SPECIAL OFFERS" m3={false} m6={false} m12 />
            <tr>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>EXCLUSIVE REWARDS</span></td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                </div>
              </td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                </div>
              </td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                </div>
              </td>
              <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                  </div>
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>2X LOYALTY POINTS</span></td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                </div>
              </td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                </div>
              </td>
              <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                </div>
              </td>
              <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                  </div>
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ borderRight: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '8px 4px 0', textTransform: 'uppercase', fontWeight: '500', verticalAlign: 'top', color: '#EB1C24', textAlign: 'center', minWidth: '68px', maxWidth: '68px', fontSize: '10px' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>PRICE</span></td>
              <td style={{ borderRight: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '8px 4px 0', textAlign: 'center', verticalAlign: 'top', fontSize: '10px' }}>FREE</td>
              <td style={{ borderRight: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '8px 4px 0', textAlign: 'center', verticalAlign: 'top', fontSize: '10px' }}>
                <span dangerouslySetInnerHTML={formatPrice(280)} />
                <button
                  onClick={() => {
                    // If changing subscription, don't allow deselection of current tier
                    if (hasPremiumSubscription && selectedTier === '3months') {
                      return; // Can't deselect current subscription
                    }
                    setSelectedTier(selectedTier === '3months' ? null : '3months');
                  }}
                  className="font-futura w-full text-center py-1 text-[10px] font-semibold bg-transparent cursor-pointer"
                  style={{ 
                    border: 'none',
                    color: selectedTier === '3months' ? '#EB1C24' : BRAND_GRAY,
                    marginTop: '2px',
                    fontFamily: '"Futura PT Medium"',
                    backgroundColor: 'transparent',
                    textTransform: 'uppercase',
                    display: 'block',
                    width: '100%',
                    padding: '4px 0'
                  }}
                  type="button"
                >
                  {selectedTier === '3months' ? (hasPremiumSubscription ? 'SELECTED' : 'DESELECT') : 'SELECT'}
                </button>
              </td>
              <td style={{ borderRight: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '8px 4px 0', textAlign: 'center', verticalAlign: 'top', fontSize: '10px' }}>
                <span dangerouslySetInnerHTML={formatPrice(520)} />
                <button
                  onClick={() => {
                    // If changing subscription, don't allow deselection of current tier
                    if (hasPremiumSubscription && selectedTier === '6months') {
                      return; // Can't deselect current subscription
                    }
                    setSelectedTier(selectedTier === '6months' ? null : '6months');
                  }}
                  className="font-futura w-full text-center py-1 text-[10px] font-semibold bg-transparent cursor-pointer"
                  style={{ 
                    border: 'none',
                    color: selectedTier === '6months' ? '#EB1C24' : BRAND_GRAY,
                    marginTop: '2px',
                    fontFamily: '"Futura PT Medium"',
                    backgroundColor: 'transparent',
                    textTransform: 'uppercase',
                    display: 'block',
                    width: '100%',
                    padding: '4px 0'
                  }}
                  type="button"
                >
                  {selectedTier === '6months' ? (hasPremiumSubscription ? 'SELECTED' : 'DESELECT') : 'SELECT'}
                </button>
              </td>
              <td style={{ fontFamily: '"Futura PT Medium"', padding: '8px 4px 0', textAlign: 'center', verticalAlign: 'top', fontSize: '10px' }}>
                <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                  <span dangerouslySetInnerHTML={formatPrice(960)} />
                  <button
                    onClick={() => {
                      // If changing subscription, don't allow deselection of current tier
                      if (hasPremiumSubscription && selectedTier === '12months') {
                        return; // Can't deselect current subscription
                      }
                      setSelectedTier(selectedTier === '12months' ? null : '12months');
                    }}
                    className="font-futura w-full text-center py-1 text-[10px] font-semibold bg-transparent cursor-pointer"
                    style={{ 
                      border: 'none',
                      color: selectedTier === '12months' ? '#EB1C24' : BRAND_GRAY,
                      marginTop: '2px',
                      fontFamily: '"Futura PT Medium"',
                      backgroundColor: 'transparent',
                      textTransform: 'uppercase',
                      display: 'block',
                      width: '100%',
                      padding: '4px 0'
                    }}
                    type="button"
                  >
                    {selectedTier === '12months' ? (hasPremiumSubscription ? 'SELECTED' : 'DESELECT') : 'SELECT'}
                  </button>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Total Due Today - negative margin pulls card bottom up without changing button distance (12px) from card */}
      <div style={{ textAlign: 'center', marginBottom: '-10px', paddingBottom: '0' }}>
        <p
          style={{
            fontFamily: '"Futura PT Medium"',
            color: '#EB1C24',
            fontSize: '11px',
            margin: '0 0 4px 0',
            textTransform: 'uppercase',
            fontWeight: '500'
          }}
        >
          TOTAL DUE TODAY
        </p>
        <p
          style={{
            fontFamily: '"Futura PT Medium"',
            color: '#000000',
            fontSize: '14px',
            margin: '0',
            paddingBottom: '0',
            lineHeight: '1.2',
            fontWeight: '500'
          }}
        >
          <span dangerouslySetInnerHTML={formatPrice(selectedTier ? subscriptionTiers[selectedTier as keyof typeof subscriptionTiers].price : 0)} />
        </p>
        </div>
      </div>
    </>
  );

  if (embedded) {
    return <div style={{ width: '100%' }}>{chartBody}</div>;
  }

  return (
    <div
      className="border border-black bg-white/60 backdrop-blur-sm w-full transition-all duration-300 ease-out"
      style={{
        borderWidth: '1.3px',
        padding: '20px 20px 0 20px',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
      }}
    >
      {chartBody}
    </div>
  );
}
