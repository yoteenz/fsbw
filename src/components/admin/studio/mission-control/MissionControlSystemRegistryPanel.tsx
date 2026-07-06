import { useNavigate } from 'react-router-dom';
import { useSystemRegistryState } from '../../../../hooks/useSystemRegistryState';
import { SYSTEM_REGISTRY_ACCENT } from '../../../../studio-os-core/system-registry';
import { adminStudioSystemRegistryPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — System Registry™ preview (M127). */
export function MissionControlSystemRegistryPanel() {
  const navigate = useNavigate();
  const { profile } = useSystemRegistryState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="SYSTEM REGISTRY™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>MASTER DIRECTORY LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="SYSTEM REGISTRY™ · MASTER DIRECTORY">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.registryScore} size={52} label="SR" accent={SYSTEM_REGISTRY_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.totalSystems} SYSTEMS · {Object.keys(profile.categoryCounts).length} CATEGORIES
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>NOTHING EXISTS OUTSIDE THE REGISTRY</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockRegistryLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioSystemRegistryPath())} style={eiaActionBtn}>
        OPEN SYSTEM REGISTRY →
      </button>
    </ExecutiveSecondaryCard>
  );
}
