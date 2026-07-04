import type { ProductionDraft } from '../../../../utils/adminStudioProductionBuilderDemo';
import type { DirectorModeSession } from '../../../../utils/adminStudioDirectorModeDemo';
import { getScenePreviewSrc } from '../../../../utils/adminStudioProductionBuilderDemo';
import { DM_VISUAL, dmCaptionStyle, dmPanelStyle, dmScriptStyle, dmSectionTitleStyle } from './directorModeTheme';

type DirectorModeRehearsalOverlayProps = {
  active: boolean;
  steps: Array<{ id: string; label: string; duration: string }>;
  currentStep: number;
  onAdvance: () => void;
  onStop: () => void;
};

export function DirectorModeRehearsalOverlay({ active, steps, currentStep, onAdvance, onStop }: DirectorModeRehearsalOverlayProps) {
  if (!active || !steps.length) return null;
  const step = steps[currentStep];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(10px)' }}
    >
      <div style={{ ...dmPanelStyle, padding: '20px', maxWidth: '400px', width: '100%', border: `1.3px solid ${DM_VISUAL.black}` }}>
        <p style={dmSectionTitleStyle}>AI REHEARSAL · SIMULATION ONLY</p>
        <p style={{ ...dmCaptionStyle, marginBottom: '12px' }}>Scene transitions · timing · voice pacing · graphic timing</p>
        <p style={{ ...dmScriptStyle, marginBottom: '8px' }}>{step?.label}</p>
        <p style={dmCaptionStyle}>DURATION: {step?.duration}</p>
        <p style={{ ...dmCaptionStyle, marginTop: '8px' }}>STEP {currentStep + 1} OF {steps.length}</p>
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={onAdvance} style={{ border: `1.3px solid ${DM_VISUAL.red}`, color: DM_VISUAL.red, padding: '8px 12px', fontSize: '9px', fontFamily: '"Futura PT Medium"', background: '#fff', cursor: 'pointer' }}>
            NEXT TRANSITION
          </button>
          <button type="button" onClick={onStop} style={{ border: '1.3px solid #000', padding: '8px 12px', fontSize: '9px', fontFamily: '"Futura PT Medium"', background: '#fff', cursor: 'pointer' }}>
            END REHEARSAL
          </button>
        </div>
      </div>
    </div>
  );
}

type DirectorModeClientPreviewProps = {
  active: boolean;
  draft: ProductionDraft;
  session: DirectorModeSession;
  onClose: () => void;
};

export function DirectorModeClientPreview({ active, draft, session, onClose }: DirectorModeClientPreviewProps) {
  if (!active) return null;
  const sorted = [...draft.scenes].sort((a, b) => a.order - b.order);
  const first = sorted[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: 'rgba(255,255,255,0.96)' }}>
      <div className="max-w-lg mx-auto p-6">
        <button type="button" onClick={onClose} style={{ float: 'right', fontSize: '9px', fontFamily: '"Futura PT Medium"', border: '1.3px solid #000', padding: '6px 10px', background: '#fff', cursor: 'pointer' }}>
          EXIT CLIENT PREVIEW
        </button>
        <p style={{ ...dmSectionTitleStyle, fontSize: '12px', marginBottom: '16px' }}>{draft.productionName}</p>

        {first ? (
          <div className="mb-6 overflow-hidden" style={{ aspectRatio: '16/9', border: `1.3px solid ${DM_VISUAL.black}` }}>
            <img src={getScenePreviewSrc(first.selection)} alt="" className="w-full h-full object-cover" />
          </div>
        ) : null}

        <p style={dmSectionTitleStyle}>STORYBOARD</p>
        <div className="flex gap-2 overflow-x-auto mb-6">
          {sorted.map((s) => (
            <img key={s.id} src={getScenePreviewSrc(s.selection)} alt="" style={{ width: '80px', height: '48px', objectFit: 'cover', border: DM_VISUAL.border }} />
          ))}
        </div>

        <p style={dmSectionTitleStyle}>SCRIPT</p>
        {sorted.map((s) => (
          <div key={s.id} className="mb-3">
            <p style={{ ...dmCaptionStyle, fontFamily: '"Futura PT Medium"', color: DM_VISUAL.black }}>{s.name}</p>
            <p style={dmScriptStyle}>{session.sceneMeta[s.id]?.script}</p>
          </div>
        ))}

        <p style={dmSectionTitleStyle}>PRODUCTION NOTES</p>
        {sorted.map((s) => {
          const notes = session.sceneMeta[s.id]?.directorNotes;
          if (!notes) return null;
          return <p key={s.id} style={dmCaptionStyle}>{s.name}: {notes}</p>;
        })}
      </div>
    </div>
  );
}
