import { useNavigate } from 'react-router-dom';
import { usePluginSdkState } from '../../../../hooks/usePluginSdkState';
import { PLUGIN_SDK_ACCENT } from '../../../../studio-os-core/plugin-sdk';
import { adminStudioPluginSdkPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Plugin SDK™ preview (M137). */
export function MissionControlPluginSdkPanel() {
  const navigate = useNavigate();
  const { profile } = usePluginSdkState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="PLUGIN SDK™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>EXTENSIBLE PLATFORM LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="PLUGIN SDK™ · EXTENSIBLE PLATFORM">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.platformScore} size={52} label="PS" accent={PLUGIN_SDK_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.activePluginCount} PLUGINS · {profile.pluginTypes.length} TYPES
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>{profile.sandboxScorePct}% SANDBOX · ECOSYSTEM READY</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockPlatformLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioPluginSdkPath())} style={eiaActionBtn}>
        OPEN PLUGIN SDK →
      </button>
    </ExecutiveSecondaryCard>
  );
}
