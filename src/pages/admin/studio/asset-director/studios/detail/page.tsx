import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioSectionHeading } from '../../../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { getAssetDirectorStudioById } from '../../../../../../utils/adminStudioAssetDirectorDemo';
import { ADMIN_STUDIO_THEME } from '../../../../../../utils/adminStudioTheme';

export default function AdminStudioAssetDirectorStudioDetailPage() {
  const { studioId } = useParams<{ studioId: string }>();
  const navigate = useNavigate();
  const studio = studioId ? getAssetDirectorStudioById(studioId) : undefined;

  if (!studioId || !studio) {
    return <Navigate to="/admin/studio/asset-director/studios" replace />;
  }

  const profileFields = [
    { label: 'MASTER ENVIRONMENT', value: studio.masterEnvironment },
    { label: 'DAY VERSION', value: studio.dayVersion },
    { label: 'NIGHT VERSION', value: studio.nightVersion },
    { label: 'SEASONAL VERSIONS', value: studio.seasonalVersions },
    { label: 'CAMERA PRESETS', value: studio.cameraPresets },
    { label: 'LIGHTING PRESETS', value: studio.lightingPresets },
    { label: 'INTRO ANIMATION', value: studio.introAnimation },
    { label: 'OUTRO ANIMATION', value: studio.outroAnimation },
    { label: 'IDLE ANIMATION', value: studio.idleAnimation },
    { label: 'TRANSITION ASSETS', value: studio.transitionAssets },
    { label: 'LOWER THIRDS', value: studio.lowerThirds },
    { label: 'GRAPHICS', value: studio.graphics },
  ];

  return (
    <AdminStudioStageShell
      title={studio.name}
      subtitle="ASSET DIRECTOR · STUDIO VISUAL PROFILE"
      breadcrumbParentLabel="STUDIOS"
      breadcrumbParentPath="/admin/studio/asset-director/studios"
      onBack={() => navigate('/admin/studio/asset-director/studios')}
      accentHex={studio.accentHex}
    >
      <div
        className="relative mb-3 overflow-hidden border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: `2px solid ${studio.accentHex}` }}
      >
        <img src={studio.previewSrc} alt="" className="w-full h-36 object-cover opacity-90" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(255,255,255,0.95) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: studio.accentHex }}>
            {studio.status.toUpperCase()} · v{studio.version.replace(/^v/, '')} · {studio.lastUpdated}
          </p>
        </div>
      </div>

      <AdminStudioSectionHeading>VISUAL PROFILE</AdminStudioSectionHeading>
      <div className="space-y-2 mb-4">
        {profileFields.map((field) => (
          <div key={field.label} className="p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: ADMIN_STUDIO_THEME.panelBg }}>
            <p className="text-[5px] font-futura uppercase mb-0.5" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              {field.label}
            </p>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, lineHeight: 1.45 }}>
              {field.value}
            </p>
          </div>
        ))}
      </div>

      <AdminStudioSectionHeading>PROMPT VERSIONS</AdminStudioSectionHeading>
      <div className="space-y-2 mb-4">
        {studio.promptVersions.map((pv) => (
          <div key={pv.id} className="p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.75)' }}>
            <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: studio.accentHex }}>
              {pv.label} · {pv.createdAt}
            </p>
            <p className="text-[6px] font-futura uppercase mt-1 whitespace-pre-wrap" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {pv.body}
            </p>
          </div>
        ))}
      </div>

      <AdminStudioSectionHeading>USAGE MAP</AdminStudioSectionHeading>
      <div className="mb-3 space-y-1">
        {studio.usageMap.map((u) => (
          <div key={u} className="px-2 py-1 border text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${studio.accentHex}`, background: 'rgba(255,255,255,0.75)' }}>
            {u}
          </div>
        ))}
      </div>

      <AdminStudioSectionHeading>IMPACT IF CHANGED</AdminStudioSectionHeading>
      <div className="mb-4 space-y-1">
        {studio.impactMap.map((i) => (
          <div key={i} className="px-2 py-1 border text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: '#EB1C24', borderColor: ADMIN_STUDIO_THEME.panelBorder, background: ADMIN_STUDIO_THEME.selectedBg }}>
            {i}
          </div>
        ))}
      </div>

      <AdminStudioDisclaimerFooter />
    </AdminStudioStageShell>
  );
}
