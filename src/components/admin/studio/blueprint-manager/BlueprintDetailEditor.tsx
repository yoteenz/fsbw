import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BlueprintDefinition, BlueprintStatus } from '../../../../utils/adminStudioBlueprintManagerDemo';
import { BLUEPRINT_STATUS_LABELS } from '../../../../utils/adminStudioBlueprintManagerDemo';
import { checklistStatusColor } from '../../../../utils/adminStudioBlueprintManagerCompute';
import { reviewBlueprintForGeneration } from '../../../../utils/adminStudioBlueprintManagerAnalysis';
import { BlueprintDependencyGraph } from './BlueprintDependencyGraph';
import { BlueprintReadinessPanel } from './BlueprintReadinessPanel';
import { BP_VISUAL, bpActionBtn, bpCaption, bpGrace, bpPanelStyle, bpSectionTitle, statusColor } from './blueprintManagerTheme';

type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ ...bpPanelStyle, marginBottom: '8px' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-2 flex justify-between items-center"
        style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
      >
        <p style={{ ...bpSectionTitle, margin: 0 }}>{title}</p>
        <span style={bpCaption}>{open ? '−' : '+'}</span>
      </button>
      {open ? <div className="px-3 pb-3">{children}</div> : null}
    </div>
  );
}

type BlueprintDetailEditorProps = {
  blueprint: BlueprintDefinition;
  onStatusChange: (status: BlueprintStatus) => void;
  onChecklistToggle: (itemId: string) => void;
  onRestoreVersion: (version: number) => void;
  onSubmitReview: () => void;
  onApprove: () => void;
};

