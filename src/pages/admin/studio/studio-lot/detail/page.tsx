import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioTabBar } from '../../../../../components/admin/studio/AdminStudioTabBar';
import { AdminStudioSectionHeading } from '../../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioEditableField } from '../../../../../components/admin/studio/AdminStudioEditableField';
import { AdminStudioLotFieldGroups } from '../../../../../components/admin/studio/AdminStudioLotFieldGroups';
import { AdminStudioCreativeWidget } from '../../../../../components/admin/studio/AdminStudioCreativeWidget';
import { useAdminStudioLot } from '../../../../../hooks/useAdminStudioStudioLotState';
import {
  STUDIO_LOT_TABS,
  STUDIO_LOT_PROFILE_GROUPS,
  STUDIO_LOT_VISUAL_GROUPS,
  STUDIO_LOT_CAMERA_GROUPS,
  STUDIO_LOT_LIGHTING_GROUPS,
  STUDIO_LOT_MOTION_GROUPS,
  STUDIO_LOT_GRAPHICS_GROUPS,
  STUDIO_LOT_AUDIO_GROUPS,
  STUDIO_LOT_PROMPT_GROUPS,
  STUDIO_LOT_ASSET_GROUPS,
  STUDIO_LOT_MODES_GROUPS,
  STUDIO_LOT_CONTINUITY_GROUPS,
  STUDIO_LOT_MANSION_GROUPS,
  type StudioLotTabId,
  type StudioLotStatus,
} from '../../../../../utils/adminStudioStudioLotDemo';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';

const STATUSES: StudioLotStatus[] = ['active', 'in-development', 'archived', 'future'];

