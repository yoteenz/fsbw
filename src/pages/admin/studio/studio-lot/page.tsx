import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioLotCard } from '../../../../components/admin/studio/AdminStudioLotCard';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { useAdminStudioLot } from '../../../../hooks/useAdminStudioStudioLotState';
import {
  ADMIN_STUDIO_LOT_SUBTITLE,
  STUDIO_LOT_INHERITANCE_CHAIN,
} from '../../../../utils/adminStudioStudioLotDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioLotPage() {
  const navigate = useNavigate();
  const { studios, addCustomStudio } = useAdminStudioLot();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const id = addCustomStudio(trimmed);
    setNewName('');
    setAdding(false);
    navigate(`/admin/studio/studio-lot/${id}`);
  };

  return (
    <AdminStudioStageShell
      title="STUDIO LOT"
      subtitle={ADMIN_STUDIO_LOT_SUBTITLE}
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
          PRODUCTION CAMPUS — ONE ENVIRONMENT PER STUDIO · NEVER DUPLICATE
        </p>
        <div className="flex flex-col items-center gap-0">
          {STUDIO_LOT_INHERITANCE_CHAIN.map((step, i) => (
            <div key={step} className="w-full flex flex-col items-center">
              {i > 0 ? (
                <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} />
              ) : null}
              <div
                className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border"
                style={{
                  fontWeight: 515,
                  color: step === 'STUDIO LOT' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                  background: step === 'STUDIO LOT' ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminStudioSectionHeading>PRODUCTION BACKLOT</AdminStudioSectionHeading>
      <p
        className="text-[8px] font-futura uppercase mb-4 -mt-2"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}
      >
        {studios.length} VIRTUAL STUDIOS · FULLY BRANDED ENVIRONMENTS — NOT BACKGROUNDS
      </p>

      <div className="grid grid-cols-2 gap-3">
        {studios.map((studio) => (
          <AdminStudioLotCard
            key={studio.id}
            studio={studio}
            onClick={() => navigate(`/admin/studio/studio-lot/${studio.id}`)}
          />
        ))}
      </div>

      {adding ? (
        <div className="mt-4 space-y-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="NEW STUDIO NAME"
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
              BUILD STUDIO
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
          + ADD STUDIO
        </button>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => navigate('/admin/studio/show-bible')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← SHOW BIBLE
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
        STUDIO LOT IS MASTER VISUAL UNIVERSE · MANSION MAPPING DESIGN ONLY · PROVIDERS NOT CONNECTED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
