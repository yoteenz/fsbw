import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioSectionHeading } from '../../../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { getAssetDirectorTalentById } from '../../../../../../utils/adminStudioAssetDirectorDemo';
import { ADMIN_STUDIO_THEME } from '../../../../../../utils/adminStudioTheme';

export default function AdminStudioAssetDirectorTalentDetailPage() {
  const { talentId } = useParams<{ talentId: string }>();
  const navigate = useNavigate();
  const talent = talentId ? getAssetDirectorTalentById(talentId) : undefined;

  if (!talentId || !talent) {
    return <Navigate to="/admin/studio/asset-director/talent" replace />;
  }

  return (
    <AdminStudioStageShell
      title={talent.name}
      subtitle="ASSET DIRECTOR · TALENT VISUAL PROFILE"
      breadcrumbParentLabel="TALENT"
      breadcrumbParentPath="/admin/studio/asset-director/talent"
      onBack={() => navigate('/admin/studio/asset-director/talent')}
      accentHex={talent.accentHex}
    >
      <div
        className="relative mb-3 overflow-hidden border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: `2px solid ${talent.accentHex}` }}
      >
        <img src={talent.previewSrc} alt="" className="w-full h-36 object-cover opacity-90" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(255,255,255,0.95) 100%)' }} />
      </div>

      {[
        { label: 'MASTER PORTRAIT', value: talent.masterPortrait },
        { label: 'VIDEO REFERENCE', value: talent.videoReference },
        { label: 'VOICE SAMPLE', value: talent.voiceSamplePlaceholder },
        { label: 'HAIRSTYLE', value: talent.hairstyle },
        { label: 'MAKEUP', value: talent.makeup },
        { label: 'JEWELRY', value: talent.jewelry },
        { label: 'GESTURE LIBRARY', value: talent.gestureLibrary },
      ].map((field) => (
        <div key={field.label} className="p-2 mb-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: ADMIN_STUDIO_THEME.panelBg }}>
          <p className="text-[5px] font-futura uppercase mb-0.5" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{field.label}</p>
          <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, lineHeight: 1.45 }}>{field.value}</p>
        </div>
      ))}

      <AdminStudioSectionHeading>WARDROBE · EXPRESSIONS · POSES</AdminStudioSectionHeading>
      <div className="grid grid-cols-3 gap-1 mb-4">
        <div className="p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          <p className="text-[5px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>WARDROBE</p>
          {talent.wardrobe.map((w) => (
            <p key={w} className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{w}</p>
          ))}
        </div>
        <div className="p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          <p className="text-[5px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>EXPRESSIONS</p>
          {talent.expressions.map((e) => (
            <p key={e} className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{e}</p>
          ))}
        </div>
        <div className="p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          <p className="text-[5px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>POSES</p>
          {talent.poses.map((p) => (
            <p key={p} className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{p}</p>
          ))}
        </div>
      </div>

      <AdminStudioSectionHeading>PROMPT VERSIONS</AdminStudioSectionHeading>
      <div className="space-y-2 mb-4">
        {talent.promptVersions.map((pv) => (
          <div key={pv.id} className="p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.75)' }}>
            <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: talent.accentHex }}>{pv.label}</p>
            <p className="text-[6px] font-futura uppercase mt-1 whitespace-pre-wrap" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>{pv.body}</p>
          </div>
        ))}
      </div>

      <AdminStudioSectionHeading>APPEARANCES</AdminStudioSectionHeading>
      <div className="mb-3 space-y-1">
        {talent.appearances.map((a) => (
          <div key={a} className="px-2 py-1 border text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${talent.accentHex}` }}>{a}</div>
        ))}
      </div>

      <AdminStudioSectionHeading>USAGE MAP</AdminStudioSectionHeading>
      <div className="mb-3 space-y-1">
        {talent.usageMap.map((u) => (
          <div key={u} className="px-2 py-1 border text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.75)' }}>{u}</div>
        ))}
      </div>

      <AdminStudioSectionHeading>IMPACT IF CHANGED</AdminStudioSectionHeading>
      <div className="mb-4 space-y-1">
        {talent.impactMap.map((i) => (
          <div key={i} className="px-2 py-1 border text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: '#EB1C24', borderColor: ADMIN_STUDIO_THEME.panelBorder, background: ADMIN_STUDIO_THEME.selectedBg }}>{i}</div>
        ))}
      </div>

      <AdminStudioDisclaimerFooter />
    </AdminStudioStageShell>
  );
}
