import type { FactoryJob } from '../../../../utils/adminStudioAssetFactoryPipeline';
import type { FactoryDepartmentId } from '../../../../utils/adminStudioAssetFactoryDemo';
import { FACTORY_DEPARTMENTS } from '../../../../utils/adminStudioAssetFactoryDemo';
import { AF_VISUAL, afActiveDept, afActionBtn, afCaption, afPanelStyle, afSectionTitle } from './assetFactoryTheme';

type AssetFactoryLiveMapProps = {
  activeDepartmentId: FactoryDepartmentId | null;
  compact?: boolean;
};

export function AssetFactoryLiveMap({ activeDepartmentId, compact }: AssetFactoryLiveMapProps) {
  return (
    <div className={compact ? 'space-y-1' : 'space-y-2'}>
      {FACTORY_DEPARTMENTS.map((dept, idx) => {
        const active = dept.id === activeDepartmentId;
        return (
          <div key={dept.id} className="flex flex-col items-center">
            <div
              className={active ? 'af-dept-active w-full' : 'w-full'}
              style={{
                ...(active ? afActiveDept : afPanelStyle),
                padding: compact ? '6px 8px' : '10px 12px',
                textAlign: 'center',
                transition: 'all 0.5s ease',
              }}
            >
              <p style={{ ...afCaption, color: active ? AF_VISUAL.red : AF_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: compact ? '7px' : '9px' }}>
                {dept.label}
              </p>
              {!compact ? <p style={{ ...afCaption, fontSize: '7px' }}>{dept.role}</p> : null}
            </div>
            {idx < FACTORY_DEPARTMENTS.length - 1 ? (
              <p style={{ ...afCaption, margin: '2px 0', fontSize: '9px' }}>↓</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

type AssetFactoryJobInspectorProps = {
  job: FactoryJob;
  onPause: () => void;
  onResume: () => void;
  onRetry: () => void;
  onCancel: () => void;
};

export function AssetFactoryJobInspector({ job, onPause, onResume, onRetry, onCancel }: AssetFactoryJobInspectorProps) {
  return (
    <section style={{ ...afPanelStyle, padding: '12px' }}>
      <p style={afSectionTitle}>JOB INSPECTOR · {job.blueprintName}</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { l: 'STATUS', v: job.status.toUpperCase() },
          { l: 'PROVIDER', v: job.provider },
          { l: 'CREDITS', v: String(job.creditsUsed) },
          { l: 'COST', v: job.estimatedCost },
          { l: 'VERSION', v: `V${job.version}` },
          { l: 'PROGRESS', v: `${job.progressPct}%` },
        ].map((row) => (
          <div key={row.l}>
            <p style={{ ...afCaption, fontSize: '7px' }}>{row.l}</p>
            <p style={{ ...afCaption, color: AF_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>{row.v}</p>
          </div>
        ))}
      </div>
      <p style={{ ...afSectionTitle, fontSize: '8px' }}>LOGS</p>
      <div className="max-h-24 overflow-y-auto mb-3">
        {job.logs.map((log, i) => (
          <p key={i} style={{ ...afCaption, fontSize: '7px', color: AF_VISUAL.black }}>{log}</p>
        ))}
      </div>
      {job.qaResults.length > 0 ? (
        <>
          <p style={{ ...afSectionTitle, fontSize: '8px' }}>QA</p>
          {job.qaResults.map((q) => (
            <p key={q.id} style={{ ...afCaption, color: q.passed ? AF_VISUAL.pass : AF_VISUAL.red, fontSize: '7px' }}>
              {q.passed ? '✓' : '✗'} {q.label}
            </p>
          ))}
        </>
      ) : null}
      <div className="flex flex-wrap gap-2 mt-2">
        {job.status === 'running' ? (
          <button type="button" onClick={onPause} style={afActionBtn}>PAUSE</button>
        ) : null}
        {job.status === 'paused' ? (
          <button type="button" onClick={onResume} style={afActionBtn}>RESUME</button>
        ) : null}
        {job.status === 'failed' || job.status === 'needs-review' ? (
          <button type="button" onClick={onRetry} style={afActionBtn}>RETRY</button>
        ) : null}
        {job.status !== 'completed' && job.status !== 'failed' ? (
          <button type="button" onClick={onCancel} style={afActionBtn}>CANCEL</button>
        ) : null}
      </div>
    </section>
  );
}
