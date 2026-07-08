import type { CSSProperties } from 'react';
import { OrbIconDailyBrief } from './OrbIconSculptures';
import {
  orbBody,
  orbGrace,
  orbLabel,
  orbOverlayBackdropStyle,
  orbPrimaryBtnStyle,
  orbProjectionPanelStyle,
  ORB_VISUAL,
} from './studioOrbTheme';
import { useStudioOrbRecommendations } from '../../../../hooks/useStudioOrbRecommendations';

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 100055,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  ...orbOverlayBackdropStyle,
};

/** The Daily Brief™ — holographic projection from the Orb on Studio World entry. */
export function StudioOrbDailyBriefOverlay() {
  const { showDailyBrief, dismissDailyBrief, snapshot } = useStudioOrbRecommendations();

  if (!showDailyBrief) return null;

  return (
    <div style={overlayStyle} role="dialog" aria-label="Studio Orb daily brief">
      <div
        className="studio-conversation-dock-panel"
        style={{
          ...orbProjectionPanelStyle,
          width: 'min(92vw, 340px)',
          padding: '20px 22px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <OrbIconDailyBrief size={32} />
          <p style={{ ...orbLabel, fontSize: 6, margin: 0, color: ORB_VISUAL.champagne }}>
            STUDIO ORB™ · THE DAILY BRIEF™
          </p>
        </div>
        <p style={{ ...orbGrace, fontSize: 18, margin: '0 0 12px', lineHeight: 1.2 }}>{snapshot.dailyBrief.greeting}</p>
        <ul style={{ margin: 0, paddingLeft: 18, listStyle: 'none' }}>
          {snapshot.dailyBrief.lines.map((line: string) => (
            <li key={line} style={{ ...orbBody, fontSize: 9, marginBottom: 8, textTransform: 'uppercase' }}>
              · {line}
            </li>
          ))}
        </ul>
        {snapshot.dailyBrief.highPriorityCount > 0 ? (
          <p style={{ ...orbLabel, fontSize: 7, margin: '12px 0 0', color: ORB_VISUAL.champagneSoft }}>
            {snapshot.dailyBrief.highPriorityCount} HIGH-PRIORITY RECOMMENDATION
            {snapshot.dailyBrief.highPriorityCount === 1 ? '' : 'S'} READY
          </p>
        ) : null}
        <button
          type="button"
          onClick={dismissDailyBrief}
          style={{
            ...orbPrimaryBtnStyle,
            marginTop: 16,
            width: '100%',
          }}
        >
          ENTER STUDIO WORLD
        </button>
      </div>
    </div>
  );
}
