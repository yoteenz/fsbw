import { useNavigate } from 'react-router-dom';
import { useLegacyNetworkState } from '../../../../hooks/useLegacyNetworkState';
import { LEGACY_NETWORK_ACCENT } from '../../../../studio-os-core/legacy-network';
import { adminStudioLegacyNetworkPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Legacy Network™ preview (M121). */
export function MissionControlLegacyNetworkPanel() {
  const navigate = useNavigate();
  const { profile } = useLegacyNetworkState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="LEGACY NETWORK™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>LEGACY NETWORK™ LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="LEGACY NETWORK™ · MOVEMENT NOT MARKETPLACE">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.legacyScorePct} size={52} label="LEGACY" accent={LEGACY_NETWORK_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.publishedAssets} PUBLISHED · {profile.discoveredResources} DISCOVERED · TRUST {profile.communityTrustPct}%
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>PRESERVE EXPERTISE · BUILD LEGACY</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockLegacyLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioLegacyNetworkPath())} style={eiaActionBtn}>
        OPEN LEGACY NETWORK →
      </button>
    </ExecutiveSecondaryCard>
  );
}
