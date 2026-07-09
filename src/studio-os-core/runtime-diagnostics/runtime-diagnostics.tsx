import type { RuntimeReadinessSnapshot } from '../runtime-readiness';
import type { BootModuleSnapshot } from '../kernel/types';

const statusColor: Record<string, string> = {
  ready: '#166534',
  fallback: '#b45309',
  failed: '#eb1c24',
  loading: '#2563eb',
  idle: '#6b7280',
};

function ModuleRow({ mod }: { mod: BootModuleSnapshot }) {
  return (
    <li style={{ padding: '6px 0', borderBottom: '1px solid #eee', fontSize: '12px' }}>
      <span style={{ color: statusColor[mod.status] ?? '#333', fontWeight: 600 }}>{mod.status.toUpperCase()}</span>{' '}
      {mod.name}
      {mod.errors.length > 0 ? (
        <div style={{ color: '#eb1c24', marginTop: '4px' }}>{mod.errors.join(' · ')}</div>
      ) : null}
      {mod.warnings.length > 0 ? (
        <div style={{ color: '#b45309', marginTop: '4px' }}>{mod.warnings.join(' · ')}</div>
      ) : null}
    </li>
  );
}

/** RuntimeDiagnostics™ — boot sequence inspector (no scene rendering). */
export function RuntimeDiagnostics({
  snapshot,
  onRetry,
}: {
  snapshot: RuntimeReadinessSnapshot;
  onRetry?: () => void;
}) {
  const { bootReport, runtimeReport, contract, missingDependencies, fallbacksUsed, errors, warnings } =
    snapshot;

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        padding: '16px',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        color: '#1a1a1a',
        background: '#fafafa',
      }}
      data-studio-runtime-diagnostics
    >
      <h1 style={{ fontSize: '14px', margin: '0 0 8px', letterSpacing: '0.06em' }}>
        STUDIO OS — RUNTIME DIAGNOSTICS
      </h1>
      <p style={{ margin: '0 0 16px', color: '#555' }}>
        Scene rendering disabled. Boot order enforced by StudioKernel™.
      </p>

      <section style={{ marginBottom: '16px' }}>
        <p style={{ fontWeight: 600, margin: '0 0 8px' }}>Boot sequence</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {(bootReport?.modules ?? []).map((mod) => (
            <ModuleRow key={mod.id} mod={mod} />
          ))}
        </ul>
      </section>

      {missingDependencies.length > 0 ? (
        <p style={{ color: '#eb1c24' }}>
          <strong>Missing dependencies:</strong> {missingDependencies.join(', ')}
        </p>
      ) : null}

      {errors.length > 0 ? (
        <ul style={{ color: '#eb1c24', paddingLeft: '18px' }}>
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}

      {warnings.length > 0 ? (
        <ul style={{ color: '#666', paddingLeft: '18px' }}>
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}

      {fallbacksUsed.length > 0 ? (
        <p style={{ marginTop: '8px' }}>
          <strong>Fallbacks:</strong> {fallbacksUsed.join(' · ')}
        </p>
      ) : null}

      <section
        style={{
          marginTop: '16px',
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
          padding: '12px',
        }}
      >
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Selected contract</p>
        <div>Brand: {contract.brandId}</div>
        <div>Department: {contract.departmentId}</div>
        <div>Scene: {contract.sceneId}</div>
        <div>Template: {contract.templateId}</div>
        <div>Platform DNA: {contract.platformDnaVersion}</div>
        <div>State DNA: {contract.stateDnaVersion}</div>
        {runtimeReport ? (
          <>
            <div>Boot validator ready: {runtimeReport.ready ? 'yes' : 'no'}</div>
            {runtimeReport.missingObjects.length > 0 ? (
              <div style={{ color: '#eb1c24' }}>
                Missing objects: {runtimeReport.missingObjects.join(', ')}
              </div>
            ) : null}
          </>
        ) : null}
      </section>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          style={{
            marginTop: '16px',
            padding: '8px 12px',
            border: '1px solid #eb1c24',
            background: '#fff',
            color: '#eb1c24',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Retry Boot
        </button>
      ) : null}
    </div>
  );
}
