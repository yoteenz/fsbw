import type { ReactNode } from 'react';
import { HQ, HQ_STYLES, hqGlassPanel, hqLabel } from './hqExperienceTheme';

type HqWingZoneProps = {
  wing: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  accentHex?: string;
};

/** Architectural wing — spaced immersive zone with visual transition. */
export function HqWingZone({ wing, title, subtitle, children, accentHex = HQ.red }: HqWingZoneProps) {
  return (
    <section
      className="hq-wing-enter relative"
      data-hq-wing={wing}
      style={{ marginTop: HQ.wingGap, paddingTop: 8 }}
      aria-label={title}
    >
      <div className="flex items-end justify-between gap-3 mb-4 px-1">
        <div>
          <p style={{ ...hqLabel, color: accentHex, margin: 0 }}>{wing}</p>
          <p
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '11px',
              letterSpacing: '0.06em',
              color: HQ.black,
              margin: '4px 0 0',
            }}
          >
            {title}
          </p>
          {subtitle ? (
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: HQ.gray, margin: '4px 0 0' }}>{subtitle}</p>
          ) : null}
        </div>
        <div
          aria-hidden
          style={{
            width: 48,
            height: 2,
            background: `linear-gradient(90deg, ${accentHex}, transparent)`,
            borderRadius: 2,
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
    </section>
  );
}

export function HqExperienceStyles() {
  return <style>{HQ_STYLES}</style>;
}

export function HqGlassSurface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={className} style={{ ...hqGlassPanel, padding: HQ.zonePadding, position: 'relative', overflow: 'hidden' }}>
      {children}
    </div>
  );
}
