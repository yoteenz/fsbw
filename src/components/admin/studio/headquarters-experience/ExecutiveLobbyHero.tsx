import type { ReactNode } from 'react';
import { HQ, hqActionBtn, hqBody, hqGrace, hqLabel } from './hqExperienceTheme';
import { HqGlassSurface } from './HqWingZone';

export type ExecutiveLobbyProps = {
  organizationName: string;
  environmentName: string;
  dateLabel: string;
  clockLabel: string;
  statusLabel: string;
  greeting: string;
  overnight?: string;
  opportunity?: string;
  risk?: string;
  mission?: string;
  topPriority?: string;
  metrics?: Array<{ label: string; value: string }>;
  onOpenBriefing?: () => void;
  briefingExpanded?: boolean;
  briefingDetail?: ReactNode;
  accentHex?: string;
  /** Living Headquarters™ — quiet celebration or anniversary acknowledgment. */
  celebrationMessage?: string | null;
  livingMemory?: string | null;
  collectionSlot?: ReactNode;
};

/** Executive Lobby™ — immersive hero environment replacing dark briefing cards. */
export function ExecutiveLobbyHero({
  organizationName,
  environmentName,
  dateLabel,
  clockLabel,
  statusLabel,
  greeting,
  overnight,
  opportunity,
  risk,
  mission,
  topPriority,
  metrics = [],
  onOpenBriefing,
  briefingExpanded = false,
  briefingDetail,
  accentHex = HQ.red,
  celebrationMessage,
  livingMemory,
  collectionSlot,
}: ExecutiveLobbyProps) {
  return (
    <HqGlassSurface className="hq-lobby-hero">
      <div className="living-hq-atmosphere" aria-hidden />
      <div className="hq-lobby-ambient" aria-hidden />
      <span className="hq-floating-particle" style={{ top: '18%', left: '12%', animationDelay: '0s' }} aria-hidden />
      <span className="hq-floating-particle" style={{ top: '32%', right: '18%', animationDelay: '2s' }} aria-hidden />
      <span className="hq-floating-particle" style={{ bottom: '24%', left: '28%', animationDelay: '4s' }} aria-hidden />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p style={{ ...hqLabel, color: accentHex, margin: 0 }}>{environmentName.toUpperCase()}</p>
            <p style={{ ...hqGrace, fontSize: '22px', lineHeight: 1.1, margin: '6px 0 0' }}>{organizationName}</p>
            <p style={{ ...hqBody, fontSize: '7px', color: HQ.gray, marginTop: 6 }}>
              {dateLabel} · {statusLabel}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p style={{ ...hqGrace, fontSize: '18px', color: accentHex, margin: 0 }}>{clockLabel}</p>
            <p style={{ ...hqLabel, fontSize: '5px', marginTop: 4 }}>HEADQUARTERS TIME</p>
          </div>
        </div>

        <div
          className="mt-5 p-4 rounded-lg"
          style={{
            background: 'rgba(255,255,255,0.55)',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
          }}
        >
          <p style={{ ...hqLabel, margin: 0 }}>EXECUTIVE BRIEFING</p>
          <p style={{ ...hqGrace, fontSize: '16px', margin: '8px 0 0' }}>{greeting}</p>

          {celebrationMessage ? (
            <p className="living-hq-commemorative" style={{ ...hqGrace, fontSize: '12px', margin: '10px 0 0' }}>
              {celebrationMessage}
            </p>
          ) : null}
          {livingMemory ? (
            <p className="living-hq-memory" style={{ ...hqBody, fontSize: '8px', margin: '8px 0 0', fontStyle: 'italic' }}>
              {livingMemory}
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-2 mt-4">
            {overnight ? (
              <BriefLine label="OVERNIGHT" text={overnight} />
            ) : null}
            {opportunity ? (
              <BriefLine label="OPPORTUNITY" text={opportunity} accent={HQ.gold} />
            ) : null}
            {risk ? (
              <BriefLine label="RISK" text={risk} accent={HQ.red} />
            ) : null}
            {mission || topPriority ? (
              <BriefLine label="TODAY'S MISSION" text={mission ?? topPriority ?? ''} accent={accentHex} emphasis />
            ) : null}
          </div>

          {onOpenBriefing ? (
            <button type="button" onClick={onOpenBriefing} style={{ ...hqActionBtn, marginTop: 14 }}>
              {briefingExpanded ? 'CLOSE FULL BRIEFING' : 'OPEN FULL BRIEFING'}
            </button>
          ) : null}
        </div>

        {briefingExpanded && briefingDetail ? <div className="mt-4">{briefingDetail}</div> : null}

        {metrics.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 mt-4 sm:grid-cols-4">
            {metrics.slice(0, 4).map((m) => (
              <div
                key={m.label}
                className="text-center py-2 px-1 rounded-md"
                style={{ background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(0,0,0,0.05)' }}
              >
                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: accentHex, margin: 0 }}>{m.value}</p>
                <p style={{ ...hqLabel, fontSize: '5px', marginTop: 4 }}>{m.label}</p>
              </div>
            ))}
          </div>
        ) : null}

        {collectionSlot}
      </div>
    </HqGlassSurface>
  );
}

function BriefLine({
  label,
  text,
  accent = HQ.black,
  emphasis = false,
}: {
  label: string;
  text: string;
  accent?: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <p style={{ ...hqLabel, fontSize: '5px', margin: 0 }}>{label}</p>
      <p
        style={{
          ...(emphasis ? hqGrace : hqBody),
          fontSize: emphasis ? '13px' : '8px',
          color: accent,
          margin: '2px 0 0',
          lineHeight: 1.45,
        }}
      >
        {text}
      </p>
    </div>
  );
}
