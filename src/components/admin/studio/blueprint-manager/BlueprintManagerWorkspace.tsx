import { useNavigate } from 'react-router-dom';
import { AdminStudioExecutiveCard } from '../AdminStudioExecutiveCard';
import { useAdminStudioBlueprintManager } from '../../../../hooks/useAdminStudioBlueprintManagerState';
import {
  BLUEPRINT_CATEGORIES,
  BLUEPRINT_STATUS_LABELS,
  BLUEPRINT_TEMPLATES,
  computeBlueprintFactoryStats,
} from '../../../../utils/adminStudioBlueprintManagerDemo';
import { adminStudioBlueprintDetailPath } from '../../../../utils/adminStudioRoutes';
import { BP_VISUAL, bpActionBtn, bpCaption, bpGrace, bpPanelStyle, bpSectionTitle, statusColor } from './blueprintManagerTheme';

export function BlueprintManagerWorkspace() {
  const navigate = useNavigate();
  const { blueprints } = useAdminStudioBlueprintManager();
  const stats = computeBlueprintFactoryStats(blueprints);
  const globalBlueprints = blueprints.filter((b) => b.scope === 'global');
  const workspaceBlueprints = blueprints.filter((b) => b.scope === 'workspace');

  return (
    <div>
      <div style={{ ...bpPanelStyle, padding: '12px', marginBottom: '12px' }}>
        <p style={{ ...bpGrace, fontSize: '18px' }}>BLUEPRINT LIBRARY</p>
        <p style={bpCaption}>ARCHITECTURAL DNA · DEFINE ONCE · GENERATE FOREVER · NO ASSETS GENERATED YET</p>
        <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-5">
          {[
            { label: 'READY', value: stats.ready },
            { label: 'MISSING', value: stats.missingAssets },
            { label: 'AWAITING', value: stats.awaitingApproval },
            { label: 'HEALTH', value: `${stats.health}%` },
            { label: 'FACTORY', value: `${stats.factoryReadiness}%` },
          ].map((s) => (
            <div key={s.label} className="text-center py-2" style={{ background: 'rgba(0,0,0,0.03)' }}>
              <p style={{ ...bpGrace, fontSize: '14px', color: BP_VISUAL.red }}>{s.value}</p>
              <p style={{ ...bpCaption, fontSize: '7px' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <p style={bpSectionTitle}>BLUEPRINT TEMPLATES · CREATE FROM SCRATCH</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-4">
        {BLUEPRINT_TEMPLATES.map((tpl) => (
          <AdminStudioExecutiveCard
            key={tpl.id}
            title={tpl.name}
            metric={tpl.scope === 'global' ? 'GLOBAL' : 'WORKSPACE'}
            description={tpl.description}
            accentHex={BP_VISUAL.global}
            onClick={() => navigate(adminStudioBlueprintDetailPath('bp-weather-studio'))}
          />
        ))}
      </div>

      <p style={bpSectionTitle}>STUDIO OS GLOBAL</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-4">
        {globalBlueprints.map((bp) => (
          <AdminStudioExecutiveCard
            key={bp.id}
            title={bp.identity.name}
            metric={bp.status.toUpperCase()}
            description={bp.identity.description.slice(0, 48)}
            accentHex={BP_VISUAL.global}
            onClick={() => navigate(adminStudioBlueprintDetailPath(bp.id))}
          />
        ))}
      </div>

      <p style={bpSectionTitle}>WORKSPACE BLUEPRINTS · FRONTAL SLAYER</p>
      {BLUEPRINT_CATEGORIES.map((cat) => {
        const items = workspaceBlueprints.filter((b) => b.identity.category === cat.id);
        if (!items.length) return null;
        return (
          <section key={cat.id} className="mb-4">
            <p style={{ ...bpCaption, color: BP_VISUAL.black, fontFamily: '"Futura PT Medium"', marginBottom: 6 }}>{cat.label}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {items.map((bp) => (
                <button
                  key={bp.id}
                  type="button"
                  onClick={() => navigate(adminStudioBlueprintDetailPath(bp.id))}
                  className="text-left p-3 transition-transform active:scale-[0.98]"
                  style={{ ...bpPanelStyle, cursor: 'pointer', borderTop: `2px solid ${statusColor(bp.status)}` }}
                >
                  <p style={{ ...bpCaption, color: BP_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>{bp.identity.name}</p>
                  <p style={{ ...bpGrace, fontSize: '12px', color: BP_VISUAL.red }}>{bp.checklist.filter((c) => c.status === 'ready').length}/{bp.checklist.length}</p>
                  <p style={{ ...bpCaption, fontSize: '7px' }}>{BLUEPRINT_STATUS_LABELS[bp.status]}</p>
                </button>
              ))}
            </div>
          </section>
        );
      })}

      <button type="button" onClick={() => navigate(adminStudioBlueprintDetailPath('bp-weather-studio'))} style={{ ...bpActionBtn, marginTop: 8 }}>
        OPEN WEATHER STUDIO BLUEPRINT
      </button>
      <button type="button" onClick={() => navigate('/admin/studio/asset-factory')} style={{ ...bpActionBtn, marginTop: 8, marginLeft: 8 }}>
        OPEN ASSET FACTORY
      </button>
    </div>
  );
}
