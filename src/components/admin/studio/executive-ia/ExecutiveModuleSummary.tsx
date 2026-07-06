import { useState, type ReactNode } from 'react';
import { EIA, eiaActionBtn, eiaCaption, eiaGrace } from './executiveIaTheme';
import { ExecutiveHealthRing } from './ExecutiveHealthRing';
import type { ExecutiveDepartmentStatus } from './executiveIaDepartments';

type ExecutiveModuleSummaryProps = {
  icon: string;
  title: string;
  moduleCount: number;
  statusLabel: string;
  healthPct?: number;
  status?: ExecutiveDepartmentStatus;
  onOpen?: () => void;
  openLabel?: string;
  children?: ReactNode;
  defaultExpanded?: boolean;
};

/** M83 — modules feel installed, not permanently exposed. */
export function ExecutiveModuleSummary({
  icon,
  title,
  moduleCount,
  statusLabel,
  healthPct,
  onOpen,
  openLabel = 'OPEN DEPARTMENT →',
  children,
  defaultExpanded = false,
}: ExecutiveModuleSummaryProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const countLabel = moduleCount === 1 ? '1 MODULE INSTALLED' : `${moduleCount} MODULES INSTALLED`;

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.65)',
        borderLeft: `3px solid ${EIA.red}`,
        padding: '12px 14px',
        marginBottom: 12,
      }}
    >
      <div className="flex items-start gap-3">
        <span style={{ fontSize: '24px', lineHeight: 1 }} aria-hidden>
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p style={{ ...eiaGrace, fontSize: '16px' }}>{title}</p>
          <p style={{ ...eiaCaption, color: EIA.black, marginTop: 4 }}>{countLabel}</p>
          <p style={{ ...eiaCaption, fontSize: '7px', marginTop: 2 }}>{statusLabel}</p>
        </div>
        {typeof healthPct === 'number' ? <ExecutiveHealthRing value={healthPct} size={44} /> : null}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {onOpen ? (
          <button type="button" onClick={onOpen} style={eiaActionBtn}>
            {openLabel}
          </button>
        ) : null}
        {children ? (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            style={{ ...eiaActionBtn, color: EIA.gray, borderColor: EIA.border }}
          >
            {expanded ? 'HIDE MODULES' : 'VIEW MODULES'}
          </button>
        ) : null}
      </div>

      {expanded && children ? (
        <div className="executive-ia-wing-enter mt-4 pt-3" style={{ borderTop: `1px solid rgba(0,0,0,0.06)` }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
