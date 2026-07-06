import { useNavigate } from 'react-router-dom';
import { useAnticipationEngineState } from '../../../../hooks/useAnticipationEngineState';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';
import { adminStudioAnticipationEnginePath } from '../../../../utils/adminStudioRoutes';
import { MC_VISUAL } from '../mission-control/missionControlTheme';

/** Mission Control — Anticipation Engine™ proactive preparations preview (M108). */
export function MissionControlAnticipationPanel() {
  const navigate = useNavigate();
  const { profile } = useAnticipationEngineState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="ANTICIPATION ENGINE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>ANTICIPATION ENGINE™ LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  const topPreps = profile.proactivePreparations.slice(0, 3);

  return (
    <ExecutiveSecondaryCard title="ANTICIPATION ENGINE™ · PREPARED FOR TOMORROW">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.anticipationScore} size={52} label="PREP" accent="#6366F1" />
        <div>
          <p style={{ ...eiaCaption, color: MC_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.anticipationsIdentified} NEEDS · {profile.preparationsReady} READY
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>{profile.dockHeadline}</p>
        </div>
      </div>
      {topPreps.map((prep) => (
        <p key={prep.id} style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
          · {prep.title} — awaiting approval
        </p>
      ))}
      {profile.organizationalPatterns[0] ? (
        <p style={{ ...eiaCaption, fontSize: '7px', color: '#6366F1', marginBottom: 8 }}>
          PATTERN: {profile.organizationalPatterns[0].pattern}
        </p>
      ) : null}
      <button type="button" onClick={() => navigate(adminStudioAnticipationEnginePath())} style={eiaActionBtn}>
        OPEN ANTICIPATION ENGINE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
