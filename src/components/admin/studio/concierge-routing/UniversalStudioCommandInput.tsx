/** Shared universal command input — reusable across Executive Timeline and future command surfaces. */
import type { CSSProperties } from 'react';
import { UNIVERSAL_COMMAND_LABELS, TIMELINE_COMMAND_EXAMPLES } from '../../../../studio-os-core/concierge-routing/constants';
import type { FounderCommandRoute } from '../../../../studio-os-core/concierge-routing/types';
import { ET_VISUAL, etLabel, etPanelStyle, etSectionTitle, etValue } from '../executive-timeline/executiveTimelineTheme';

const panelStyle: CSSProperties = etPanelStyle;
const labelStyle: CSSProperties = etLabel;
const valueStyle: CSSProperties = etValue;

type UniversalCommandInputProps = {
  input: string;
  onInputChange: (text: string) => void;
  onSubmit: () => void;
  pendingRoute?: FounderCommandRoute | null;
  lastNote?: string;
  onApprove?: () => void;
  onCancel?: () => void;
  onAdjust?: () => void;
  onAskWhy?: () => void;
  askWhyAnswer?: string;
  exampleCommands?: readonly string[];
};

export function UniversalStudioCommandInput({
  input,
  onInputChange,
  onSubmit,
  pendingRoute,
  lastNote,
  onApprove,
  onCancel,
  onAdjust,
  onAskWhy,
  askWhyAnswer,
  exampleCommands = TIMELINE_COMMAND_EXAMPLES,
}: UniversalCommandInputProps) {
  const label = UNIVERSAL_COMMAND_LABELS[Math.floor(Date.now() / 60000) % UNIVERSAL_COMMAND_LABELS.length];

  return (
    <div className="mb-4 p-3 rounded-sm max-w-2xl mx-auto" style={panelStyle}>
      <p style={{ ...etSectionTitle, textAlign: 'center' }}>{label}</p>
      <p style={{ ...valueStyle, fontSize: '6px', color: ET_VISUAL.textMuted, textAlign: 'center', marginBottom: 8 }}>
        Speak naturally — Studio OS routes to the right concierge automatically.
      </p>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          placeholder="Move my designer meeting to Thursday..."
          className="flex-1 px-2 py-1.5 bg-white/60 border rounded-sm"
          style={{ ...valueStyle, fontSize: '7px', borderColor: 'rgba(0,0,0,0.08)' }}
          aria-label="Universal Studio OS command input"
        />
        <button
          type="button"
          onClick={onSubmit}
          className="px-3 py-1.5"
          style={{ ...panelStyle, background: ET_VISUAL.champagneSoft, cursor: 'pointer' }}
        >
          <span style={{ ...labelStyle, color: ET_VISUAL.gold }}>SEND</span>
        </button>
      </div>
      <div className="flex flex-wrap gap-1 justify-center mb-2">
        {exampleCommands.slice(0, 4).map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onInputChange(ex)}
            style={{ ...labelStyle, fontSize: '5px', border: ET_VISUAL.glassBorder, padding: '2px 4px', cursor: 'pointer' }}
          >
            {ex}
          </button>
        ))}
      </div>

      {(pendingRoute?.routingNote || lastNote) && (
        <p style={{ ...labelStyle, color: ET_VISUAL.portfolio, textAlign: 'center', marginTop: 8 }}>
          {pendingRoute?.routingNote ?? lastNote}
        </p>
      )}

      {pendingRoute?.clarificationQuestion && (
        <p style={{ ...valueStyle, fontSize: '6px', color: ET_VISUAL.textMuted, textAlign: 'center', marginTop: 6, fontStyle: 'italic' }}>
          {pendingRoute.clarificationQuestion}
        </p>
      )}

      {askWhyAnswer && (
        <p style={{ ...valueStyle, fontSize: '6px', color: ET_VISUAL.textDim, textAlign: 'center', marginTop: 6 }}>
          {askWhyAnswer}
        </p>
      )}

      {pendingRoute?.status === 'pending-approval' && (
        <div className="flex flex-wrap gap-2 justify-center mt-3">
          {onApprove && (
            <ActionBtn label="APPROVE" color={ET_VISUAL.scheduled} onClick={onApprove} />
          )}
          {onAdjust && (
            <ActionBtn label="ADJUST" color={ET_VISUAL.gold} onClick={onAdjust} />
          )}
          {onCancel && (
            <ActionBtn label="CANCEL" color={ET_VISUAL.textDim} onClick={onCancel} />
          )}
          {onAskWhy && (
            <ActionBtn label="ASK WHY" color={ET_VISUAL.portfolio} onClick={onAskWhy} />
          )}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...labelStyle, color, cursor: 'pointer', border: ET_VISUAL.glassBorder, padding: '4px 10px' }}
    >
      {label}
    </button>
  );
}

export function RoutingImpactPreviewPanel({ route }: { route: FounderCommandRoute }) {
  const preview = route.impactPreview;
  if (!preview) return null;

  return (
    <div className="mb-4 p-3 rounded-sm max-w-2xl mx-auto" style={{ ...panelStyle, borderColor: 'rgba(217,119,6,0.3)' }}>
      <p style={{ ...labelStyle, color: ET_VISUAL.atRisk, textAlign: 'center', marginBottom: 4 }}>
        IMPACT PREVIEW · BEFORE APPLYING
      </p>
      <p style={{ ...valueStyle, fontSize: '7px', textAlign: 'center', marginBottom: 8 }}>{preview.primaryAction}</p>

      {preview.affectedEventTitles.length > 0 && (
        <div className="mb-2">
          <p style={labelStyle}>AFFECTED EVENTS</p>
          {preview.affectedEventTitles.map((t: string) => (
            <p key={t} style={{ ...valueStyle, fontSize: '6px', color: ET_VISUAL.textMuted }}>· {t}</p>
          ))}
        </div>
      )}

      {preview.affectedDependencies.length > 0 && (
        <div className="mb-2">
          <p style={labelStyle}>DEPENDENCIES</p>
          {preview.affectedDependencies.map((d: string) => (
            <p key={d} style={{ ...valueStyle, fontSize: '6px', color: ET_VISUAL.textMuted }}>· {d}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <p style={labelStyle}>CONCIERGES</p>
          <p style={{ ...valueStyle, fontSize: '6px' }}>{preview.conciergesInvolved.join(' · ')}</p>
        </div>
        {preview.executivesInvolved.length > 0 && (
          <div>
            <p style={labelStyle}>EXECUTIVES</p>
            <p style={{ ...valueStyle, fontSize: '6px' }}>{preview.executivesInvolved.join(' · ')}</p>
          </div>
        )}
      </div>

      {preview.risks.length > 0 && (
        <div className="mb-2">
          <p style={labelStyle}>RISKS</p>
          {preview.risks.map((r: string) => (
            <p key={r} style={{ ...valueStyle, fontSize: '6px', color: ET_VISUAL.atRisk }}>· {r}</p>
          ))}
        </div>
      )}

      <p style={{ ...labelStyle, textAlign: 'center', marginTop: 8, color: ET_VISUAL.portfolio }}>
        {preview.confidencePct}% CONFIDENCE · {preview.requiresFounderApproval ? 'FOUNDER APPROVAL REQUIRED' : 'CONCIERGE CAN APPLY'}
        {preview.wouldCreateEvents ? ' · TENTATIVE ONLY WITH APPROVAL' : ''}
      </p>
    </div>
  );
}
