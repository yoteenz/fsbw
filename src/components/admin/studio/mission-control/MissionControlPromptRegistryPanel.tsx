import { useNavigate } from 'react-router-dom';
import { usePromptRegistryState } from '../../../../hooks/usePromptRegistryState';
import { PROMPT_REGISTRY_ACCENT } from '../../../../studio-os-core/prompt-registry';
import { adminStudioPromptRegistryPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Prompt Registry™ preview (M133). */
export function MissionControlPromptRegistryPanel() {
  const navigate = useNavigate();
  const { profile } = usePromptRegistryState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="PROMPT REGISTRY™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>REGISTERED PROMPTS LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="PROMPT REGISTRY™ · PROMPTS ARE CODE">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.registryScore} size={52} label="PR" accent={PROMPT_REGISTRY_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.activeCount} ACTIVE · {profile.totalPrompts} REGISTERED
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>{profile.avgQualityScorePct}% QUALITY · NO HIDDEN TEXT</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockRegistryLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioPromptRegistryPath())} style={eiaActionBtn}>
        OPEN PROMPT REGISTRY →
      </button>
    </ExecutiveSecondaryCard>
  );
}
