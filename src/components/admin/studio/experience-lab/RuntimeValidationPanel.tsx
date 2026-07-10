import { BootDiagnosticsPanel } from '../../../../studio-os-core/runtime-diagnostics/boot-diagnostics-panel';
import { RuntimeDiagnostics } from '../../../../studio-os-core/runtime-diagnostics';
import { useStudioBoot } from '../../../../hooks/useStudioBoot';
import { useExperienceLabState } from '../../../../hooks/useExperienceLabState';
import { XELAB_PANEL_LABELS, type XelabPanelId } from '../../../../studio-os-core/genesis';

const panelStyle = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: '12px',
  color: '#111',
};

/** Mode 1 — Runtime Validation (boot, memory, runtime, performance, navigation). */
export function RuntimeValidationPanel() {
  const { live, readiness, fatalError, retry, continueSafeMode, skipCurrentModule } =
    useStudioBoot('experience-runtime');
  const lab = useExperienceLabState();

  return (
    <div data-xelab-mode="runtime-validation" style={panelStyle}>
      <section style={{ marginBottom: 16 }}>
        <BootDiagnosticsPanel
          live={live}
          title="Runtime Validation — StudioBootstrap™"
          onRetry={retry}
          onSafeMode={continueSafeMode}
          onSkipCurrent={skipCurrentModule}
        />
      </section>

      {readiness ? (
        <section style={{ marginBottom: 16 }}>
          <RuntimeDiagnostics snapshot={readiness} onRetry={retry} />
        </section>
      ) : null}

      {fatalError ? (
        <p style={{ color: '#eb1c24', padding: '0 16px 16px' }}>Fatal: {fatalError}</p>
      ) : null}

      <section style={{ padding: '0 16px 24px' }}>
        <h2 style={{ fontSize: '13px', margin: '0 0 8px' }}>Experience Runtime Lab State</h2>
        <p style={{ margin: '0 0 8px', color: '#555' }}>
          Brand: <strong>{lab.view.selection.brandId}</strong> · Department:{' '}
          <strong>{lab.view.selection.departmentId}</strong> · Scene:{' '}
          <strong>{lab.view.selection.sceneId}</strong> · Switches: {lab.switchCount}
        </p>
        <p style={{ margin: '0 0 12px', color: '#555' }}>
          Boot ready: {lab.bootReport.ready ? 'yes' : 'no'} · Warnings:{' '}
          {lab.bootReport.warnings.length} · Fallbacks: {lab.bootReport.fallbacksUsed.length}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {(Object.keys(XELAB_PANEL_LABELS) as XelabPanelId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => lab.setPanel(id)}
              style={{
                padding: '6px 10px',
                fontSize: '10px',
                border: '1px solid #ccc',
                borderRadius: 6,
                background: lab.view.selection.activePanel === id ? '#eef2ff' : '#fff',
                cursor: 'pointer',
              }}
            >
              {XELAB_PANEL_LABELS[id]}
            </button>
          ))}
        </div>

        {lab.bootReport.warnings.length > 0 ? (
          <div style={{ color: '#b45309', marginBottom: 8 }}>
            <strong>Boot warnings:</strong> {lab.bootReport.warnings.join(' · ')}
          </div>
        ) : null}

        {lab.view.inspector ? (
          <details open>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Runtime Inspector snapshot</summary>
            <pre
              style={{
                fontSize: '10px',
                background: '#fafafa',
                border: '1px solid #eee',
                padding: 12,
                borderRadius: 8,
                overflow: 'auto',
                maxHeight: 240,
              }}
            >
              {JSON.stringify(
                {
                  brandId: lab.view.inspector.brandDna.brandId,
                  sceneId: lab.view.inspector.sceneDna.sceneId,
                  renderNodeCount: lab.view.inspector.renderNodes?.length ?? 0,
                  tokenCount: Object.keys(lab.view.inspector.resolvedTokens ?? {}).length,
                },
                null,
                2
              )}
            </pre>
          </details>
        ) : null}
      </section>
    </div>
  );
}
