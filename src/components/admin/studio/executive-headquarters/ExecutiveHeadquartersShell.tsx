import type { ReactNode, CSSProperties } from 'react';
import { HQ, HQ_STYLES, hqGlassPanel, hqLabel } from '../headquarters-experience/hqExperienceTheme';
import { HqExperienceStyles } from '../headquarters-experience/HqWingZone';

type Props = {
  children: ReactNode;
  companyName: string;
  roomTitle: string;
  onExit?: () => void;
};

/** Executive Headquarters™ — immersive glass shell, not admin dashboard. */
export function ExecutiveHeadquartersShell({ children, companyName, roomTitle, onExit }: Props) {
  return (
    <div
      className="executive-hq-shell relative h-full w-full overflow-hidden"
      style={{
        background:
          'linear-gradient(165deg, #f8f6f3 0%, #efeae4 35%, #f5f2ee 70%, #faf8f5 100%)',
      }}
      role="application"
      aria-label="Executive Headquarters"
    >
      <HqExperienceStyles />
      <style>{`
        .executive-hq-shell {
          font-family: "Futura PT Book", sans-serif;
        }
        .executive-hq-marble {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.35;
          background-image: url('/assets/marble-half.png');
          background-size: 480px;
          background-repeat: repeat;
        }
        .executive-hq-scroll {
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }
        .executive-hq-nav-item {
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .executive-hq-nav-item:hover:not([data-locked="true"]) {
          background: rgba(255,255,255,0.65);
          transform: translateX(2px);
        }
        .executive-hq-nav-item[data-active="true"] {
          background: rgba(255,255,255,0.85);
          border-left: 2px solid ${HQ.red};
        }
      `}</style>
      <div className="executive-hq-marble" aria-hidden />

      <header
        className="relative z-20 flex items-center justify-between gap-3 px-4 py-3"
        style={{
          ...hqGlassPanel,
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
        }}
      >
        <div>
          <p style={{ ...hqLabel, color: HQ.red, margin: 0 }}>EXECUTIVE HEADQUARTERS™</p>
          <p
            style={{
              fontFamily: '"Covered By Your Grace", sans-serif',
              fontSize: '16px',
              margin: '2px 0 0',
              color: HQ.black,
            }}
          >
            {companyName}
          </p>
        </div>
        <div className="text-right">
          <p style={{ ...hqLabel, margin: 0 }}>CURRENT ROOM</p>
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: HQ.black, marginTop: 2 }}>
            {roomTitle}
          </p>
        </div>
        {onExit ? (
          <button type="button" onClick={onExit} style={exitBtnStyle}>
            EXIT HQ
          </button>
        ) : null}
      </header>

      <div className="relative z-10 flex h-[calc(100%-52px)]">{children}</div>
    </div>
  );
}

const exitBtnStyle: CSSProperties = {
  border: '1px solid rgba(0,0,0,0.12)',
  background: 'rgba(255,255,255,0.7)',
  fontFamily: '"Futura PT Medium"',
  fontSize: '7px',
  letterSpacing: '0.08em',
  padding: '6px 10px',
  cursor: 'pointer',
  borderRadius: 4,
};

export function ExecutiveHeadquartersScroll({ children }: { children: ReactNode }) {
  return <div className="executive-hq-scroll flex-1 p-4">{children}</div>;
}

export { HQ_STYLES };
