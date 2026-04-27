/**
 * Shared “analytics card” shell for Admin overview tabs (Revenue, Meetings, Pending).
 * Matches Admin → Meetings appointment/consult card styling (`AdminMeetingsHub`).
 */

import type { ReactNode } from 'react';

export function AdminOverviewAnalyticsCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '0', padding: '10px' }}>
      <div style={{ paddingLeft: '4px', paddingRight: '4px' }}>
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#000', margin: 0 }}>{title}</p>
        <div style={{ marginTop: '8px' }}>{children}</div>
      </div>
    </div>
  );
}

export type AdminOverviewMetricRow = {
  label: string;
  value: string;
  valueRed?: boolean;
  /** When set, overrides `valueRed` / default value color (e.g. **FINANCIAL HEALTH** cash/debt). */
  valueColor?: string;
  /** Wider value column (e.g. long city lists). Label column stays min-content; default `58%`. */
  valueMaxWidth?: string;
  valueWhiteSpace?: 'normal' | 'nowrap';
};

export function AdminOverviewMetricRows({
  rows,
  valueSingleLine = false,
}: {
  rows: AdminOverviewMetricRow[];
  /** Value column uses remaining width + **nowrap** (ellipsis if still too long) — e.g. Admin Revenue **LIVE VIEW DATA**. */
  valueSingleLine?: boolean;
}) {
  const valueColor = (row: AdminOverviewMetricRow) =>
    row.valueColor ?? (row.valueRed === false ? '#334155' : '#EB1C24');
  return (
    <>
      {rows.map((row, idx) => (
        <div
          key={row.label}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 0',
            borderBottom: idx < rows.length - 1 ? '1px solid #e5e7eb' : undefined,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontFamily: '"Futura PT Book"',
              fontSize: '9px',
              color: '#808080',
              textTransform: 'uppercase',
              flexShrink: 0,
            }}
          >
            {row.label}
          </span>
          <span
            style={
              valueSingleLine
                ? {
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '9px',
                    color: valueColor(row),
                    flex: '1 1 0',
                    minWidth: 0,
                    textTransform: 'uppercase',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }
                : {
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '9px',
                    color: valueColor(row),
                    flexShrink: 0,
                    textTransform: 'uppercase',
                    textAlign: 'right',
                    maxWidth: row.valueMaxWidth ?? '58%',
                    wordBreak: 'break-word',
                    whiteSpace: row.valueWhiteSpace ?? 'normal',
                  }
            }
          >
            {row.value}
          </span>
        </div>
      ))}
    </>
  );
}
