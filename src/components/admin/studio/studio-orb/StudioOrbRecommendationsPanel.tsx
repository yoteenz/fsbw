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
import {
  orbBody,
  orbChipBtnStyle,
  orbLabel,
  orbOverlayBackdropStyle,
  orbPrimaryBtnStyle,
  orbProjectionInnerStyle,
  orbProjectionPanelStyle,
  orbSecondaryBtnStyle,
  ORB_VISUAL,
} from './studioOrbTheme';
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
  padding: '16px 18px',
  ...orbProjectionPanelStyle,
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
        ...orbProjectionInnerStyle,
        padding: '10px 12px',
        marginBottom: 8,
        borderColor: rec.isSurprise ? 'rgba(201, 169, 98, 0.45)' : 'rgba(255, 255, 255, 0.28)',
        boxShadow: rec.isSurprise
          ? '0 0 20px rgba(201, 169, 98, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.35)'
          : orbProjectionInnerStyle.boxShadow,
      }}
    >
      <p style={{ ...orbLabel, fontSize: 7, margin: 0, color: ORB_VISUAL.champagne }}>
        {rec.isSurprise ? 'SURPRISE DISCOVERY™' : categoryLabel(rec.category)} · {rec.priority}
      </p>
      <p style={{ ...orbLabel, fontSize: 8, margin: '4px 0', lineHeight: 1.35 }}>{rec.title}</p>
      <p style={{ ...orbBody, fontSize: 9, margin: '0 0 6px', textTransform: 'none', color: ORB_VISUAL.textMuted }}>
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
            ...orbPrimaryBtnStyle,
            marginTop: 8,
            width: '100%',
          }}
        >
          GO →
        </button>
      ) : null}
    </article>
  );
}

/** Orb Recommendations™ — holographic executive brief projected from the Orb. */
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
        style={{ ...orbOverlayBackdropStyle, border: 'none', cursor: 'default' }}
        onClick={closeSurface}
      />
      <div className="studio-conversation-dock-panel" style={panelStyle} role="dialog" aria-label="Studio Orb recommendations">
        <header style={{ marginBottom: 10 }}>
          <p style={{ ...orbLabel, fontSize: 6, margin: 0, color: ORB_VISUAL.champagne }}>
            STUDIO ORB™ · EXECUTIVE CHIEF OF STAFF
          </p>
          <p style={{ ...orbLabel, fontSize: 9, margin: '4px 0 0' }}>ORB RECOMMENDATIONS™</p>
        </header>

        <section style={{ marginBottom: 12 }}>
          <p style={{ fontFamily: '"Covered By Your Grace", cursive', fontSize: 14, margin: '0 0 6px', color: ORB_VISUAL.champagne }}>
            {snapshot.dailyBrief.greeting}
          </p>
          {snapshot.dailyBrief.lines.map((line: string) => (
            <p
              key={line}
              style={{ ...orbBody, fontSize: 9, margin: '0 0 4px', textTransform: 'none' }}
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
                  ...orbChipBtnStyle,
                  borderColor: snapshot.focusMode === mode ? ORB_VISUAL.champagne : 'rgba(255, 255, 255, 0.28)',
                  color: snapshot.focusMode === mode ? ORB_VISUAL.champagne : ORB_VISUAL.text,
                  background:
                    snapshot.focusMode === mode ? 'rgba(201, 169, 98, 0.16)' : orbChipBtnStyle.background,
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
          <p style={{ ...orbBody, fontSize: 8, margin: '0 0 6px', textTransform: 'none' }}>
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
                    color: ORB_VISUAL.champagne,
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
              ...orbSecondaryBtnStyle,
              marginTop: 8,
              width: '100%',
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

        <button type="button" onClick={closeSurface} style={{ ...orbSecondaryBtnStyle, marginTop: 10, width: '100%' }}>
          CLOSE
        </button>
      </div>
    </>
  );
}