export default function AdminStudioLotDetailPage() {
  const { studioId } = useParams<{ studioId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StudioLotTabId>('profile');
  const [newPromptLabel, setNewPromptLabel] = useState('');
  const [newPromptBody, setNewPromptBody] = useState('');

  const {
    selectedStudio,
    updateField,
    setStatus,
    addPromptVersion,
    assetSearch,
    setAssetSearch,
    filteredAssets,
  } = useAdminStudioLot(studioId);

  if (!studioId) return <Navigate to="/admin/studio/studio-lot" replace />;
  if (!selectedStudio) return <Navigate to="/admin/studio/studio-lot" replace />;

  const studio = selectedStudio;
  const usageItems = studio.usageMap.split('\n').map((l) => l.trim()).filter(Boolean);

  const handleAddPromptVersion = () => {
    const label = newPromptLabel.trim() || `v${studio.promptVersions.length + 1}`;
    const body = newPromptBody.trim() || studio.promptFal;
    addPromptVersion(studio.id, label, body);
    setNewPromptLabel('');
    setNewPromptBody('');
  };

  return (
    <AdminStudioStageShell
      title={studio.studioName}
      subtitle="STUDIO LOT · VIRTUAL PRODUCTION ENVIRONMENT"
      breadcrumbParentLabel="STUDIO LOT"
      breadcrumbParentPath="/admin/studio/studio-lot"
      onBack={() => navigate('/admin/studio/studio-lot')}
    >
      <div
        className="relative mb-3 overflow-hidden border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: `2px solid ${studio.accentHex}` }}
      >
        <img src={studio.artworkSrc} alt="" className="w-full h-32 object-cover opacity-90" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(255,255,255,0.95) 100%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            {studio.description}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatus(studio.id, st)}
                className="px-2 py-0.5 text-[6px] font-futura uppercase border"
                style={{
                  fontWeight: 515,
                  color: studio.status === st ? '#FFFFFF' : ADMIN_STUDIO_THEME.textSecondary,
                  background: studio.status === st ? studio.accentHex : 'rgba(255,255,255,0.8)',
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {st.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <AdminStudioCreativeWidget label="ASSETS" value={studio.assetCount} accentHex={studio.accentHex} />
        <AdminStudioCreativeWidget label="LIGHTING" value={studio.lightingProfileSummary} accentHex={studio.accentHex} />
        <AdminStudioCreativeWidget label="UPDATED" value={studio.lastUpdated} accentHex={studio.accentHex} />
      </div>

      <AdminStudioTabBar tabs={STUDIO_LOT_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'profile' ? (
        <div className="mt-3">
          <AdminStudioLotFieldGroups groups={STUDIO_LOT_PROFILE_GROUPS} studio={studio} onUpdate={(k, v) => updateField(studio.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'visual' ? (
        <div className="mt-3">
          <AdminStudioLotFieldGroups groups={STUDIO_LOT_VISUAL_GROUPS} studio={studio} onUpdate={(k, v) => updateField(studio.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'camera' ? (
        <div className="mt-3 space-y-4">
          <AdminStudioSectionHeading>CAMERA PRESETS</AdminStudioSectionHeading>
          <div className="flex flex-wrap gap-1.5 -mt-2">
            {studio.cameraPresets.split('\n').filter(Boolean).map((preset) => (
              <span
                key={preset}
                className="px-2 py-1 text-[6px] font-futura uppercase border"
                style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${studio.accentHex}`, background: ADMIN_STUDIO_THEME.panelBg }}
              >
                {preset}
              </span>
            ))}
          </div>
          <AdminStudioLotFieldGroups groups={STUDIO_LOT_CAMERA_GROUPS} studio={studio} onUpdate={(k, v) => updateField(studio.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'lighting' ? (
        <div className="mt-3 space-y-4">
          <AdminStudioSectionHeading>LIGHTING PRESETS</AdminStudioSectionHeading>
          <div className="flex flex-wrap gap-1.5 -mt-2">
            {studio.lightingPresets.split('\n').filter(Boolean).map((preset) => (
              <span
                key={preset}
                className="px-2 py-1 text-[6px] font-futura uppercase border"
                style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.75)' }}
              >
                {preset}
              </span>
            ))}
          </div>
          <AdminStudioLotFieldGroups groups={STUDIO_LOT_LIGHTING_GROUPS} studio={studio} onUpdate={(k, v) => updateField(studio.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'motion' ? (
        <div className="mt-3">
          <AdminStudioLotFieldGroups groups={STUDIO_LOT_MOTION_GROUPS} studio={studio} onUpdate={(k, v) => updateField(studio.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'graphics' ? (
        <div className="mt-3">
          <AdminStudioLotFieldGroups groups={STUDIO_LOT_GRAPHICS_GROUPS} studio={studio} onUpdate={(k, v) => updateField(studio.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'audio' ? (
        <div className="mt-3">
          <AdminStudioLotFieldGroups groups={STUDIO_LOT_AUDIO_GROUPS} studio={studio} onUpdate={(k, v) => updateField(studio.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'prompts' ? (
        <div className="mt-3 space-y-4">
          <div className="p-2.5 border" style={{ background: ADMIN_STUDIO_THEME.selectedBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              AI PROVIDERS INHERIT STUDIO LOT — NO INDEPENDENT ENVIRONMENT GENERATION
            </p>
          </div>
          <AdminStudioLotFieldGroups groups={STUDIO_LOT_PROMPT_GROUPS} studio={studio} onUpdate={(k, v) => updateField(studio.id, k, v)} />
          <AdminStudioSectionHeading>PROMPT VERSION HISTORY</AdminStudioSectionHeading>
          {studio.promptVersions.map((pv) => (
            <div key={pv.id} className="p-3 border mb-2" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${studio.accentHex}` }}>
              <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
                {pv.label} · {pv.createdAt}
              </p>
              <p className="mt-1 text-[7px] font-futura uppercase line-clamp-3" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {pv.body}
              </p>
            </div>
          ))}
          <AdminStudioEditableField label="NEW VERSION LABEL" value={newPromptLabel} onChange={setNewPromptLabel} accentHex={studio.accentHex} />
          <AdminStudioEditableField label="NEW VERSION BODY" value={newPromptBody} onChange={setNewPromptBody} multiline accentHex={studio.accentHex} />
          <button
            type="button"
            onClick={handleAddPromptVersion}
            className="w-full py-2 text-[7px] font-futura uppercase border"
            style={{ fontWeight: 515, color: '#FFFFFF', background: studio.accentHex, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          >
            SAVE PROMPT VERSION
          </button>
        </div>
      ) : null}

      {activeTab === 'assets' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioLotFieldGroups groups={STUDIO_LOT_ASSET_GROUPS} studio={studio} onUpdate={(k, v) => updateField(studio.id, k, v)} />
          <AdminStudioSectionHeading>SEARCHABLE ASSET CATALOG</AdminStudioSectionHeading>
          <input
            type="text"
            value={assetSearch}
            onChange={(e) => setAssetSearch(e.target.value)}
            placeholder="SEARCH ASSETS..."
            className="w-full bg-white border text-black text-[10px] font-futura uppercase px-3 py-2 outline-none"
            style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.inputBorder }}
          />
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="flex justify-between items-center p-3 border"
              style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${studio.accentHex}` }}
            >
              <div>
                <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
                  {asset.name}
                </p>
                <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {asset.type} · {asset.version}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'usage' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>USAGE MAP</AdminStudioSectionHeading>
          <p className="text-[7px] font-futura uppercase -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            WHERE THIS STUDIO IS CURRENTLY USED
          </p>
          <div className="relative pl-4">
            <div className="absolute left-1.5 top-0 bottom-0 w-px" style={{ background: studio.accentHex }} />
            {usageItems.map((item, i) => (
              <div key={`${item}-${i}`} className="relative mb-2 pl-3">
                <div
                  className="absolute left-0 top-1.5 w-2 h-2 rounded-full border"
                  style={{ background: '#FFFFFF', borderColor: studio.accentHex }}
                />
                <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
          <AdminStudioEditableField
            label="EDIT USAGE MAP (ONE PER LINE)"
            value={studio.usageMap}
            onChange={(v) => updateField(studio.id, 'usageMap', v)}
            multiline
            accentHex={studio.accentHex}
          />
        </div>
      ) : null}

      {activeTab === 'modes' ? (
        <div className="mt-3">
          <AdminStudioLotFieldGroups groups={STUDIO_LOT_MODES_GROUPS} studio={studio} onUpdate={(k, v) => updateField(studio.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'continuity' ? (
        <div className="mt-3 space-y-3">
          <div className="p-2.5 border" style={{ background: ADMIN_STUDIO_THEME.selectedBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              VISUAL CONTINUITY LOCK — EPISODES MONTHS APART MUST MATCH UNLESS VERSION BUMPED
            </p>
          </div>
          <AdminStudioLotFieldGroups groups={STUDIO_LOT_CONTINUITY_GROUPS} studio={studio} onUpdate={(k, v) => updateField(studio.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'mansion' ? (
        <div className="mt-3 space-y-3">
          <div className="p-2.5 border" style={{ background: 'rgba(235,28,36,0.06)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
              FUTURE DESKTOP MANSION — DESIGN RELATIONSHIPS ONLY · NOT ACTIVE
            </p>
          </div>
          <AdminStudioLotFieldGroups groups={STUDIO_LOT_MANSION_GROUPS} studio={studio} onUpdate={(k, v) => updateField(studio.id, k, v)} />
          {studio.mansionFloor ? (
            <div className="flex flex-col items-center gap-0 p-3 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: ADMIN_STUDIO_THEME.panelBg }}>
              <div className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                {studio.studioName}
              </div>
              <div className="text-[10px]" style={{ color: studio.accentHex }}>↓</div>
              <div className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border" style={{ fontWeight: 515, color: studio.accentHex, background: ADMIN_STUDIO_THEME.selectedBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                {studio.mansionFloor} · {studio.mansionRoom}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => navigate('/admin/studio/studio-lot')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← BACKLOT
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/studio/show-bible')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          SHOW BIBLE →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        ONE REUSABLE ENVIRONMENT PER STUDIO · VERSIONING SUPPORTED · MANSION INTEGRATION PLANNED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
