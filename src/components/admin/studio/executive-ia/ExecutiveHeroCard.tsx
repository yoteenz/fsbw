import type { ReactNode } from 'react';
import { EIA, eiaCaption, eiaGrace, eiaPanel, eiaSectionTitle } from './executiveIaTheme';

type ExecutiveHeroStat = {
  label: string;
  value: string;
};

type ExecutiveHeroCardProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  progressPct?: number;
  stats?: ExecutiveHeroStat[];
  footer?: ReactNode;
};

/** Single visual anchor — today's priority, mission status, portfolio health, etc. */
export function ExecutiveHeroCard({
  eyebrow,
  title,
  subtitle,
  progressPct,
  stats = [],
  footer,
}: ExecutiveHeroCardProps) {
  return (
    <section
      className="studio-wing-section studio-living-panel"
      style={{ ...eiaPanel, padding: EIA.cardPaddingLarge, border: EIA.borderStrong }}
    >
      {eyebrow ? <p style={{ ...eiaCaption, marginBottom: 6 }}>{eyebrow}</p> : null}
      <p style={{ ...eiaGrace, fontSize: '24px', lineHeight: 1.1 }}>{title}</p>
      {subtitle ? <p style={{ ...eiaCaption, color: EIA.black, marginTop: 6 }}>{subtitle}</p> : null}

      {typeof progressPct === 'number' ? (
        <div
          className="mt-4 relative h-3 w-full overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.06)', border: EIA.border }}
        >
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${EIA.red} 0%, #C41E3A 100%)`,
            }}
          />
        </div>
      ) : null}

      {stats.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center py-2" style={{ background: 'rgba(0,0,0,0.03)' }}>
              <p style={{ ...eiaGrace, fontSize: '16px', color: EIA.red }}>{stat.value}</p>
              <p style={eiaCaption}>{stat.label}</p>
            </div>
          ))}
        </div>
      ) : null}

      {footer ? <div className="mt-4">{footer}</div> : null}
    </section>
  );
}

export function ExecutiveHeroLabel({ children }: { children: ReactNode }) {
  return <p style={eiaSectionTitle}>{children}</p>;
}
