import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioProductionPackCard } from '../../../../components/admin/studio/AdminStudioProductionPackCard';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { useAdminStudioProduction } from '../../../../hooks/useAdminStudioProductionState';
import {
  ADMIN_STUDIO_PRODUCTION_SUBTITLE,
  PRODUCTION_DASHBOARD_SECTIONS,
  PRODUCTION_INHERITANCE_CHAIN,
  PRODUCTION_KANBAN_STAGES,
  type ProductionStageId,
} from '../../../../utils/adminStudioProductionDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioProductionPage() {
  const navigate = useNavigate();
  const { packs, packsByStage, moveToStage, addPack, draggedPackId, setDraggedPackId } = useAdminStudioProduction();
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [boardView, setBoardView] = useState(false);

  const handleAdd = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const id = addPack(trimmed);
    setNewTitle('');
    setAdding(false);
    navigate(`/admin/studio/production/${id}`);
  };

  const handleDrop = (stage: ProductionStageId) => {
    if (draggedPackId) {
      moveToStage(draggedPackId, stage);
      setDraggedPackId(null);
    }
  };

  return (
    <AdminStudioStageShell
      title="PRODUCTION"
      subtitle={ADMIN_STUDIO_PRODUCTION_SUBTITLE}
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          OPERATIONAL HEART — EVERY CONTENT PACK PASSES THROUGH PRODUCTION
        </p>
        <div className="flex flex-col items-center gap-0">
          {PRODUCTION_INHERITANCE_CHAIN.map((step, i) => (
            <div key={step} className="w-full flex flex-col items-center">
              {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
              <div
                className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border"
                style={{
                  fontWeight: 515,
                  color: step === 'PRODUCTION PIPELINE' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                  background: step === 'PRODUCTION PIPELINE' ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminStudioSectionHeading>PRODUCTION DASHBOARD</AdminStudioSectionHeading>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {PRODUCTION_DASHBOARD_SECTIONS.map((section) => (
          <div
            key={section.id}
            className="p-2.5 border"
            style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          >
            <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{section.title}</p>
            <p className="text-[14px] leading-none mt-1" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>{section.metric}</p>
            <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>{section.description}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-3">
        <button type="button" onClick={() => setBoardView(false)} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: !boardView ? '#FFF' : ADMIN_STUDIO_THEME.textSecondary, background: !boardView ? ADMIN_STUDIO_THEME.accent : 'rgba(255,255,255,0.7)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>PACK LIST</button>
        <button type="button" onClick={() => setBoardView(true)} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: boardView ? '#FFF' : ADMIN_STUDIO_THEME.textSecondary, background: boardView ? ADMIN_STUDIO_THEME.accent : 'rgba(255,255,255,0.7)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>KANBAN BOARD</button>
      </div>

      {boardView ? (
        <div className="space-y-3 mb-4 max-h-[420px] overflow-y-auto">
          {PRODUCTION_KANBAN_STAGES.map((stage) => {
            const stagePacks = packsByStage.get(stage.id) ?? [];
            return (
              <div
                key={stage.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(stage.id)}
                className="p-2 border"
                style={{ background: draggedPackId ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.55)', borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${ADMIN_STUDIO_THEME.accent}` }}
              >
                <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {stage.label} · {stagePacks.length}
                </p>
                <div className="space-y-2">
                  {stagePacks.map((pack) => (
                    <AdminStudioProductionPackCard
                      key={pack.id}
                      pack={pack}
                      draggable
                      onDragStart={() => setDraggedPackId(pack.id)}
                      onClick={() => navigate(`/admin/studio/production/${pack.id}`)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {packs.map((pack) => (
            <AdminStudioProductionPackCard key={pack.id} pack={pack} onClick={() => navigate(`/admin/studio/production/${pack.id}`)} />
          ))}
        </div>
      )}

      {adding ? (
        <div className="mb-4 space-y-2">
          <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="NEW CONTENT PACK TITLE" className="w-full bg-white border text-black text-[10px] font-futura uppercase px-3 py-2 outline-none" style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.inputBorder }} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setAdding(false)} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>CANCEL</button>
            <button type="button" onClick={handleAdd} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: '#FFF', background: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>CREATE PACK</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="w-full mb-4 py-2.5 text-[7px] font-futura uppercase border border-dashed" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: `${ADMIN_STUDIO_THEME.accent}66` }}>+ NEW CONTENT PACK</button>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={() => navigate('/admin/studio/casting')} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>← CASTING</button>
        <button type="button" onClick={() => navigate('/admin/studio/ai-orchestrator')} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>AI ORCHESTRATOR →</button>
      </div>

      <AdminStudioDisclaimerFooter>PROVIDERS NOT CONNECTED · TEAM COLLAB ARCHITECTURE ONLY · DRAG PACKS BETWEEN STAGES</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
