import type { ReactNode } from 'react';
import { EIA, eiaCaption, eiaGrace, eiaPanel, eiaSectionTitle } from './executiveIaTheme';

type ExecutiveFocusPanelProps = {
  title: string;
  subtitle?: string;
  highlight?: string;
  children: ReactNode;
};

/** Primary working area — one question answered here; everything else supports it. */
export function ExecutiveFocusPanel({ title, subtitle, highlight, children }: ExecutiveFocusPanelProps) {
  return (
    <section
      className="studio-wing-section studio-living-panel"
      style={{ ...eiaPanel, padding: EIA.cardPaddingLarge, border: EIA.borderStrong }}
    >
      <p style={eiaSectionTitle}>{title}</p>
      {subtitle ? <p style={{ ...eiaGrace, fontSize: '16px' }}>{subtitle}</p> : null}
      {highlight ? (
        <p style={{ ...eiaGrace, fontSize: '14px', color: EIA.red, marginTop: 8 }}>{highlight}</p>
      ) : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function ExecutiveFocusList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item} style={{ ...eiaCaption, color: EIA.black }}>
          • {item}
        </li>
      ))}
    </ul>
  );
}
