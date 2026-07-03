import {
  ADMIN_STUDIO_CONTENT_ENGINE_STEPS,
} from '../../../utils/adminStudioContentBrainDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioContentEngineWorkflowProps = {
  masterTopic: string;
  onMasterTopicChange: (value: string) => void;
  workflowNotes: string;
  onWorkflowNotesChange: (value: string) => void;
};

export function AdminStudioContentEngineWorkflow({
  masterTopic,
  onMasterTopicChange,
  workflowNotes,
  onWorkflowNotesChange,
}: AdminStudioContentEngineWorkflowProps) {
  return (
    <div className="space-y-4">
      <div
        className="p-3 border bg-white/80"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorderStrong, borderLeft: `3px solid ${ADMIN_STUDIO_THEME.accent}` }}
      >
        <p
          className="text-[8px] font-futura uppercase mb-1.5 tracking-wider"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
        >
          MASTER TOPIC
        </p>
        <textarea
          rows={3}
          value={masterTopic}
          onChange={(e) => onMasterTopicChange(e.target.value)}
          className="w-full bg-white border text-black text-[10px] font-futura uppercase px-3 py-2 outline-none resize-y min-h-[60px]"
          style={{ fontWeight: 515, lineHeight: 1.45, borderColor: ADMIN_STUDIO_THEME.inputBorder }}
        />
      </div>

      <div className="flex flex-col items-center gap-0">
        {ADMIN_STUDIO_CONTENT_ENGINE_STEPS.map((step, index) => {
          const isMaster = step.id === 'master-topic';
          if (isMaster) return null;

          return (
            <div key={step.id} className="w-full flex flex-col items-center">
              {index > 1 ? (
                <div
                  className="w-px h-3"
                  style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }}
                />
              ) : null}
              <div
                className="w-full px-3 py-2 border bg-white/70"
                style={{
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                  background: step.id === 'publishing' ? 'rgba(235,28,36,0.06)' : ADMIN_STUDIO_THEME.panelBg,
                }}
              >
                <p
                  className="text-[9px] font-futura uppercase"
                  style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}
                >
                  {step.label}
                </p>
                <p
                  className="text-[7px] font-futura uppercase mt-0.5"
                  style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}
                >
                  {step.note}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="p-3"
        style={{
          background: ADMIN_STUDIO_THEME.panelBg,
          border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}`,
        }}
      >
        <p
          className="text-[8px] font-futura uppercase mb-1.5 tracking-wider"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
        >
          WORKFLOW NOTES
        </p>
        <textarea
          rows={3}
          value={workflowNotes}
          onChange={(e) => onWorkflowNotesChange(e.target.value)}
          className="w-full bg-white border text-black text-[9px] font-futura uppercase px-3 py-2 outline-none resize-y"
          style={{ fontWeight: 515, lineHeight: 1.45, borderColor: ADMIN_STUDIO_THEME.inputBorder }}
        />
        <p
          className="text-[7px] font-futura uppercase mt-2"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
        >
          VISUAL PLANNING ONLY — NO AUTOMATION · ALL OUTPUTS REQUIRE APPROVAL
        </p>
      </div>
    </div>
  );
}
