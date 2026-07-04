import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioCastingBoardCard } from '../../../../components/admin/studio/AdminStudioCastingBoardCard';
import { AdminStudioCastingTalentCard } from '../../../../components/admin/studio/AdminStudioCastingTalentCard';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioCreativeWidget } from '../../../../components/admin/studio/AdminStudioCreativeWidget';
import { useAdminStudioCasting } from '../../../../hooks/useAdminStudioCastingState';
import {
  ADMIN_STUDIO_CASTING_SUBTITLE,
  CASTING_INHERITANCE_CHAIN,
  CASTING_WORKFLOW_STEPS,
  CASTING_DASHBOARD_SECTIONS,
  ADMIN_STUDIO_COMMUNITY_TALENT,
  ADMIN_STUDIO_CASTING_CALLS,
} from '../../../../utils/adminStudioCastingDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioCastingPage() {
  const navigate = useNavigate();
  const { productions, activeTalent, availableTalent, guestTalent, addProduction } = useAdminStudioCasting();
  const [adding, setAdding] = useState(false);
  const [newShow, setNewShow] = useState('');
  const [dashboardFocus, setDashboardFocus] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmed = newShow.trim();
    if (!trimmed) return;
    const id = addProduction(trimmed);
    setNewShow('');
    setAdding(false);
    navigate(`/admin/studio/casting/${id}`);
  };

  const filteredTalent =
    dashboardFocus === 'available-talent'
      ? availableTalent
      : dashboardFocus === 'guest-talent'
        ? guestTalent
        : dashboardFocus === 'active-talent'
          ? activeTalent
          : activeTalent;

  return (
    <AdminStudioStageShell
      title="CASTING"
      subtitle={ADMIN_STUDIO_CASTING_SUBTITLE}
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          CASTING SITS BETWEEN TALENT AGENCY & PRODUCTION — NOTHING PROCEEDS WITHOUT APPROVED CAST
        </p>
        <div className="flex flex-col items-center gap-0">
          {CASTING_INHERITANCE_CHAIN.map((step, i) => (
            <div key={step} className="w-full flex flex-col items-center">
              {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
              <div
                className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border"
                style={{
                  fontWeight: 515,
                  color: step === 'CASTING' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                  background: step === 'CASTING' ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminStudioSectionHeading>CASTING DASHBOARD</AdminStudioSectionHeading>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {CASTING_DASHBOARD_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setDashboardFocus(dashboardFocus === section.id ? null : section.id)}
            className="text-left p-2.5 border transition-colors"
            style={{
              background: dashboardFocus === section.id ? ADMIN_STUDIO_THEME.selectedBg : ADMIN_STUDIO_THEME.panelBg,
              borderColor: ADMIN_STUDIO_THEME.panelBorder,
              borderTop: dashboardFocus === section.id ? `2px solid ${ADMIN_STUDIO_THEME.accent}` : undefined,
            }}
          >
            <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              {section.title}
            </p>
            <p
              className="text-[14px] leading-none mt-1"
              style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}
            >
              {section.metric}
            </p>
            <p className="text-[5px] font-futura uppercase mt-1 line-clamp-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              {section.description}
            </p>
          </button>
        ))}
      </div>

      <AdminStudioSectionHeading>CASTING WORKFLOW</AdminStudioSectionHeading>
      <div className="flex flex-col items-center gap-0 mb-4 -mt-1">
        {CASTING_WORKFLOW_STEPS.map((step, i) => (
          <div key={step.id} className="w-full flex flex-col items-center">
            {i > 0 ? <div className="text-[8px]" style={{ color: ADMIN_STUDIO_THEME.accent }}>↓</div> : null}
            <div
              className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border"
              style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.65)' }}
            >
              {step.label}
            </div>
          </div>
        ))}
      </div>

      <AdminStudioSectionHeading>CASTING BOARD</AdminStudioSectionHeading>
      <p className="text-[8px] font-futura uppercase mb-3 -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {productions.length} PRODUCTIONS · TAP TO MANAGE CAST
      </p>
      <div className="space-y-2 mb-4">
        {productions.map((p) => (
          <AdminStudioCastingBoardCard key={p.id} production={p} onClick={() => navigate(`/admin/studio/casting/${p.id}`)} />
        ))}
      </div>

      {adding ? (
        <div className="mb-4 space-y-2">
          <input
            type="text"
            value={newShow}
            onChange={(e) => setNewShow(e.target.value)}
            placeholder="SHOW NAME FOR NEW PRODUCTION"
            className="w-full bg-white border text-black text-[10px] font-futura uppercase px-3 py-2 outline-none"
            style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.inputBorder }}
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setAdding(false)} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>CANCEL</button>
            <button type="button" onClick={handleAdd} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: '#FFF', background: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>CREATE PRODUCTION</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="w-full mb-4 py-2.5 text-[7px] font-futura uppercase border border-dashed" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: `${ADMIN_STUDIO_THEME.accent}66` }}>+ NEW PRODUCTION</button>
      )}

      <AdminStudioSectionHeading>TALENT ROSTER</AdminStudioSectionHeading>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {filteredTalent.map((t) => (
          <AdminStudioCastingTalentCard key={t.id} talent={t} onClick={() => navigate(`/admin/studio/casting/talent/${t.id}`)} />
        ))}
      </div>

      <AdminStudioSectionHeading>COMMUNITY TALENT</AdminStudioSectionHeading>
      <div className="space-y-2 mb-4">
        {ADMIN_STUDIO_COMMUNITY_TALENT.map((cm) => (
          <div key={cm.id} className="p-3 border flex justify-between items-center" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <div>
              <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{cm.name}</p>
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{cm.notes}</p>
            </div>
            <span className="text-[6px] font-futura uppercase px-2 py-0.5 border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>{cm.status.replace('-', ' ')}</span>
          </div>
        ))}
      </div>

      <AdminStudioSectionHeading>CASTING CALLS (INACTIVE)</AdminStudioSectionHeading>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {ADMIN_STUDIO_CASTING_CALLS.map((call) => (
          <AdminStudioCreativeWidget key={call.id} label={call.title} value={call.status.toUpperCase()} subvalue={call.description} accentHex={call.status === 'planned' ? '#CA8A04' : ADMIN_STUDIO_THEME.textSecondary} />
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <button type="button" onClick={() => navigate('/admin/studio/talent-agency')} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>← TALENT AGENCY</button>
        <button type="button" onClick={() => navigate('/admin/studio/ai-orchestrator')} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>AI ORCHESTRATOR →</button>
      </div>

      <AdminStudioDisclaimerFooter>NOTHING PROCEEDS WITHOUT APPROVED CAST · CASTING CALLS INACTIVE · LICENSING ARCHITECTURE ONLY</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
