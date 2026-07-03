import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioTalentCard } from '../../../../components/admin/studio/AdminStudioTalentCard';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { useAdminStudioTalentAgency } from '../../../../hooks/useAdminStudioTalentAgencyState';
import {
  ADMIN_STUDIO_TALENT_SUBTITLE,
  TALENT_INHERITANCE_CHAIN,
} from '../../../../utils/adminStudioTalentAgencyDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioTalentAgencyPage() {
  const navigate = useNavigate();
  const { talent, addCustomTalent } = useAdminStudioTalentAgency();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const id = addCustomTalent(trimmed);
    setNewName('');
    setAdding(false);
    navigate(`/admin/studio/talent-agency/${id}`);
  };

  return (
    <AdminStudioStageShell
      title="TALENT AGENCY"
      subtitle={ADMIN_STUDIO_TALENT_SUBTITLE}
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <div
        className="p-3 mb-4 border"
        style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
      >
        <p
          className="text-[7px] font-futura uppercase mb-2"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
        >
          CASTING DEPARTMENT — ONE MASTER PROFILE PER PERSONALITY · NEVER DUPLICATE
        </p>
        <div className="flex flex-col items-center gap-0">
          {TALENT_INHERITANCE_CHAIN.map((step, i) => (
            <div key={step} className="w-full flex flex-col items-center">
              {i > 0 ? (
                <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} />
              ) : null}
              <div
                className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border"
                style={{
                  fontWeight: 515,
                  color: step === 'TALENT AGENCY' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                  background: step === 'TALENT AGENCY' ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminStudioSectionHeading>CASTING ROSTER</AdminStudioSectionHeading>
      <p
        className="text-[8px] font-futura uppercase mb-4 -mt-2"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}
      >
        {talent.length} PRODUCTION TALENT · REUSABLE PERSONALITIES — NOT SIMPLE AVATARS
      </p>

      <div className="grid grid-cols-2 gap-3">
        {talent.map((t) => (
          <AdminStudioTalentCard
            key={t.id}
            talent={t}
            onClick={() => navigate(`/admin/studio/talent-agency/${t.id}`)}
          />
        ))}
      </div>

      {adding ? (
        <div className="mt-4 space-y-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="NEW TALENT NAME"
            className="w-full bg-white border text-black text-[10px] font-futura uppercase px-3 py-2 outline-none"
            style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.inputBorder }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="flex-1 py-2 text-[7px] font-futura uppercase border"
              style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 py-2 text-[7px] font-futura uppercase border"
              style={{ fontWeight: 515, color: '#FFFFFF', background: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
            >
              CAST TALENT
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full mt-4 py-2.5 text-[7px] font-futura uppercase border border-dashed"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: `${ADMIN_STUDIO_THEME.accent}66`, background: 'rgba(255,255,255,0.5)' }}
        >
          + ADD TALENT
        </button>
      )}

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
          onClick={() => navigate('/admin/studio/ai-orchestrator')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          AI ORCHESTRATOR →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        TALENT AGENCY IS MASTER CAST LIBRARY · MANSION MAPPING DESIGN ONLY · PROVIDERS NOT CONNECTED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
