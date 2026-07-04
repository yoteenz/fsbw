import { useState } from 'react';
import { useAdminStudioExecutiveAiDirector } from '../../../../hooks/useAdminStudioExecutiveAiDirectorState';
import { SOURCE_LABELS } from '../../../../utils/adminStudioExecutiveAiDirectorDemo';
import { EAD_VISUAL, eadActionBtn, eadCaption, eadPanelStyle, eadSectionTitle, eadSourceTag } from './executiveAiDirectorTheme';

type ExecutiveAiDirectorAdvisorPanelProps = {
  draftId?: string;
};

/** Compact advisor for Director Mode — strategic review before generation. */
export function ExecutiveAiDirectorAdvisorPanel({ draftId }: ExecutiveAiDirectorAdvisorPanelProps) {
  const [open, setOpen] = useState(false);
  const { productionNotes, promptReview, sendChat, chatInput, setChatInput, chatLoading } = useAdminStudioExecutiveAiDirector({ draftId });

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} style={{ ...eadActionBtn, width: '100%', marginBottom: '8px' }}>
        ASK EXECUTIVE AI DIRECTOR
      </button>
    );
  }

  return (
    <section style={{ ...eadPanelStyle, padding: '10px', marginBottom: '8px' }}>
      <div className="flex justify-between items-center mb-2">
        <p style={{ ...eadSectionTitle, margin: 0, fontSize: '9px' }}>EXECUTIVE AI DIRECTOR</p>
        <button type="button" onClick={() => setOpen(false)} style={{ ...eadCaption, border: 'none', background: 'none', cursor: 'pointer' }}>
          ×
        </button>
      </div>
      <p style={{ ...eadCaption, marginBottom: '8px' }}>STRATEGIC REVIEW · NOT CONTENT CREATION</p>

      <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
        {productionNotes.slice(0, 4).map((n) => (
          <div key={n.id} style={{ borderLeft: `2px solid ${n.severity === 'warn' || n.severity === 'critical' ? EAD_VISUAL.red : EAD_VISUAL.gray}`, paddingLeft: '8px' }}>
            <p style={{ ...eadCaption, color: EAD_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{n.title}</p>
            <p style={{ ...eadCaption, fontSize: '7px' }}>{n.detail}</p>
            <p style={eadSourceTag(n.source)}>{SOURCE_LABELS[n.source]}</p>
          </div>
        ))}
      </div>

      <p style={{ ...eadCaption, fontSize: '7px' }}>PROMPT SCORE: {promptReview.score}/100</p>

      <div className="flex gap-1 mt-2">
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendChat(chatInput)}
          placeholder="REVIEW BEFORE GENERATION…"
          className="flex-1 border px-2 py-1"
          style={{ fontSize: '8px' }}
        />
        <button type="button" onClick={() => sendChat(chatInput || 'Review my production before publishing')} style={{ ...eadActionBtn, fontSize: '7px' }} disabled={chatLoading}>
          ASK
        </button>
      </div>
    </section>
  );
}