export function BlueprintDetailEditor({
  blueprint,
  onStatusChange,
  onChecklistToggle,
  onRestoreVersion,
  onSubmitReview,
  onApprove,
}: BlueprintDetailEditorProps) {
  const navigate = useNavigate();
  const reviews = reviewBlueprintForGeneration(blueprint);
  const bp = blueprint;

  return (
    <div>
      <button type="button" onClick={() => navigate('/admin/studio/blueprint-manager')} style={{ ...bpActionBtn, marginBottom: '12px' }}>
        ← BLUEPRINT LIBRARY
      </button>

      <header style={{ ...bpPanelStyle, padding: '12px', marginBottom: '12px' }}>
        <p style={{ ...bpGrace, fontSize: '20px' }}>{bp.identity.name}</p>
        <p style={bpCaption}>
          {bp.identity.category.toUpperCase()} · {bp.scope === 'global' ? 'STUDIO OS GLOBAL' : bp.identity.workspace}
        </p>
        <p style={{ ...bpCaption, color: BP_VISUAL.black, marginTop: 6 }}>{bp.identity.description}</p>
        <div className="flex flex-wrap gap-2 mt-3 items-center">
          <span style={{ ...bpCaption, color: statusColor(bp.status), fontFamily: '"Futura PT Medium"' }}>
            {BLUEPRINT_STATUS_LABELS[bp.status]}
          </span>
          {bp.status === 'draft' ? (
            <button type="button" onClick={onSubmitReview} style={bpActionBtn}>SUBMIT FOR REVIEW</button>
          ) : null}
          {bp.status === 'review' ? (
            <button type="button" onClick={onApprove} style={bpActionBtn}>APPROVE BLUEPRINT</button>
          ) : null}
          <select
            value={bp.status}
            onChange={(e) => onStatusChange(e.target.value as BlueprintStatus)}
            className="text-[8px] font-futura uppercase border px-2 py-1"
            style={{ borderColor: BP_VISUAL.black }}
          >
            {(Object.keys(BLUEPRINT_STATUS_LABELS) as BlueprintStatus[]).map((s) => (
              <option key={s} value={s}>{BLUEPRINT_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </header>

      <BlueprintReadinessPanel blueprint={bp} />

      <section style={{ ...bpPanelStyle, padding: '12px', margin: '12px 0' }}>
        <p style={bpSectionTitle}>EXECUTIVE AI DIRECTOR · BLUEPRINT REVIEW</p>
        <p style={{ ...bpCaption, marginBottom: 8 }}>PRE-GENERATION QUALITY GATE · NO AI CREDITS SPENT</p>
        {reviews.map((r) => (
          <div key={r.id} className="mb-2" style={{ borderLeft: `3px solid ${r.severity === 'critical' ? BP_VISUAL.red : r.severity === 'warn' ? BP_VISUAL.warn : BP_VISUAL.gray}`, paddingLeft: 8 }}>
            <p style={{ ...bpCaption, color: BP_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{r.title}</p>
            <p style={bpCaption}>{r.detail}</p>
          </div>
        ))}
      </section>

      <CollapsibleSection title="IDENTITY" defaultOpen>
        <p style={bpCaption}>NAME · {bp.identity.name}</p>
        <p style={bpCaption}>CATEGORY · {bp.identity.category}</p>
        <p style={bpCaption}>WORKSPACE · {bp.identity.workspace}</p>
      </CollapsibleSection>

      <CollapsibleSection title="REQUIRED IMAGES">
        <div className="flex flex-wrap gap-1">
          {bp.requiredImages.map((img) => (
            <span key={img} className="px-2 py-1" style={{ border: BP_VISUAL.border, fontSize: '8px', fontFamily: '"Futura PT Book"' }}>{img}</span>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="REQUIRED VIDEOS">
        <div className="flex flex-wrap gap-1">
          {bp.requiredVideos.map((v) => (
            <span key={v} className="px-2 py-1" style={{ border: BP_VISUAL.border, fontSize: '8px' }}>{v}</span>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="CAMERA PRESETS">
        <div className="flex flex-wrap gap-1">
          {bp.requiredCameraPresets.map((c) => (
            <span key={c} className="px-2 py-1" style={{ border: BP_VISUAL.border, fontSize: '8px' }}>{c}</span>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="LIGHTING">
        <div className="flex flex-wrap gap-1">
          {bp.requiredLighting.map((l) => (
            <span key={l} className="px-2 py-1" style={{ border: BP_VISUAL.border, fontSize: '8px' }}>{l}</span>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="PROPS">
        <div className="flex flex-wrap gap-1">
          {bp.requiredProps.length ? bp.requiredProps.map((p) => (
            <span key={p} className="px-2 py-1" style={{ border: BP_VISUAL.border, fontSize: '8px' }}>{p}</span>
          )) : <p style={bpCaption}>NONE DEFINED</p>}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="PROMPT STACK" defaultOpen>
        <div className="space-y-2">
          {bp.promptStack.map((layer, idx) => (
            <div key={layer.id}>
              {idx > 0 ? <p style={{ ...bpCaption, textAlign: 'center', fontSize: '8px' }}>↓</p> : null}
              <div style={{ padding: '8px', background: 'rgba(0,0,0,0.03)', border: BP_VISUAL.border }}>
                <p style={{ ...bpCaption, color: BP_VISUAL.red, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{layer.label}</p>
                <p style={{ ...bpCaption, color: BP_VISUAL.black }}>{layer.content}</p>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="OUTPUT REQUIREMENTS">
        {bp.outputRules.map((o) => (
          <p key={o.id} style={bpCaption}>{o.assetType} · {o.spec}</p>
        ))}
      </CollapsibleSection>

      <CollapsibleSection title="DEPENDENCY GRAPH" defaultOpen>
        <BlueprintDependencyGraph nodes={bp.dependencies} />
      </CollapsibleSection>

      <CollapsibleSection title="VALIDATION RULES">
        {bp.validationRules.map((v) => (
          <p key={v.id} style={bpCaption}>• {v.label} — {v.description}</p>
        ))}
        <p style={{ ...bpCaption, marginTop: 8, fontSize: '7px' }}>ON FAILURE · MARK REQUIREMENT INCOMPLETE</p>
      </CollapsibleSection>

      <CollapsibleSection title="USED BY · RELATIONSHIPS" defaultOpen>
        {bp.usedBy.length ? (
          <div className="flex flex-wrap gap-2">
            {bp.usedBy.map((rel) => (
              <button key={rel.id} type="button" onClick={() => navigate(rel.route)} style={bpActionBtn}>
                {rel.label}
              </button>
            ))}
          </div>
        ) : (
          <p style={bpCaption}>NO RELATIONSHIPS LINKED YET</p>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="ASSET CHECKLIST" defaultOpen>
        <div className="space-y-1">
          {bp.checklist.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChecklistToggle(item.id)}
              className="w-full flex justify-between items-center py-1 text-left"
              style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <span style={{ ...bpCaption, color: BP_VISUAL.black }}>{item.label}</span>
              <span style={{ ...bpCaption, color: checklistStatusColor(item.status), fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>
                {item.status.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="METADATA">
        {Object.entries(bp.metadata).map(([k, v]) => (
          <p key={k} style={bpCaption}>{k.toUpperCase()} · {v}</p>
        ))}
      </CollapsibleSection>

      <CollapsibleSection title="VERSION HISTORY">
        {bp.versionHistory.map((v) => (
          <div key={v.version} className="flex justify-between items-center py-1" style={{ borderBottom: '1px solid #eee' }}>
            <div>
              <p style={{ ...bpCaption, color: BP_VISUAL.black }}>V{v.version} · {v.note}</p>
              <p style={{ ...bpCaption, fontSize: '7px' }}>{v.savedAt}</p>
            </div>
            <button type="button" onClick={() => onRestoreVersion(v.version)} style={{ ...bpActionBtn, fontSize: '7px' }}>
              RESTORE
            </button>
          </div>
        ))}
      </CollapsibleSection>

      <p style={{ ...bpCaption, marginTop: 12, textAlign: 'center' }}>
        SPECIFICATION ONLY · ASSET FACTORY NOT CONNECTED · NO GENERATION
      </p>
    </div>
  );
}
