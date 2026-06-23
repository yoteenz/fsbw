import type { ReactNode } from 'react';
import './DesktopPanelTextOverlay.css';

export type PanelTextLine = {
  text: string;
  accent?: boolean;
};

type Props = {
  lines: PanelTextLine[];
  ariaLabel: string;
  onActivate: () => void;
  debug?: boolean;
  align?: 'left' | 'center';
  children?: ReactNode;
};

/** Transparent typography etched inside an existing scene panel — no cards, icons, or fills. */
export function DesktopPanelTextOverlay({
  lines,
  ariaLabel,
  onActivate,
  debug = false,
  align = 'left',
}: Props) {
  return (
    <button
      type="button"
      className={[
        'desktop-panel-text',
        align === 'center' ? 'desktop-panel-text--center' : '',
        debug ? 'desktop-panel-text--debug' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
      onClick={onActivate}
    >
      {lines.map((line) => (
        <p
          key={line.text}
          className={[
            'desktop-panel-text__line',
            line.accent ? 'desktop-panel-text__line--accent' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {line.text}
        </p>
      ))}
    </button>
  );
}
