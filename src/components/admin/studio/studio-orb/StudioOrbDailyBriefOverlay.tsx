import type { CSSProperties } from 'react';
import { orbLabel, ORB_VISUAL } from './studioOrbTheme';
import { useStudioOrbRecommendations } from '../../../../hooks/useStudioOrbRecommendations';

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 100055,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  background: 'rgba(0,0,0,0.35)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
};

const cardStyle: CSSProperties = {
  width: 'min(92vw, 340px)',
  background: 'rgba(255,255,255,0.96)',
  border: ORB_VISUAL.border,
  borderRadius: 16,
  padding: '18px 20px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};

/** The Daily Brief™ — greets founder on Studio World entry. */
export function StudioOrbDailyBriefOverlay() {
  const { showDailyBrief, dismissDailyBrief, snapshot } = useStudioOrbRecommendations();

  if (!showDailyBrief) return null;

  return (
    <div style={overlayStyle} role="dialog" aria-label="Studio Orb daily brief">
      <div style={cardStyle}>
        <p style={{ ...orbLabel, fontSize: 6, margin: 0, color: ORB_VISUAL.gold }}>
          STUDIO ORB™ · THE DAILY BRIEF™
        </p>
        <p
          style={{
            fontFamily: '"Futura PT Demi", "Futura PT", futuristic-pt, Futura, sans-serif',
            fontSize: 18,
            fontWeight: 600,
            margin: '8px 0 12px',
            lineHeight: 1.2,
            textTransform: 'uppercase',
            color: ORB_VISUAL.brandRed,
          }}
        >
          {snapshot.dailyBrief.greeting}
        </p>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 10, lineHeight: 1.5, textTransform: 'uppercase' }}>
          {snapshot.dailyBrief.lines.map((line: string) => (
            <li key={line} style={{ marginBottom: 6, color: ORB_VISUAL.text }}>
              {line}
            </li>
          ))}
        </ul>
        {snapshot.dailyBrief.highPriorityCount > 0 ? (
          <p style={{ ...orbLabel, fontSize: 7, margin: '12px 0 0', color: ORB_VISUAL.brandRed }}>
            {snapshot.dailyBrief.highPriorityCount} HIGH-PRIORITY RECOMMENDATION
            {snapshot.dailyBrief.highPriorityCount === 1 ? '' : 'S'} READY
          </p>
        ) : null}
        <button
          type="button"
          onClick={dismissDailyBrief}
          style={{
            marginTop: 16,
            width: '100%',
            padding: '10px 12px',
            border: ORB_VISUAL.border,
            background: '#fff',
            color: ORB_VISUAL.brandRed,
            fontSize: 8,
            letterSpacing: '0.12em',
            cursor: 'pointer',
            fontFamily: 'inherit',
            textTransform: 'uppercase',
          }}
        >
          ENTER STUDIO WORLD
        </button>
      </div>
    </div>
  );
}
