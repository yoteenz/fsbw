import { useNavigate } from 'react-router-dom';
import { useAssetRegistryState } from '../../../../hooks/useAssetRegistryState';
import { ASSET_REGISTRY_ACCENT } from '../../../../studio-os-core/asset-registry';
import { adminStudioAssetRegistryPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Asset Registry™ preview (M140). */
export function MissionControlAssetRegistryPanel() {
  const navigate = useNavigate();
  const { profile } = useAssetRegistryState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="ASSET REGISTRY™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>MANAGED ASSETS LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="ASSET REGISTRY™ · PLATFORM RESOURCES">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.registryScore} size={52} label="AR" accent={ASSET_REGISTRY_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.totalAssetCount} ASSETS · {profile.categories.length} CATEGORIES
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>{profile.healthScorePct}% HEALTH · SEARCHABLE</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockRegistryLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioAssetRegistryPath())} style={eiaActionBtn}>
        OPEN ASSET REGISTRY →
      </button>
    </ExecutiveSecondaryCard>
  );
}
