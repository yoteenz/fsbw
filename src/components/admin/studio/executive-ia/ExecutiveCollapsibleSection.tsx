import { useState, type ReactNode } from 'react';
import { EIA, eiaCaption, eiaPanel, eiaSectionTitle } from './executiveIaTheme';

type ExecutiveCollapsibleSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: string;
};

/** Data-heavy areas collapsed by default — expand on request. */
export function ExecutiveCollapsibleSection({
  title,
  subtitle,
  children,
  defaultOpen = false,
  badge,
}: ExecutiveCollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ ...eiaPanel, marginBottom: 0 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-3 flex justify-between items-center gap-2"
        style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p style={{ ...eiaSectionTitle, margin: 0 }}>{title}</p>
            {badge ? (
              <span
                style={{
                  ...eiaCaption,
                  fontSize: '7px',
                  color: EIA.red,
                  fontFamily: '"Futura PT Medium"',
                  padding: '1px 5px',
                  border: `1px solid ${EIA.red}`,
                }}
              >
                {badge}
              </span>
            ) : null}
          </div>
          {subtitle && !open ? (
            <p style={{ ...eiaCaption, fontSize: '8px', marginTop: 4 }}>{subtitle}</p>
          ) : null}
        </div>
        <span style={{ ...eiaCaption, fontSize: '14px', color: EIA.gray }}>{open ? '−' : '+'}</span>
      </button>
      {open ? <div className="px-3 pb-4 pt-0">{children}</div> : null}
    </div>
  );
}
