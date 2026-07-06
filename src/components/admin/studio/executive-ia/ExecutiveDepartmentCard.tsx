import type { ReactNode } from 'react';
import { EIA, eiaCaption } from './executiveIaTheme';
import type { ExecutiveDepartmentStatus } from './executiveIaDepartments';
import { ExecutiveHealthRing } from './ExecutiveHealthRing';

export type ExecutiveDepartmentCardProps = {
  id: string;
  icon: string;
  name: string;
  description: string;
  statusLabel: string;
  healthPct?: number;
  status?: ExecutiveDepartmentStatus;
  selected?: boolean;
  onSelect?: () => void;
  onEnter?: () => void;
  enterLabel?: string;
};

const STATUS_COLOR: Record<ExecutiveDepartmentStatus, string> = {
  active: EIA.pass,
  attention: EIA.red,
  idle: EIA.gray,
  blocked: EIA.warn,
};

/** M83 Department Card — destination inside Headquarters, not a text tab. */
export function ExecutiveDepartmentCard({
  icon,
  name,
  description,
  statusLabel,
  healthPct,
  status = 'idle',
  selected = false,
  onSelect,
  onEnter,
  enterLabel = 'OPEN →',
}: ExecutiveDepartmentCardProps) {
  return (
    <div
      className="transition-transform active:scale-[0.98]"
      style={{
        padding: '12px 14px',
        background: selected ? 'rgba(235,28,36,0.06)' : 'rgba(255,255,255,0.72)',
        border: selected ? `2px solid ${EIA.red}` : EIA.border,
        backdropFilter: 'blur(8px)',
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left"
        style={{ border: 'none', background: 'transparent', cursor: onSelect ? 'pointer' : 'default', padding: 0 }}
      >
        <div className="flex items-start gap-3">
          <span style={{ fontSize: '22px', lineHeight: 1 }} aria-hidden>
            {icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '9px',
                  color: selected ? EIA.red : EIA.black,
                  letterSpacing: '0.04em',
                }}
              >
                {name}
              </p>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: STATUS_COLOR[status],
                  flexShrink: 0,
                }}
                aria-hidden
              />
            </div>
            <p style={{ ...eiaCaption, fontSize: '7px', marginTop: 4, color: EIA.black }}>{description}</p>
            <p style={{ ...eiaCaption, fontSize: '7px', marginTop: 6 }}>{statusLabel}</p>
          </div>
          {typeof healthPct === 'number' ? (
            <ExecutiveHealthRing value={healthPct} size={40} accent={selected ? EIA.red : EIA.black} />
          ) : null}
        </div>
      </button>
      {onEnter ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEnter();
          }}
          style={{
            marginTop: 10,
            border: EIA.borderStrong,
            color: EIA.red,
            fontFamily: '"Futura PT Medium"',
            backgroundColor: '#FFFFFF',
            fontSize: '7px',
            textTransform: 'uppercase',
            padding: '4px 8px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          {enterLabel}
        </button>
      ) : null}
    </div>
  );
}

type ExecutiveDepartmentCardsProps = {
  label?: string;
  children: ReactNode;
};

export function ExecutiveDepartmentCards({ label = 'DEPARTMENTS', children }: ExecutiveDepartmentCardsProps) {
  return (
    <nav aria-label={label}>
      <p
        style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '9px',
          color: EIA.gray,
          letterSpacing: '0.08em',
          marginBottom: 12,
        }}
      >
        {label}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </nav>
  );
}
