import { useNavigate } from 'react-router-dom';
import { useComponentRegistryState } from '../../../../hooks/useComponentRegistryState';
import { COMPONENT_REGISTRY_ACCENT } from '../../../../studio-os-core/component-registry';
import { adminStudioComponentRegistryPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Component Registry™ preview (M128). */
export function MissionControlComponentRegistryPanel() {
  const navigate = useNavigate();
  const { profile } = useComponentRegistryState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="COMPONENT REGISTRY™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>COMPONENT CATALOG LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="COMPONENT REGISTRY™ · REUSE FIRST">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.registryScore} size={52} label="CR" accent={COMPONENT_REGISTRY_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.totalComponents} COMPONENTS · REUSE {profile.totalReuseScore}%
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>ASSEMBLE — NEVER RECREATE</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockRegistryLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioComponentRegistryPath())} style={eiaActionBtn}>
        OPEN COMPONENT REGISTRY →
      </button>
    </ExecutiveSecondaryCard>
  );
}
