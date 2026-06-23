import { useCallback } from 'react';
import type { PenthouseSuitePanelDef } from '../../constants/desktopPenthouseSuite';
import './PenthouseSuiteHotspot.css';

type Props = {
  panel: PenthouseSuitePanelDef;
  onActivate: (panel: PenthouseSuitePanelDef) => void;
  debug?: boolean;
};

export function PenthouseSuiteHotspot({ panel, onActivate, debug = false }: Props) {
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate(panel);
      }
    },
    [onActivate, panel],
  );

  return (
    <button
      type="button"
      className={`penthouse-suite-hotspot${debug ? ' penthouse-suite-hotspot--debug' : ''}`}
      aria-label={panel.ariaLabel}
      onClick={() => onActivate(panel)}
      onKeyDown={onKeyDown}
    >
      <span className="penthouse-suite-hotspot__label" aria-hidden>
        <span className="penthouse-suite-hotspot__label-dot" />
        <span className="penthouse-suite-hotspot__label-text">{panel.label}</span>
      </span>
      {debug ? (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: 2,
            top: 2,
            fontFamily: 'monospace',
            fontSize: 9,
            lineHeight: 1.2,
            color: '#000',
            background: 'rgba(255,255,255,0.8)',
            padding: '1px 3px',
            pointerEvents: 'none',
          }}
        >
          {panel.id}
        </span>
      ) : null}
    </button>
  );
}
