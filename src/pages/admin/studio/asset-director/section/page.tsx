import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioSectionHeading } from '../../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioAssetDirectorCard } from '../../../../../components/admin/studio/AdminStudioAssetDirectorCard';
import {
  getAssetDirectorSectionById,
  getAssetDirectorSectionCards,
  ASSET_DIRECTOR_MOODBOARDS,
  ASSET_DIRECTOR_RELATIONSHIPS,
  ASSET_DIRECTOR_VERSION_HISTORY,
  ASSET_DIRECTOR_HEALTH_QUEUE,
  ASSET_DIRECTOR_MATERIALS,
  ASSET_HEALTH_LABELS,
  type AssetDirectorSectionId,
  type AssetDirectorMaterial,
} from '../../../../../utils/adminStudioAssetDirectorDemo';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';

const VALID_SECTIONS = new Set<string>([
  'wardrobe', 'expressions', 'poses', 'camera', 'lighting', 'materials',
  'props', 'animations', 'audio', 'moodboards', 'brand-materials',
  'relationships', 'version-history', 'asset-health',
]);

export default function AdminStudioAssetDirectorSectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();

  if (!sectionId || !VALID_SECTIONS.has(sectionId)) {
    return <Navigate to="/admin/studio/asset-director" replace />;
  }

  const section = getAssetDirectorSectionById(sectionId);
  const cards = getAssetDirectorSectionCards(sectionId as AssetDirectorSectionId);

  if (!section) {
    return <Navigate to="/admin/studio/asset-director" replace />;
  }

  return (
    <AdminStudioStageShell
      title={section.title}
      subtitle={`ASSET DIRECTOR · ${section.description}`}
      breadcrumbParentLabel="ASSET DIRECTOR"
      breadcrumbParentPath="/admin/studio/asset-director"
      onBack={() => navigate('/admin/studio/asset-director')}
      accentHex={section.accentHex}
    >
      {sectionId === 'moodboards' ? (
        <>
          <AdminStudioSectionHeading>LIVING MOODBOARDS</AdminStudioSectionHeading>
          <div className="space-y-3 mb-4">
            {ASSET_DIRECTOR_MOODBOARDS.map((board) => (
              <div key={board.id} className="border overflow-hidden" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: `2px solid ${board.accentHex}` }}>
                <div className="relative h-24">
                  <img src={board.coverSrc} alt="" className="w-full h-full object-cover opacity-90" />
                  <div className="absolute bottom-0 left-0 right-0 p-2" style={{ background: 'linear-gradient(transparent, rgba(255,255,255,0.95))' }}>
                    <p className="text-[9px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>{board.title}</p>
                  </div>
                </div>
                <div className="p-2" style={{ background: ADMIN_STUDIO_THEME.panelBg }}>
                  <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>{board.notes}</p>
                  <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: board.accentHex }}>{board.visualDirection}</p>
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    {board.images.map((img) => (
                      <div key={img.id} className="relative aspect-square overflow-hidden border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                        <img src={img.src} alt="" className="w-full h-full object-cover" />
                        <p className="absolute bottom-0 left-0 right-0 text-[4px] font-futura uppercase px-0.5" style={{ fontWeight: 515, background: 'rgba(255,255,255,0.9)', color: ADMIN_STUDIO_THEME.textSecondary }}>{img.caption}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[4px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    PROMPTS: {board.promptReferences.join(' · ')} · UPD {board.lastUpdated}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {sectionId === 'relationships' ? (
        <>
          <AdminStudioSectionHeading>ASSET RELATIONSHIPS</AdminStudioSectionHeading>
          <p className="text-[6px] font-futura uppercase mb-3 -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            WHERE ASSETS ARE USED · WHAT CHANGES IMPACT
          </p>
          <div className="space-y-3 mb-4">
            {ASSET_DIRECTOR_RELATIONSHIPS.map((rel) => (
              <div key={rel.assetId} className="p-3 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: ADMIN_STUDIO_THEME.panelBg }}>
                <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{rel.assetName}</p>
                <p className="text-[5px] font-futura uppercase mt-0.5" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{rel.category}</p>
                <p className="text-[5px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: '#2563EB' }}>USED BY:</p>
                {rel.usedBy.map((u) => (
                  <p key={u} className="text-[5px] font-futura uppercase ml-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>• {u}</p>
                ))}
                <p className="text-[5px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: '#EB1C24' }}>IMPACTS:</p>
                {rel.impacts.map((i) => (
                  <p key={i} className="text-[5px] font-futura uppercase ml-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>• {i}</p>
                ))}
              </div>
            ))}
          </div>
        </>
      ) : null}

      {sectionId === 'version-history' ? (
        <>
          <AdminStudioSectionHeading>VERSION HISTORY</AdminStudioSectionHeading>
          <div className="space-y-2 mb-4">
            {ASSET_DIRECTOR_VERSION_HISTORY.map((entry) => (
              <div key={entry.id} className="p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.8)' }}>
                <div className="flex justify-between gap-2">
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{entry.assetName}</p>
                  <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: section.accentHex }}>{entry.version}</p>
                </div>
                <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {entry.previousVersion} → {entry.version} · {entry.changedBy} · {entry.changedAt}
                </p>
                <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{entry.changeSummary}</p>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {sectionId === 'asset-health' ? (
        <>
          <AdminStudioSectionHeading>ASSET HEALTH</AdminStudioSectionHeading>
          <p className="text-[6px] font-futura uppercase mb-3 -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            REFRESH QUEUE · QUALITY INDICATORS
          </p>
          <div className="space-y-2 mb-4">
            {ASSET_DIRECTOR_HEALTH_QUEUE.map((entry) => (
              <div key={entry.assetId} className="p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `3px solid ${entry.priority === 'high' ? '#EB1C24' : entry.priority === 'medium' ? '#CA8A04' : '#6B7280'}`, background: ADMIN_STUDIO_THEME.panelBg }}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{entry.assetName}</p>
                <p className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{entry.category} · {entry.priority.toUpperCase()} · {entry.lastChecked}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {entry.indicators.map((ind) => (
                    <span key={ind} className="px-1 py-0.5 text-[4px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.9)' }}>
                      {ASSET_HEALTH_LABELS[ind]}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {sectionId === 'materials' ? (
        <>
          <AdminStudioSectionHeading>MATERIAL LIBRARY</AdminStudioSectionHeading>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {ASSET_DIRECTOR_MATERIALS.map((mat: AssetDirectorMaterial) => (
              <div key={mat.id} className="border overflow-hidden" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                <AdminStudioAssetDirectorCard asset={mat} />
                <div className="p-2" style={{ background: ADMIN_STUDIO_THEME.panelBg }}>
                  <p className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>{mat.promptDescription}</p>
                  <p className="text-[4px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: '#16A34A' }}>RULES: {mat.usageRules}</p>
                  <p className="text-[4px] font-futura uppercase mt-0.5" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>EXAMPLES: {mat.approvedExamples}</p>
                  <p className="text-[4px] font-futura uppercase mt-0.5" style={{ fontWeight: 515, color: '#EB1C24' }}>AVOID: {mat.doNotUseNotes}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {cards.length > 0 && sectionId !== 'materials' ? (
        <>
          <AdminStudioSectionHeading>{section.title}</AdminStudioSectionHeading>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {cards.map((asset) => (
              <div key={asset.id}>
                <AdminStudioAssetDirectorCard asset={asset} />
                {asset.promptNotes ? (
                  <p className="text-[5px] font-futura uppercase mt-1 px-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                    {asset.promptNotes}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </>
      ) : null}

      <AdminStudioDisclaimerFooter />
    </AdminStudioStageShell>
  );
}
