import { useNavigate } from 'react-router-dom';
import { usePresenceEngineState } from '../../../../hooks/usePresenceEngineState';
import { ATMOSPHERE_STATE_LABELS } from '../../../../studio-os-core/presence-engine';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';
import { adminStudioPresenceEnginePath } from '../../../../utils/adminStudioRoutes';
import { MC_VISUAL } from '../mission-control/missionControlTheme';

/** Mission Control — Presence Engine™ executive presence preview (M110). */
export function MissionControlPresencePanel() {
  const navigate = useNavigate();
  const { profile } = usePresenceEngineState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="PRESENCE ENGINE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>PRESENCE ENGINE™ LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  const welcome = profile.presenceMoments.find((m) => m.type === 'daily-welcome');
  const highlight = profile.presenceMoments.find((m) => m.type !== 'daily-welcome');

  return (
    <ExecutiveSecondaryCard title="PRESENCE ENGINE™ · EXECUTIVE PARTNER">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.reassuranceLevel} size={52} label="CALM" accent="#7C3AED" />
        <div>
          <p style={{ ...eiaCaption, color: MC_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.presenceScore}% PRESENCE · {ATMOSPHERE_STATE_LABELS[profile.activeAtmosphere].toUpperCase()}
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>Always there — never noisy</p>
        </div>
      </div>
      {welcome ? (
        <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
          {welcome.message.slice(0, 100)}…
        </p>
      ) : null}
      {highlight ? (
        <p style={{ ...eiaCaption, fontSize: '7px', color: '#7C3AED', marginBottom: 8 }}>
          {highlight.message.slice(0, 90)}…
        </p>
      ) : null}
      <button type="button" onClick={() => navigate(adminStudioPresenceEnginePath())} style={eiaActionBtn}>
        OPEN PRESENCE ENGINE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
