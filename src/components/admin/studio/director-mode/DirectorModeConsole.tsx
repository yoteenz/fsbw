import type { DirectorChecklistItem, DirectorReadinessDimension } from '../../../../utils/adminStudioDirectorModeDemo';
import { DM_VISUAL, dmActionBtnStyle, dmCaptionStyle, dmPanelStyle, dmSectionTitleStyle } from './directorModeTheme';

type ConsoleMetrics = {
  estimatedRuntime: string;
  estimatedCost: string;
  generationTime: string;
  requiredAssets: number;
  missingAssets: number;
  aiConfidence: number;
};

type DirectorModeConsoleProps = {
  metrics: ConsoleMetrics | null;
  readiness: { dimensions: DirectorReadinessDimension[]; overall: number };
  checklist: DirectorChecklistItem[];
  canGenerate: boolean;
  onRehearsal: () => void;
  onGenerate: () => void;
  onSaveSnapshot: () => void;
  onClientPreview: () => void;
  rehearsalActive: boolean;
};

export function DirectorModeConsole({
  metrics,
  readiness,
  checklist,
  canGenerate,
  onRehearsal,
  onGenerate,
  onSaveSnapshot,
  onClientPreview,
  rehearsalActive,
}: DirectorModeConsoleProps) {
  return (
    <footer style={{ ...dmPanelStyle, padding: '10px 12px' }}>
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <div>
          <p style={dmSectionTitleStyle}>PRODUCTION CONSOLE</p>
          {metrics ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <Metric label="EST. RUNTIME" value={metrics.estimatedRuntime} />
              <Metric label="EST. COST" value={metrics.estimatedCost} />
              <Metric label="GENERATION TIME" value={metrics.generationTime} />
              <Metric label="REQUIRED ASSETS" value={String(metrics.requiredAssets)} />
              <Metric label="MISSING ASSETS" value={String(metrics.missingAssets)} highlight={metrics.missingAssets > 0} />
              <Metric label="AI CONFIDENCE" value={`${metrics.aiConfidence}%`} />
            </div>
          ) : null}
        </div>

        <div>
          <p style={dmSectionTitleStyle}>READINESS SCORE</p>
          <div className="space-y-1">
            {readiness.dimensions.map((d) => (
              <div key={d.id} className="flex justify-between items-center gap-2">
                <span style={{ ...dmCaptionStyle, fontSize: '7px' }}>{d.label}</span>
                <div className="flex-1 h-1.5 max-w-[100px]" style={{ background: '#eee' }}>
                  <div style={{ width: `${d.score}%`, height: '100%', background: DM_VISUAL.red }} />
                </div>
                <span style={{ ...dmCaptionStyle, fontSize: '7px', minWidth: '28px' }}>{d.score}%</span>
              </div>
            ))}
            <p style={{ ...dmCaptionStyle, fontFamily: '"Futura PT Medium"', color: DM_VISUAL.black, marginTop: '4px' }}>
              OVERALL · {readiness.overall}%
            </p>
          </div>
        </div>

        <div>
          <p style={dmSectionTitleStyle}>EMERGENCY CHECKLIST</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {checklist.map((item) => (
              <span key={item.id} style={{ ...dmCaptionStyle, fontSize: '7px', color: item.checked ? '#16A34A' : DM_VISUAL.gray }}>
                {item.checked ? '✓' : '○'} {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-end justify-end">
          <button type="button" onClick={onSaveSnapshot} style={dmActionBtnStyle}>
            SAVE SNAPSHOT
          </button>
          <button type="button" onClick={onClientPreview} style={dmActionBtnStyle}>
            CLIENT PREVIEW
          </button>
          <button type="button" onClick={onRehearsal} style={dmActionBtnStyle}>
            {rehearsalActive ? 'REHEARSAL…' : 'AI REHEARSAL'}
          </button>
          <button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate}
            style={{
              ...dmActionBtnStyle,
              fontSize: '10px',
              opacity: canGenerate ? 1 : 0.4,
              cursor: canGenerate ? 'pointer' : 'not-allowed',
            }}
          >
            GENERATE PRODUCTION
          </button>
        </div>
      </div>
    </footer>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '6px', color: DM_VISUAL.gray }}>{label}</p>
      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: highlight ? DM_VISUAL.red : DM_VISUAL.black }}>{value}</p>
    </div>
  );
}
