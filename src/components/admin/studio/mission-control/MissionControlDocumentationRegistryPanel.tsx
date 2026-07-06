import { useNavigate } from 'react-router-dom';
import { useDocumentationRegistryState } from '../../../../hooks/useDocumentationRegistryState';
import { DOCUMENTATION_REGISTRY_ACCENT } from '../../../../studio-os-core/documentation-registry';
import { adminStudioDocumentationRegistryPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Documentation Registry™ preview (M126). */
export function MissionControlDocumentationRegistryPanel() {
  const navigate = useNavigate();
  const { profile } = useDocumentationRegistryState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="DOCUMENTATION REGISTRY™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>REGISTRY LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="DOCUMENTATION REGISTRY™ · ONE SOURCE">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.registryScore} size={52} label="DR" accent={DOCUMENTATION_REGISTRY_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.totalEntries} FEATURES · {profile.autoSyncSurfaces.filter((s) => s.synced).length} SURFACES SYNCED
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>ONE SOURCE · INFINITE KNOWLEDGE · ALWAYS SYNCHRONIZED</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockRegistryLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioDocumentationRegistryPath())} style={eiaActionBtn}>
        OPEN DOCUMENTATION REGISTRY →
      </button>
    </ExecutiveSecondaryCard>
  );
}
