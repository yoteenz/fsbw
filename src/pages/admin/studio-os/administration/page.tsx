import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { STUDIO_OS_PLATFORM } from '../../../../studio-os-core/config/platform';
import { STUDIO_ADMINISTRATION_ROUTES } from '../../../../studio-os-core/application/routes';
import { STUDIO_OS_PRODUCT_LAYERS, STUDIO_OS_KNOWN_ORGANIZATIONS } from '../../../../studio-os-core/application/layers';
import { canAccessStudioAdministration } from '../../../../studio-os-core/application/portfolio-access';
import { INHERITED_PLATFORM_CAPABILITIES } from '../../../../studio-os-core/feature-inheritance/registry';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { readWorkspaceRegistryStore } from '../../../../studio-os-core/workspace-registry/store';
import { useWorkspaceCreationEngine } from '../../../../hooks/useWorkspaceCreationEngine';
import { WorkspaceRegistryCard } from '../../../../components/admin/studio-os/WorkspaceRegistryCard';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { Navigate } from 'react-router-dom';
import { ORGANIZATION_ROUTES } from '../../../../studio-os-core/application/routes';

/**
 * Studio Administration — master control center for Studio OS.
 * Portfolio owners only: workspace registry, org creation, portfolio intelligence, global settings.
 */
export default function StudioAdministrationPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const { workspaces, workspaceId } = useWorkspace();
  const { workspaces: registryWorkspaces } = useWorkspaceCreationEngine();
  const registryStore = readWorkspaceRegistryStore();

  const registryById = useMemo(() => {
    const map = new Map<string, (typeof registryWorkspaces)[number]>();
    for (const r of registryWorkspaces) {
      map.set(r.id, r);
    }
    return map;
  }, [registryWorkspaces]);

  if (!canAccessStudioAdministration()) {
    return <Navigate to={ORGANIZATION_ROUTES.headquartersEntry} replace />;
  }

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="relative z-10 uppercase" style={{ textTransform: 'uppercase' }}>
        <AdminHeader
          title="STUDIO ADMINISTRATION"
          showBack
          onBack={() => navigate('/admin/dashboard')}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
        />

        <div className="pb-8 px-4">
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-white/60 backdrop-blur-sm border border-black p-4 shadow-lg" style={{ borderWidth: '1.3px' }}>
              <p className="font-bold text-xl tracking-wider" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: '#6366F1' }}>
                STUDIO ADMINISTRATION
              </p>
              <p className="mt-2 text-[10px] font-futura" style={{ fontWeight: 515, color: '#808080', lineHeight: 1.4 }}>
                {STUDIO_OS_PLATFORM.name.toUpperCase()} · {STUDIO_OS_PLATFORM.tagline}
              </p>
              <p className="mt-3 text-[8px] font-futura" style={{ fontWeight: 515, color: '#333', lineHeight: 1.45 }}>
                {STUDIO_OS_PRODUCT_LAYERS.studioOs.description}
              </p>
            </div>

            <div className="p-3 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(99,102,241,0.06)' }}>
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7px', color: '#6366F1' }}>PRODUCT HIERARCHY</p>
              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#444', margin: '4px 0 0' }}>
                {STUDIO_OS_PRODUCT_LAYERS.studioOs.label} → {STUDIO_OS_PRODUCT_LAYERS.workspaceRegistry.label} →{' '}
                {STUDIO_OS_PRODUCT_LAYERS.organization.label}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => navigate(STUDIO_ADMINISTRATION_ROUTES.create)}
                className="py-3 text-[7px] font-futura border col-span-2"
                style={{ fontWeight: 515, color: '#FFF', background: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
              >
                CREATE ORGANIZATION
              </button>
              <button
                type="button"
                onClick={() => navigate(STUDIO_ADMINISTRATION_ROUTES.blueprints)}
                className="py-2 text-[7px] font-futura border"
                style={{ fontWeight: 515, color: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}
              >
                ORG TEMPLATES
              </button>
              <button
                type="button"
                onClick={() => navigate(STUDIO_ADMINISTRATION_ROUTES.promotionCenter)}
                className="py-2 text-[7px] font-futura border"
                style={{ fontWeight: 515, color: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}
              >
                ONBOARDING
              </button>
              <button
                type="button"
                onClick={() => navigate(STUDIO_ADMINISTRATION_ROUTES.registry)}
                className="py-2 text-[7px] font-futura border col-span-2"
                style={{ fontWeight: 515, color: '#333', borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}
              >
                WORKSPACE REGISTRY
              </button>
            </div>

            <div className="p-3 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7px', color: '#333' }}>FEATURE INHERITANCE</p>
              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#666', margin: '4px 0 8px' }}>
                Every organization automatically receives {INHERITED_PLATFORM_CAPABILITIES.length} platform capabilities — dynamically instantiated, never duplicated.
              </p>
              <div className="flex flex-wrap gap-1">
                {INHERITED_PLATFORM_CAPABILITIES.slice(0, 8).map((cap) => (
                  <span
                    key={cap.id}
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '5px',
                      padding: '2px 4px',
                      border: '1px solid #ddd',
                      background: '#fff',
                    }}
                  >
                    {cap.label.toUpperCase()}
                  </span>
                ))}
                <span style={{ fontFamily: '"Futura PT Book"', fontSize: '5px', color: '#888' }}>
                  +{INHERITED_PLATFORM_CAPABILITIES.length - 8} MORE
                </span>
              </div>
            </div>

            {registryStore.studioPortfolioInsights.length > 0 ? (
              <div className="p-3" style={{ border: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(146,112,74,0.06)' }}>
                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '6px', color: '#92704A' }}>PORTFOLIO INTELLIGENCE</p>
                {registryStore.studioPortfolioInsights.slice(0, 3).map((ins) => (
                  <p key={ins.id} style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#444', margin: '4px 0 0' }}>
                    {ins.insight} {ins.metric ? `· ${ins.metric}` : ''}
                  </p>
                ))}
              </div>
            ) : null}

            <div>
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7px', color: '#333', marginBottom: 8 }}>ORGANIZATIONS</p>
              <div className="grid grid-cols-1 gap-3">
                {workspaces.map((ws) => {
                  const registry = registryById.get(ws.id);
                  return (
                    <WorkspaceRegistryCard
                      key={ws.id}
                      workspace={ws}
                      isActive={ws.id === workspaceId}
                      onEnter={() => navigate(STUDIO_OS_ROUTES.workspaceShell(ws.id))}
                      registryMeta={
                        registry
                          ? {
                              workspaceType: registry.workspaceType,
                              deploymentStage: registry.deploymentStage,
                              isReferencePilot: registry.isReferencePilot,
                            }
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            </div>

            <div className="p-3 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7px', color: '#333' }}>GLOBAL SETTINGS (ARCHITECTURE-READY)</p>
              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#666', margin: '4px 0 0', lineHeight: 1.5 }}>
                Licensing · billing · system updates · plugin management · cross-company intelligence · organization imports
              </p>
            </div>

            <p className="text-[6px] font-futura uppercase text-center px-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.6 }}>
              {STUDIO_OS_KNOWN_ORGANIZATIONS.map((o) => o.label).join(' · ')} · {STUDIO_OS_PLATFORM.owner}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
