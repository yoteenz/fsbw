import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioLegacyCard } from '../../../../components/admin/studio/AdminStudioLegacyCard';
import { useAdminStudioLegacySystem } from '../../../../hooks/useAdminStudioLegacySystemState';
import { isAdminFounderAccount, getCurrentUser } from '../../../../utils/adminAuth';
import {
  ADMIN_STUDIO_LEGACY_SYSTEM_SUBTITLE,
  LEGACY_LANDING_CARDS,
  LEGACY_CONTRIBUTION_CHAIN,
  LEGACY_CARD_TAB_MAP,
  LEGACY_VAULT_OF_FIRSTS,
  LEGACY_HALL_OF_FAME,
  LEGACY_KEYS,
} from '../../../../utils/adminStudioLegacySystemDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioLegacySystemPage() {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, searchResults } = useAdminStudioLegacySystem();
  const isFounder = isAdminFounderAccount(getCurrentUser());

  const openMuseum = (tab?: string) => {
    navigate(tab ? `/admin/studio/legacy-system/museum?tab=${tab}` : '/admin/studio/legacy-system/museum');
  };

  return (
    <AdminStudioStageShell
      title="THE LEGACY SYSTEM"
      subtitle={ADMIN_STUDIO_LEGACY_SYSTEM_SUBTITLE}
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <div
        className="p-3 mb-3 border"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 100%)',
          borderColor: ADMIN_STUDIO_THEME.panelBorder,
          borderTop: `2px solid #8B0000`,
        }}
      >
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
          LIVING MUSEUM · PERMANENT MEMORY
        </p>
        <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          EVERY MILESTONE AUTO-ARCHIVES HERE · COMPLETE TRACEABILITY · NOTHING DUPLICATED
        </p>
      </div>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="ARCHIVE SEARCH — PEOPLE · SHOWS · AWARDS · CAPSULES…"
        className="w-full mb-3 bg-white/90 border text-black text-[9px] font-futura uppercase px-3 py-2.5 outline-none"
        style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.inputBorder }}
      />
      {searchQuery.trim() ? (
        <div className="mb-3 space-y-1 max-h-32 overflow-y-auto">
          {searchResults.length === 0 ? (
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>NO RESULTS</p>
          ) : (
            searchResults.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => navigate(r.route)}
                className="w-full text-left p-2 border"
                style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: ADMIN_STUDIO_THEME.panelBg }}
              >
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{r.label}</p>
                <p className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{r.category}</p>
              </button>
            ))
          )}
        </div>
      ) : null}

      <AdminStudioSectionHeading>THE MUSEUM</AdminStudioSectionHeading>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {LEGACY_LANDING_CARDS.filter((c) => !c.founderOnly || isFounder).map((card) => (
          <AdminStudioLegacyCard
            key={card.id}
            title={card.title}
            metric={card.metric}
            description={card.description}
            accentHex={card.accentHex}
            locked={card.id === 'vault-of-firsts'}
            onClick={() => openMuseum(LEGACY_CARD_TAB_MAP[card.id])}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <AdminStudioLegacyCard title="VAULT LOCKED" metric={String(LEGACY_VAULT_OF_FIRSTS.length)} description="FIRSTS PRESERVED" accentHex="#1F2937" onClick={() => openMuseum('vault')} locked />
        <AdminStudioLegacyCard title="HALL OF FAME" metric={String(LEGACY_HALL_OF_FAME.length)} description="LEGENDARY PLAQUES" accentHex="#CA8A04" onClick={() => openMuseum('hall-of-fame')} />
        <AdminStudioLegacyCard title="LEGACY KEYS" metric={String(LEGACY_KEYS.length)} description="SYMBOLIC ACHIEVEMENTS" accentHex="#8B0000" onClick={() => openMuseum('keys')} />
      </div>

      <button
        type="button"
        onClick={() => openMuseum()}
        className="w-full py-3 mb-4 text-[8px] font-futura uppercase border"
        style={{ fontWeight: 515, color: '#FFF', background: '#8B0000', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
      >
        ENTER THE MUSEUM →
      </button>

      <div className="p-2.5 border mb-3" style={{ background: 'rgba(255,255,255,0.5)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[5px] font-futura uppercase text-center" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.6 }}>
          {LEGACY_CONTRIBUTION_CHAIN.join(' · ')}
        </p>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={() => navigate('/admin/studio/executive-command-center')} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>← EXECUTIVE COMMAND</button>
        <button type="button" onClick={() => navigate('/admin/studio/creative-director')} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>CREATIVE DIRECTOR →</button>
      </div>

      <AdminStudioDisclaimerFooter>AUTO-ARCHIVE FROM ALL MILESTONES · DEMO DATA · CONNECTORS NOT CONNECTED</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
