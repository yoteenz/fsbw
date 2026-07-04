import type { ProductionDraft, ProductionOutputTypeId, ProductionTemplateId } from '../../../../utils/adminStudioProductionBuilderDemo';
import {
  PRODUCTION_OUTPUT_TYPES,
  PRODUCTION_TEMPLATES,
} from '../../../../utils/adminStudioProductionBuilderDemo';
import { getPromptStatusLabel, summarizeSceneForInspector } from '../../../../utils/adminStudioProductionBuilderPrompt';
import { PB_VISUAL, pbActionBtnStyle, pbCaptionStyle, pbLabelStyle, pbPanelStyle, pbSectionTitleStyle, pbValueStyle } from './productionBuilderTheme';
import type { ProductionScene } from '../../../../utils/adminStudioProductionBuilderDemo';

type ProductionBuilderInspectorProps = {
  draft: ProductionDraft;
  activeScene: ProductionScene | undefined;
  assembledPrompt: string;
  generationOutputs: Array<{ id: string; label: string; status: string }> | null;
  onUpdateMeta: (patch: Partial<ProductionDraft>) => void;
  onToggleOutput: (id: ProductionOutputTypeId) => void;
  onLoadTemplate: (id: ProductionTemplateId) => void;
  onPromptChange: (text: string) => void;
};

function InspectorRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 py-1" style={{ borderBottom: PB_VISUAL.divider }}>
      <span style={pbLabelStyle}>{label}</span>
      <span style={{ ...pbValueStyle, textAlign: 'right' }}>{value || '—'}</span>
    </div>
  );
}

export function ProductionBuilderInspector({
  draft,
  activeScene,
  assembledPrompt,
  generationOutputs,
  onUpdateMeta,
  onToggleOutput,
  onLoadTemplate,
  onPromptChange,
}: ProductionBuilderInspectorProps) {
  const sceneRows = activeScene ? summarizeSceneForInspector(activeScene) : [];

  return (
    <aside className="flex flex-col min-h-0 h-full overflow-y-auto" style={{ ...pbPanelStyle, padding: '10px' }}>
      <p style={pbSectionTitleStyle}>PRODUCTION INSPECTOR</p>

      <div className="mb-3 space-y-1">
        <label style={pbLabelStyle}>PRODUCTION NAME</label>
        <input
          value={draft.productionName}
          onChange={(e) => onUpdateMeta({ productionName: e.target.value })}
          className="w-full border px-2 py-1"
          style={{ borderWidth: '1.3px', fontFamily: '"Futura PT Book"', fontSize: '9px' }}
        />
      </div>

      <div className="mb-3">
        <InspectorRow label="WORKSPACE" value={draft.workspace} />
        <InspectorRow label="PROJECT" value={draft.project} />
        <InspectorRow label="CONTENT PACK" value={draft.contentPackId ?? '—'} />
        <InspectorRow label="SHOW" value={draft.show} />
        <InspectorRow label="EPISODE" value={draft.episode} />
        <InspectorRow label="BRAND" value={draft.brand} />
        <InspectorRow label="TARGET AUDIENCE" value={draft.targetAudience} />
        <InspectorRow label="CTA" value={draft.cta} />
        <InspectorRow label="ASPECT RATIO" value={draft.aspectRatio} />
        <InspectorRow label="GENERATION STATUS" value={draft.generationStatus.toUpperCase()} />
        <InspectorRow label="PROMPT STATUS" value={getPromptStatusLabel(draft.promptStatus)} />
      </div>

      {sceneRows.length > 0 ? (
        <div className="mb-3">
          <p style={{ ...pbSectionTitleStyle, fontSize: '9px' }}>ACTIVE SCENE</p>
          {sceneRows.map((row) => (
            <InspectorRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      ) : null}

      <div className="mb-3">
        <p style={{ ...pbSectionTitleStyle, fontSize: '9px' }}>OUTPUT TYPES</p>
        <div className="flex flex-wrap gap-1">
          {PRODUCTION_OUTPUT_TYPES.map((out) => {
            const on = draft.outputTypes.includes(out.id);
            return (
              <button
                key={out.id}
                type="button"
                onClick={() => onToggleOutput(out.id)}
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '7px',
                  padding: '4px 5px',
                  border: on ? `1.3px solid ${PB_VISUAL.red}` : PB_VISUAL.border,
                  background: on ? '#FFF5F5' : '#FFFFFF',
                  color: on ? PB_VISUAL.red : PB_VISUAL.black,
                  cursor: 'pointer',
                }}
              >
                {out.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-3">
        <p style={{ ...pbSectionTitleStyle, fontSize: '9px' }}>TEMPLATES</p>
        <div className="flex flex-wrap gap-1">
          {PRODUCTION_TEMPLATES.map((t) => (
            <button key={t.id} type="button" onClick={() => onLoadTemplate(t.id)} style={{ ...pbActionBtnStyle, fontSize: '7px' }}>
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex-1 min-h-0 flex flex-col">
        <p style={{ ...pbSectionTitleStyle, fontSize: '9px' }}>ASSEMBLED PROMPT</p>
        <p style={{ ...pbCaptionStyle, marginBottom: '4px' }}>AUTO-BUILT FROM APPROVED ASSETS · EDIT IF NEEDED</p>
        <textarea
          value={draft.promptOverride ?? assembledPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="flex-1 w-full border p-2 min-h-[120px]"
          style={{ borderWidth: '1.3px', fontFamily: '"Futura PT Book"', fontSize: '8px', lineHeight: 1.4 }}
        />
      </div>

      {generationOutputs ? (
        <div className="mb-2">
          <p style={{ ...pbSectionTitleStyle, fontSize: '9px' }}>BUILD OUTPUTS</p>
          {generationOutputs.map((o) => (
            <div key={o.id} className="flex justify-between py-0.5">
              <span style={pbCaptionStyle}>{o.label}</span>
              <span style={{ ...pbCaptionStyle, color: o.status === 'ready' ? '#16A34A' : PB_VISUAL.gray }}>{o.status.toUpperCase()}</span>
            </div>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
