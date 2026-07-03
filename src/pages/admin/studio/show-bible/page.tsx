import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioShowBibleCard } from '../../../../components/admin/studio/AdminStudioShowBibleCard';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { useAdminStudioShowBible } from '../../../../hooks/useAdminStudioShowBibleState';
import {
  ADMIN_STUDIO_SHOW_BIBLE_SUBTITLE,
  SHOW_BIBLE_INHERITANCE_CHAIN,
} from '../../../../utils/adminStudioShowBibleDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioShowBiblePage() {
  const navigate = useNavigate();
  const { shows, addCustomShow } = useAdminStudioShowBible();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAddShow = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const id = addCustomShow(trimmed);
    setNewName('');
    setAdding(false);
    navigate(`/admin/studio/show-bible/${id}`);
  };

  return (
    <AdminStudioStageShell
      title="SHOW BIBLE"
      subtitle={ADMIN_STUDIO_SHOW_BIBLE_SUBTITLE}
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
          PRODUCTION HIERARCHY — AI NEVER BYPASSES SHOW BIBLE
        </p>
        <div className="flex flex-col items-center gap-0">
          {SHOW_BIBLE_INHERITANCE_CHAIN.map((step, i) => (
            <div key={step} className="w-full flex flex-col items-center">
              {i > 0 ? (
                <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} />
              ) : null}
              <div
                className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border"
                style={{
                  fontWeight: 515,
                  color: step === 'SHOW BIBLE' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                  background: step === 'SHOW BIBLE' ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminStudioSectionHeading>SHOW DIRECTORY</AdminStudioSectionHeading>
      <p
        className="text-[8px] font-futura uppercase mb-4 -mt-2"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}
      >
        {shows.length} RECURRING SERIES · TAP TO OPEN PRODUCTION PROFILE
      </p>

      <div className="grid grid-cols-2 gap-3">
        {shows.map((show) => (
          <AdminStudioShowBibleCard
            key={show.id}
            show={show}
            onClick={() => navigate(`/admin/studio/show-bible/${show.id}`)}
          />
        ))}
      </div>

      {adding ? (
        <div className="mt-4 space-y-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="NEW SHOW NAME"
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
              onClick={handleAddShow}
              className="flex-1 py-2 text-[7px] font-futura uppercase border"
              style={{ fontWeight: 515, color: '#FFFFFF', background: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
            >
              CREATE SHOW
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
          + ADD SHOW
        </button>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => navigate('/admin/studio/creative-director')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          CREATIVE DIRECTOR
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
        SHOW BIBLE IS MASTER SOURCE FOR EVERY RECURRING SERIES · PROVIDERS NOT CONNECTED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
