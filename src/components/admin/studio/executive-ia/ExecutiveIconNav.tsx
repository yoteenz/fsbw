import { EIA, eiaCaption, eiaGrace, eiaPanelLight } from './executiveIaTheme';

export type ExecutiveIconNavItem = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  status?: 'active' | 'attention' | 'idle' | 'blocked';
  onSelect?: () => void;
};

type ExecutiveIconNavProps = {
  items: ExecutiveIconNavItem[];
  activeId?: string;
  label?: string;
};

const STATUS_DOT: Record<NonNullable<ExecutiveIconNavItem['status']>, string> = {
  active: EIA.pass,
  attention: EIA.red,
  idle: EIA.gray,
  blocked: EIA.warn,
};

/** Icon-supported department navigation — destination, not documentation tabs. */
export function ExecutiveIconNav({ items, activeId, label = 'DEPARTMENTS' }: ExecutiveIconNavProps) {
  return (
    <nav aria-label={label}>
      <p
        style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '9px',
          color: EIA.gray,
          letterSpacing: '0.08em',
          marginBottom: 10,
        }}
      >
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const selected = item.id === activeId;
          const statusColor = item.status ? STATUS_DOT[item.status] : EIA.gray;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onSelect}
              className="text-left transition-transform active:scale-[0.98]"
              style={{
                ...eiaPanelLight,
                padding: '10px 12px',
                border: selected ? `2px solid ${EIA.red}` : EIA.border,
                background: selected ? 'rgba(235,28,36,0.06)' : 'rgba(255,255,255,0.72)',
                cursor: item.onSelect ? 'pointer' : 'default',
              }}
            >
              <div className="flex items-start gap-2">
                <span style={{ fontSize: '18px', lineHeight: 1 }} aria-hidden>
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p
                      style={{
                        ...eiaCaption,
                        color: selected ? EIA.red : EIA.black,
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '8px',
                      }}
                    >
                      {item.title}
                    </p>
                    {item.status ? (
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: statusColor,
                          flexShrink: 0,
                        }}
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <p style={{ ...eiaCaption, fontSize: '7px', marginTop: 2 }}>{item.subtitle}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function ExecutiveIconNavMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p style={{ ...eiaGrace, fontSize: '14px', color: EIA.red }}>{value}</p>
      <p style={eiaCaption}>{label}</p>
    </div>
  );
}
