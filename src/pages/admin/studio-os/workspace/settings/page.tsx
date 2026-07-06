import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminHeader from '../../../components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../../../hooks/useRequireAdminPageAccess';
import { useWorkspace } from '../../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../../studio-os-core/workspace/routes';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';
import {
  getStudioLocalStorageAudit,
  resetLocalStudioCache,
} from '../../../../../utils/studioOsBrowserStorage';

/** Per-workspace settings — brand · executives · permissions · integrations (workspace-scoped). */
export default function AdminStudioOsWorkspaceSettingsPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const { workspaceId: paramId } = useParams<{ workspaceId: string }>();
  const { workspace, enterWorkspace } = useWorkspace();
  const [cacheResetMessage, setCacheResetMessage] = useState<string | null>(null);

  const handleResetLocalCache = () => {
    resetLocalStudioCache();
    setCacheResetMessage('Local Studio cache cleared. Cloud workspace data is unchanged.');
    window.setTimeout(() => setCacheResetMessage(null), 5000);
  };

  const storageAudit = typeof window !== 'undefined' ? getStudioLocalStorageAudit() : null;

  useEffect(() => {
    if (paramId) enterWorkspace(paramId);
  }, [paramId, enterWorkspace]);

  const sections = [
    'BRAND · VOICE · IDENTITY',
    'EXECUTIVES · CONCIERGE TEAM',
    'PERMISSIONS · USERS',
    'INTEGRATIONS · AUTOMATION',
    'PUBLISHING · KNOWLEDGE',
    'BILLING · AI SETTINGS · GOVERNANCE · AUTONOMY',
  ];

  return (
    <div className="min-h-screen relative uppercase">
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
        }}
      />
      <AdminHeader
        title="WORKSPACE SETTINGS"
        showBack
        onBack={() => navigate(STUDIO_OS_ROUTES.entry)}
        breadcrumbParentLabel="REGISTRY"
        breadcrumbParentPath={STUDIO_OS_ROUTES.entry}
      />
      <div className="px-4 pb-8 max-w-md mx-auto">
        <div className="bg-white/60 backdrop-blur-sm border p-4" style={{ borderWidth: '1.3px' }}>
          <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '18px', color: workspace.colors.primary }}>
            {workspace.displayName}
          </p>
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '7px', color: '#808080', marginTop: 4 }}>
            Workspace-scoped settings · nothing leaks into Studio-wide platform configuration.
          </p>
          <ul className="mt-4 space-y-2">
            {sections.map((s) => (
              <li
                key={s}
                className="py-2 px-3 studio-living-card"
                style={{ border: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.7)' }}
              >
                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7px', margin: 0 }}>{s}</p>
              </li>
            ))}
          </ul>
          <div
            className="mt-4 py-3 px-3 studio-living-card"
            style={{ border: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}
          >
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7px', margin: '0 0 6px' }}>
              DEVICE STORAGE
            </p>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#808080', margin: '0 0 8px', lineHeight: 1.4 }}>
              Studio OS keeps only lightweight preferences on this device. Workspace edits sync to the cloud.
              {storageAudit
                ? ` Local Studio keys: ${storageAudit.localKeys.length} (${Math.round(storageAudit.totalLocalBytes / 1024)}KB).`
                : null}
            </p>
            <button
              type="button"
              onClick={handleResetLocalCache}
              className="w-full py-2 text-[7px] font-futura border"
              style={{ fontWeight: 515, color: '#0a0a0a', borderColor: '#0a0a0a', background: '#fff' }}
            >
              RESET LOCAL STUDIO CACHE
            </button>
            {cacheResetMessage ? (
              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#EB1C24', margin: '8px 0 0' }}>
                {cacheResetMessage}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => navigate(STUDIO_OS_ROUTES.workspaceDashboard(workspace.id))}
            className="w-full mt-4 py-2 text-[7px] font-futura border"
            style={{ fontWeight: 515, color: '#EB1C24', borderColor: '#EB1C24' }}
          >
            RETURN TO WORKSPACE HQ
          </button>
        </div>
      </div>
    </div>
  );
}
