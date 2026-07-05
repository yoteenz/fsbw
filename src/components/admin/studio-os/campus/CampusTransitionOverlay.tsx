import { useMemo } from 'react';
import { loadWorkspace } from '../../../../studio-os-core/workspace/loader';
import type {
  CampusArrivalBriefing,
  CampusTransitionPhase,
  CampusTransitionRequest,
  CampusTransitionSpeed,
  HeadquartersProfile,
} from '../../../../studio-os-core/campus-transitions/types';
import { CampusMorningBriefing } from './CampusMorningBriefing';
import { HeadquartersAtmosphere } from './HeadquartersAtmosphere';
import './campusTransition.css';

type Props = {
  active: boolean;
  phase: CampusTransitionPhase;
  request: CampusTransitionRequest | null;
  profile: HeadquartersProfile | null;
  briefing: CampusArrivalBriefing | null;
  briefingExpanded: boolean;
  speed: CampusTransitionSpeed;
  onToggleBriefingExpand: () => void;
  onBeginDay: () => void;
  onSkipToMissionControl: () => void;
};

export function CampusTransitionOverlay({
  active,
  phase,
  request,
  profile,
  briefing,
  briefingExpanded,
  speed,
  onToggleBriefingExpand,
  onBeginDay,
  onSkipToMissionControl,
}: Props) {
  const schema = useMemo(
    () => (request ? loadWorkspace(request.workspaceId)?.schema : null),
    [request]
  );

  if (!active || !request) return null;

  const isDeparture = request.kind === 'departure';
  const accent = profile?.exteriorAccent ?? schema?.colors.primary ?? '#6366F1';
  const bg = profile?.lightingGradient ?? 'linear-gradient(165deg, #faf8f5 0%, #fff 100%)';
  const styleClass = profile?.transitionStyle ?? 'soft-zoom';

  const showTravel = phase === 'traveling' || phase === 'departing';
  const showReveal = phase === 'revealing' || phase === 'concierge';
  const showBriefing = phase === 'briefing' && briefing && !isDeparture;
  const showExit = phase === 'exiting' || phase === 'returning';

  return (
    <div
      className={`campus-transition-overlay campus-transition-speed--${speed}${speed === 'instant' ? ' campus-transition-overlay--instant' : ''}${showExit ? ' campus-transition-exit' : ''}${phase === 'returning' ? ' campus-transition-return' : ''}`}
      role="dialog"
      aria-label={isDeparture ? 'Returning to Studio Campus' : 'Arriving at headquarters'}
      aria-modal="true"
    >
      <div className="campus-transition-sky" style={{ background: isDeparture ? '#f5f5f4' : bg }}>
        <div className="campus-transition-campus-grid" />
      </div>

      {showTravel ? (
        <div className="campus-transition-travel-layer">
          <div className={`campus-transition-corridor campus-transition-corridor--${styleClass}`}>
            <div className="campus-transition-glass-pane">
              <div className="campus-transition-glass-reflection" />
            </div>
            <div style={{ position: 'absolute', bottom: '14%', left: '8%', right: '8%' }}>
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '6px', color: 'rgba(0,0,0,0.45)', margin: 0 }}>
                STUDIO OS CAMPUS
              </p>
              <p
                style={{
                  fontFamily: '"Futura PT Book"',
                  fontSize: '7px',
                  color: '#333',
                  margin: '6px 0 0',
                  lineHeight: 1.5,
                  textTransform: 'none',
                }}
              >
                {isDeparture
                  ? 'Exiting headquarters · traveling back through the campus…'
                  : profile?.travelCaption ?? 'Traveling to headquarters…'}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {showReveal && profile ? (
        <div className="campus-transition-hq-reveal">
          <HeadquartersAtmosphere profile={profile} visible />
          <div
            className="campus-transition-hq-silhouette"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${accent}22 40%, ${accent}44 100%)`,
              borderTop: `4px solid ${accent}`,
            }}
          >
            {schema?.logoSrc ? (
              <img src={schema.logoSrc} alt="" className="campus-transition-hq-logo" />
            ) : null}
            <div style={{ position: 'absolute', top: 16, left: 16, right: 16 }}>
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '5px', color: accent, margin: 0 }}>
                {profile.industryLabel}
              </p>
              <p
                style={{
                  fontFamily: '"Covered By Your Grace", sans-serif',
                  fontSize: '22px',
                  color: '#1a1a1a',
                  margin: '4px 0 0',
                }}
              >
                {schema?.displayName ?? request.workspaceId}
              </p>
              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#555', margin: '6px 0 0', lineHeight: 1.45 }}>
                {profile.revealCaption}
              </p>
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '5px', color: '#888', margin: '8px 0 0' }}>
                {profile.maturityTone} · {profile.cultureTone}
              </p>
            </div>
          </div>

          {phase === 'concierge' && briefing ? (
            <div style={{ width: 'min(92vw, 420px)', marginTop: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.9)', border: '1.3px solid rgba(146,112,74,0.22)' }}>
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '6px', color: '#92704A', margin: 0 }}>
                CHIEF CONCIERGE · ARRIVAL
              </p>
              <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '16px', margin: '4px 0 6px' }}>
                {briefing.greeting}
              </p>
              {briefing.conciergeLines.slice(0, 2).map((line: string) => (
                <p key={line} style={{ fontFamily: '"Futura PT Book"', fontSize: '7px', color: '#444', margin: '2px 0', lineHeight: 1.45 }}>
                  {line}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {showBriefing && briefing ? (
        <CampusMorningBriefing
          briefing={briefing}
          expanded={briefingExpanded}
          onToggleExpand={onToggleBriefingExpand}
          onBeginDay={onBeginDay}
          onSkipToMissionControl={onSkipToMissionControl}
          accent={accent}
        />
      ) : null}

      {showExit ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: 24,
          }}
        >
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7px', color: '#6366F1', margin: 0 }}>
            STUDIO OS CAMPUS
          </p>
          <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '20px', margin: '8px 0' }}>
            {phase === 'returning' ? 'Welcome back to campus.' : 'Leaving headquarters…'}
          </p>
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '7px', color: '#666', textAlign: 'center', lineHeight: 1.5, textTransform: 'none' }}>
            {phase === 'returning'
              ? 'Workspace Registry · central Studio Campus · every organization on one connected world.'
              : 'Natural exit · glass corridor · returning to the central campus.'}
          </p>
        </div>
      ) : null}
    </div>
  );
}
