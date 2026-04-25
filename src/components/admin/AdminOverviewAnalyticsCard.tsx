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

export type AdminOverviewMetricRow = { label: string; value: string; valueRed?: boolean };

export function AdminOverviewMetricRows({ rows }: { rows: AdminOverviewMetricRow[] }) {
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
          }}
        >
          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', textTransform: 'uppercase' }}>
            {row.label}
          </span>
          <span
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '9px',
              color: row.valueRed === false ? '#334155' : '#EB1C24',
              flexShrink: 0,
              textTransform: 'uppercase',
              textAlign: 'right',
              maxWidth: '58%',
              wordBreak: 'break-word',
            }}
          >
            {row.value}
          </span>
        </div>
      ))}
    </>
  );
}
