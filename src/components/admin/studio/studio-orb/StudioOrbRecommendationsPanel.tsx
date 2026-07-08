import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ORB_FOCUS_MODE_DESCRIPTIONS,
  ORB_FOCUS_MODE_LABELS,
  ORB_FOCUS_MODES,
  categoryLabel,
  type OrbFocusMode,
  type OrbRecommendation,
} from '../../../../studio-os-core/orb-recommendations';
import { useStudioOrbRecommendations } from '../../../../hooks/useStudioOrbRecommendations';
import { orbLabel, ORB_VISUAL } from './studioOrbTheme';
import { useStudioOrb } from './StudioOrbProvider';

const panelStyle: CSSProperties = {
  position: 'fixed',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 100048,
  width: 'min(92vw, 360px)',
  maxHeight: 'min(78vh, 520px)',
  overflow: 'auto',
  background: 'rgba(255,255,255,0.94)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: ORB_VISUAL.border,
  borderRadius: 14,
  padding: '14px 16px',
  boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
};

function RecommendationCard({
  rec,
  onAccept,
}: {
  rec: OrbRecommendation;
  onAccept: (rec: OrbRecommendation) => void;
}) {
  return (
    <article
      style={{
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 10,
        padding: '10px 12px',
        marginBottom: 8,
        background: rec.isSurprise ? 'rgba(235,28,36,0.04)' : 'rgba(255,255,255,0.6)',
      }}
    >
      <p style={{ ...orbLabel, fontSize: 7, margin: 0, color: ORB_VISUAL.brandRed }}>
        {rec.isSurprise ? 'SURPRISE DISCOVERY™' : categoryLabel(rec.category)} · {rec.priority}
      </p>
      <p style={{ ...orbLabel, fontSize: 8, margin: '4px 0', lineHeight: 1.35 }}>{rec.title}</p>
      <p style={{ fontSize: 9, margin: '0 0 6px', lineHeight: 1.4, textTransform: 'none', color: ORB_VISUAL.textMuted }}>
        {rec.reasoning}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 7, opacity: 0.75 }}>
        <span>IMPACT {rec.estimatedImpact}</span>
        <span>{rec.estimatedMinutes} MIN</span>
        <span>{rec.estimatedCost}</span>
        {rec.potentialSavings ? <span>SAVE {rec.potentialSavings}</span> : null}
        <span>CONF {rec.confidenceScore}%</span>
      </div>
      {rec.creativeEquityGained ? (
        <p style={{ fontSize: 7, margin: '4px 0 0', color: ORB_VISUAL.gold }}>{rec.creativeEquityGained}</p>
      ) : null}
      {rec.actionable && rec.targetPath ? (
        <button
          type="button"
          onClick={() => onAccept(rec)}
          style={{
            marginTop: 8,
            width: '100%',
            padding: '8px 10px',
            border: ORB_VISUAL.border,
            background: ORB_VISUAL.brandRed,
            color: '#fff',
            fontSize: 7,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          GO →
        </button>
      ) : null}
    </article>
  );
}

/** Orb Recommendations™ — Daily Brief, focus modes, executive journey. */
export function StudioOrbRecommendationsPanel() {
  const { activeSurface, closeSurface } = useStudioOrb();
  const orb = useStudioOrbRecommendations();
  const navigate = useNavigate();

  if (activeSurface !== 'recommendations') return null;

  const { snapshot } = orb;

  const handleJourneyStop = (path: string) => {
    navigate(path);
    closeSurface();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close recommendations"
        className="fixed inset-0 z-[100047]"
        style={{ background: 'rgba(0,0,0,0.25)', border: 'none', cursor: 'default' }}
        onClick={closeSurface}
      />
      <div style={panelStyle} role="dialog" aria-label="Studio Orb recommendations">
        <header style={{ marginBottom: 10 }}>
          <p style={{ ...orbLabel, fontSize: 6, margin: 0, color: ORB_VISUAL.gold }}>
            STUDIO ORB™ · EXECUTIVE CHIEF OF STAFF
          </p>
          <p style={{ ...orbLabel, fontSize: 9, margin: '4px 0 0' }}>ORB RECOMMENDATIONS™</p>
        </header>

        <section style={{ marginBottom: 12 }}>
          <p style={{ fontFamily: '"Covered By Your Grace", cursive', fontSize: 14, margin: '0 0 6px' }}>
            {snapshot.dailyBrief.greeting}
          </p>
          {snapshot.dailyBrief.lines.map((line: string) => (
            <p
              key={line}
              style={{ fontSize: 9, margin: '0 0 4px', lineHeight: 1.4, textTransform: 'none', color: ORB_VISUAL.text }}
            >
              {line}
            </p>
          ))}
        </section>

        <section style={{ marginBottom: 12 }}>
          <p style={{ ...orbLabel, fontSize: 6, margin: '0 0 6px' }}>FOCUS MODE™</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {ORB_FOCUS_MODES.map((mode: OrbFocusMode) => (
              <button
                key={mode}
                type="button"
                onClick={() => orb.changeFocusMode(mode)}
                style={{
                  padding: '5px 8px',
                  fontSize: 6,
                  letterSpacing: '0.08em',
                  border: snapshot.focusMode === mode ? `1.3px solid ${ORB_VISUAL.brandRed}` : '1px solid #ccc',
                  background: snapshot.focusMode === mode ? 'rgba(235,28,36,0.08)' : '#fff',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                title={ORB_FOCUS_MODE_DESCRIPTIONS[mode]}
              >
                {ORB_FOCUS_MODE_LABELS[mode]}
              </button>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 12 }}>
          <p style={{ ...orbLabel, fontSize: 6, margin: '0 0 6px' }}>THE EXECUTIVE JOURNEY™</p>
          <p style={{ fontSize: 8, margin: '0 0 6px', textTransform: 'none', lineHeight: 1.35 }}>
            {snapshot.executiveJourney.reasoning}
          </p>
          <ol style={{ margin: 0, paddingLeft: 16, fontSize: 8, lineHeight: 1.5, textTransform: 'none' }}>
            {snapshot.executiveJourney.stops.map((stop: (typeof snapshot.executiveJourney.stops)[number]) => (
              <li key={`${stop.order}-${stop.displayName}`}>
                <button
                  type="button"
                  onClick={() => handleJourneyStop(stop.path)}
                  style={{
                    border: 'none',
                    background: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: 'inherit',
                    color: ORB_VISUAL.brandRed,
                    textDecoration: 'underline',
                    fontFamily: 'inherit',
                  }}
                >
                  {stop.displayName}
                </button>
                <span style={{ color: ORB_VISUAL.textMuted }}> — {stop.purpose}</span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => {
              orb.acceptJourney();
              closeSurface();
            }}
            style={{
              marginTop: 8,
              width: '100%',
              padding: '8px 10px',
              border: ORB_VISUAL.border,
              background: '#fff',
              color: ORB_VISUAL.text,
              fontSize: 7,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ACCEPT ITINERARY →
          </button>
        </section>

        <section>
          <p style={{ ...orbLabel, fontSize: 6, margin: '0 0 6px' }}>
            RECOMMENDATIONS ({snapshot.recommendations.length})
          </p>
          {snapshot.recommendations.map((rec: OrbRecommendation) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              onAccept={(r) => {
                orb.acceptRecommendation(r);
                closeSurface();
              }}
            />
          ))}
        </section>

        <button
          type="button"
          onClick={closeSurface}
          style={{
            marginTop: 10,
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            background: 'transparent',
            fontSize: 7,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          CLOSE
        </button>
      </div>
    </>
  );
}
