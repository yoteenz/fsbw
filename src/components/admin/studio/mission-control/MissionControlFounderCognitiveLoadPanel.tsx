import { useNavigate } from 'react-router-dom';
import { useFounderCognitiveLoadState } from '../../../../hooks/useFounderCognitiveLoadState';
import { LOAD_STATE_LABELS } from '../../../../studio-os-core/founder-cognitive-load';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';
import { adminStudioFounderCognitiveLoadPath } from '../../../../utils/adminStudioRoutes';
import { MC_VISUAL } from '../mission-control/missionControlTheme';

/** Mission Control — Founder Cognitive Load™ attention protection preview (M109). */
export function MissionControlFounderCognitiveLoadPanel() {
  const navigate = useNavigate();
  const { profile } = useFounderCognitiveLoadState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="FOUNDER COGNITIVE LOAD™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>FOUNDER COGNITIVE LOAD™ LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  const topFactors = profile.factorSnapshots
    .slice()
    .sort((a, b) => b.demandPct - a.demandPct)
    .slice(0, 3);

  return (
    <ExecutiveSecondaryCard title="FOUNDER COGNITIVE LOAD™ · ATTENTION PROTECTION">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.focusProtectionPct} size={52} label="FOCUS" accent="#0D9488" />
        <div>
          <p style={{ ...eiaCaption, color: MC_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.cognitiveDemandPct}% DEMAND · {LOAD_STATE_LABELS[profile.loadState].toUpperCase()}
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>{profile.dockHeadline.slice(0, 90)}…</p>
        </div>
      </div>
      {topFactors.map((f) => (
        <p key={f.factor} style={{ ...eiaCaption, fontSize: '7px', marginBottom: 4 }}>
          · {f.label}: {f.demandPct}%
        </p>
      ))}
      {profile.executiveAssistance[0] ? (
        <p style={{ ...eiaCaption, fontSize: '7px', color: '#0D9488', marginBottom: 8 }}>
          {profile.executiveAssistance[0].message.slice(0, 100)}…
        </p>
      ) : null}
      <button type="button" onClick={() => navigate(adminStudioFounderCognitiveLoadPath())} style={eiaActionBtn}>
        OPEN COGNITIVE LOAD →
      </button>
    </ExecutiveSecondaryCard>
  );
}
