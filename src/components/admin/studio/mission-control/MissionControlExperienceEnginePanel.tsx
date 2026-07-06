import { useNavigate } from 'react-router-dom';
import { useExperienceEngineState } from '../../../../hooks/useExperienceEngineState';
import { EXPERIENCE_ENGINE_ACCENT } from '../../../../studio-os-core/experience-engine';
import { adminStudioExperienceEnginePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Experience Engine™ preview (M141). */
export function MissionControlExperienceEnginePanel() {
  const navigate = useNavigate();
  const { profile } = useExperienceEngineState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="EXPERIENCE ENGINE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>ADAPTIVE ATMOSPHERE LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="EXPERIENCE ENGINE™ · ADAPTIVE ATMOSPHERE">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.atmosphereScore} size={52} label="EE" accent={EXPERIENCE_ENGINE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.activeModeLabel.toUpperCase()} · {profile.experienceModes.length} MODES
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.contextAwarenessPct}% CONTEXT · INFRASTRUCTURE CHAPTER COMPLETE
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockExperienceLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioExperienceEnginePath())} style={eiaActionBtn}>
        OPEN EXPERIENCE ENGINE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
