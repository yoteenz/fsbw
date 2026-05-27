import type { CSSProperties, ReactNode } from 'react';

export const BRAND_GRAY = '#808080';
export const CHART_BORDER = '0.8px solid #000';

const premiumChartLabelTd: CSSProperties = {
  borderRight: CHART_BORDER,
  borderBottom: CHART_BORDER,
  fontFamily: '"Futura PT Medium"',
  padding: '6px 4px',
  textTransform: 'uppercase',
  color: BRAND_GRAY,
  textAlign: 'center',
  minWidth: '68px',
  maxWidth: '68px',
  lineHeight: '1.25'
};

function PremiumChartIncCell({
  inc,
  borderRight = true,
  marginLeft12 = false
}: {
  inc: boolean;
  borderRight?: boolean;
  marginLeft12?: boolean;
}) {
  const inner = (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <img
        src={inc ? '/assets/premium-check.svg' : '/assets/premium-x.svg'}
        alt={inc ? 'Included' : 'Not included'}
        style={inc ? { width: '10px', height: '10px' } : { width: '15.2px', height: '15.2px' }}
      />
    </div>
  );
  return (
    <td
      style={{
        borderRight: borderRight ? CHART_BORDER : undefined,
        borderBottom: CHART_BORDER,
        fontFamily: '"Futura PT Book"',
        padding: '6px 4px',
        textAlign: 'center'
      }}
    >
      {marginLeft12 ? (
        <span style={{ display: 'inline-block', marginLeft: '12px' }}>{inner}</span>
      ) : (
        inner
      )}
    </td>
  );
}

export function PremiumChartBenefitRow({
  label,
  m3,
  m6,
  m12
}: {
  label: ReactNode;
  m3: boolean;
  m6: boolean;
  m12: boolean;
}) {
  return (
    <tr>
      <td style={premiumChartLabelTd}>
        <span style={{ display: 'inline-block', marginLeft: '-12px' }}>{label}</span>
      </td>
      <PremiumChartIncCell inc={false} />
      <PremiumChartIncCell inc={m3} />
      <PremiumChartIncCell inc={m6} />
      <PremiumChartIncCell inc={m12} borderRight={false} marginLeft12 />
    </tr>
  );
}

