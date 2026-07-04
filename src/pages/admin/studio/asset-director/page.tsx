import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioAssetDirectorSectionCard } from '../../../../components/admin/studio/AdminStudioAssetDirectorSectionCard';
import { AdminStudioAssetDirectorCard } from '../../../../components/admin/studio/AdminStudioAssetDirectorCard';
import { useAdminStudioAssetDirector } from '../../../../hooks/useAdminStudioAssetDirectorState';
import {
  ADMIN_STUDIO_ASSET_DIRECTOR_SUBTITLE,
  ASSET_DIRECTOR_INHERITANCE_CHAIN,
  ASSET_DIRECTOR_SECTIONS,
  ASSET_DIRECTOR_HEALTH_QUEUE,
} from '../../../../utils/adminStudioAssetDirectorDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioAssetDirectorPage() {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, searchResults } = useAdminStudioAssetDirector();

  const openSection = (sectionId: string) => {
    if (sectionId === 'studios') {
      navigate('/admin/studio/asset-director/studios');
      return;
    }
    if (sectionId === 'talent') {
      navigate('/admin/studio/asset-director/talent');
      return;
    }
    navigate(`/admin/studio/asset-director/section/${sectionId}`);
  };

  return (
    <AdminStudioStageShell
      title="ASSET DIRECTOR"
      subtitle={ADMIN_STUDIO_ASSET_DIRECTOR_SUBTITLE}
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <div
        className="p-3 mb-3 border"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 100%)',
          borderColor: ADMIN_STUDIO_THEME.panelBorder,
          borderTop: '2px solid #EB1C24',
        }}
      >
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
          VISUAL DEPARTMENT · SINGLE SOURCE OF TRUTH
        </p>
        <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          NOT A FILE MANAGER · NOT A GENERIC MEDIA LIBRARY · VISUAL IDENTITY SYSTEM
        </p>
      </div>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="SEARCH STUDIOS · TALENT · MATERIALS · WARDROBE…"
        className="w-full mb-3 bg-white/90 border text-black text-[9px] font-futura uppercase px-3 py-2.5 outline-none"
        style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.inputBorder }}
      />
      {searchQuery.trim() ? (
        <div className="mb-3 space-y-1 max-h-32 overflow-y-auto">
          {searchResults.length === 0 ? (
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              NO RESULTS
            </p>
          ) : (
            searchResults.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => navigate(r.route)}
                className="w-full text-left p-2 border"
                style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: ADMIN_STUDIO_THEME.panelBg }}
              >
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
                  {r.label}
                </p>
                <p className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {r.category}
                </p>
              </button>
            ))
          )}
        </div>
      ) : null}

      <div
        className="p-3 mb-4 border"
        style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
      >
        <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          VISUAL INHERITANCE CHAIN
        </p>
        <div className="flex flex-col items-center gap-0">
          {ASSET_DIRECTOR_INHERITANCE_CHAIN.map((step, i) => (
            <div key={step} className="w-full flex flex-col items-center">
              {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
              <div
                className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border"
                style={{
                  fontWeight: 515,
                  color: step === 'ASSET DIRECTOR' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                  background: step === 'ASSET DIRECTOR' ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminStudioSectionHeading>VISUAL ASSET DASHBOARD</AdminStudioSectionHeading>
      <p className="text-[7px] font-futura uppercase mb-3 -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        16 SECTIONS · PREMIUM CARDS · APPROVED VISUAL DNA
      </p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {ASSET_DIRECTOR_SECTIONS.map((section) => (
          <AdminStudioAssetDirectorSectionCard
            key={section.id}
            title={section.title}
            metric={section.metric}
            description={section.description}
            accentHex={section.accentHex}
            onClick={() => openSection(section.id)}
          />
        ))}
      </div>

      <AdminStudioSectionHeading>HEALTH ALERTS</AdminStudioSectionHeading>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {ASSET_DIRECTOR_HEALTH_QUEUE.slice(0, 4).map((entry) => (
          <AdminStudioAssetDirectorCard
            key={entry.assetId}
            asset={{
              id: entry.assetId,
              name: entry.assetName,
              category: entry.category,
              previewSrc: '/assets/NOIR/noir-thumb.png',
              status: 'needs-review',
              lastUpdated: entry.lastChecked,
              usedBy: [],
              version: 'v1.0',
              health: entry.indicators,
              accentHex: entry.priority === 'high' ? '#EB1C24' : '#CA8A04',
            }}
            onClick={() => navigate('/admin/studio/asset-director/section/asset-health')}
          />
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => navigate('/admin/studio/studio-lot')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← STUDIO LOT
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/studio/talent-agency')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          TALENT AGENCY →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        ASSET DIRECTOR IS VISUAL SOURCE OF TRUTH · PLACEHOLDER ASSETS ONLY · AI GENERATION NOT CONNECTED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
