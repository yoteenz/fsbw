import { useEffect, useState } from 'react';
import { XER_DEFAULT_RUNTIME_CONTRACT } from '../../../../studio-os-core/genesis/experience-runtime/runtime-boot/default-contract';
import type { XerRuntimeBootReport } from '../../../../studio-os-core/genesis/experience-runtime/runtime-boot/runtime-boot-validator';

export type RuntimeSafeModeStep = {
  id: string;
  label: string;
  ok: boolean;
  detail?: string;
  error?: string;
};

export type RuntimeSafeModeState = {
  steps: RuntimeSafeModeStep[];
  bootReport: XerRuntimeBootReport | null;
  fatalError: string | null;
};

function emptyBootReport(): XerRuntimeBootReport {
  return {
    ready: false,
    checks: [],
    resolved: {
      brandId: XER_DEFAULT_RUNTIME_CONTRACT.brandId,
      departmentId: XER_DEFAULT_RUNTIME_CONTRACT.departmentId,
      sceneId: XER_DEFAULT_RUNTIME_CONTRACT.sceneId,
      templateId: XER_DEFAULT_RUNTIME_CONTRACT.templateId,
      motionDnaId: XER_DEFAULT_RUNTIME_CONTRACT.motionDnaId,
      registryDepartmentId: XER_DEFAULT_RUNTIME_CONTRACT.departmentId,
      fallbacksUsed: [],
    },
    missingObjects: [],
    fallbacksUsed: [],
    warnings: [],
    resolvedVersions: {
      platformDna: XER_DEFAULT_RUNTIME_CONTRACT.platformDnaVersion,
      brandDna: XER_DEFAULT_RUNTIME_CONTRACT.brandId,
      departmentDna: `${XER_DEFAULT_RUNTIME_CONTRACT.brandId}-${XER_DEFAULT_RUNTIME_CONTRACT.departmentId}`,
      sceneDna: XER_DEFAULT_RUNTIME_CONTRACT.sceneId,
      templateId: XER_DEFAULT_RUNTIME_CONTRACT.templateId,
      stateDna: XER_DEFAULT_RUNTIME_CONTRACT.stateDnaVersion,
      designDna: XER_DEFAULT_RUNTIME_CONTRACT.designDnaVersion,
    },
  };
}

/** Lazy boot sequence — no genesis barrel; scene rendering disabled. */
export function useRuntimeSafeMode(): RuntimeSafeModeState {
  const [state, setState] = useState<RuntimeSafeModeState>({
    steps: [{ id: 'route', label: 'Route loaded', ok: true }],
    bootReport: null,
    fatalError: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const steps: RuntimeSafeModeStep[] = [{ id: 'route', label: 'Route loaded', ok: true }];

      const push = (step: RuntimeSafeModeStep) => {
        steps.push(step);
        if (!cancelled) setState((s) => ({ ...s, steps: [...steps] }));
      };

      try {
        const seedMod = await import(
          '../../../../studio-os-core/genesis/experience-runtime/runtime-boot/default-seed'
        );
        seedMod.getDefaultRuntimeSeed();
        push({ id: 'seed', label: 'Default seed loaded', ok: true });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        push({ id: 'seed', label: 'Default seed loaded', ok: false, error: msg });
        if (!cancelled) setState({ steps, bootReport: emptyBootReport(), fatalError: msg });
        return;
      }

      try {
        await import('../../../../studio-os-core/genesis/experience-engine/bootstrap/seed');
        push({ id: 'engine', label: 'Experience Engine registries loaded', ok: true });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        push({ id: 'engine', label: 'Experience Engine registries loaded', ok: false, error: msg });
      }

      try {
        await import('../../../../studio-os-core/genesis/experience-runtime/bootstrap/seed');
        push({ id: 'runtime', label: 'Experience Runtime registries loaded', ok: true });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        push({ id: 'runtime', label: 'Experience Runtime registries loaded', ok: false, error: msg });
      }

      try {
        const resolver = await import(
          '../../../../studio-os-core/genesis/experience-runtime/runtime-boot/runtime-fallback-resolver'
        );
        const resolved = resolver.resolveRuntimeSelection();
        push({
          id: 'resolver',
          label: 'Runtime resolver loaded',
          ok: true,
          detail: `${resolved.brandId} · ${resolved.departmentId} · ${resolved.sceneId}`,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        push({ id: 'resolver', label: 'Runtime resolver loaded', ok: false, error: msg });
      }

      try {
        const validator = await import(
          '../../../../studio-os-core/genesis/experience-runtime/runtime-boot/runtime-boot-validator'
        );
        const bootReport = validator.validateRuntimeBoot();
        push({
          id: 'contract',
          label: 'Selected contract validated',
          ok: bootReport.ready,
          detail: `${bootReport.resolved.brandId} / ${bootReport.resolved.departmentId} / ${bootReport.resolved.sceneId}`,
        });
        if (!cancelled) {
          setState({ steps, bootReport, fatalError: bootReport.ready ? null : 'Boot validation incomplete' });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        push({ id: 'contract', label: 'Selected contract validated', ok: false, error: msg });
        if (!cancelled) setState({ steps, bootReport: emptyBootReport(), fatalError: msg });
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export function RuntimeSafeMode({
  onRetry,
  bootReport: externalReport,
}: {
  onRetry?: () => void;
  bootReport?: XerRuntimeBootReport | null;
}) {
  const { steps, bootReport, fatalError } = useRuntimeSafeMode();
  const report = externalReport ?? bootReport ?? emptyBootReport();

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
      data-xelab-safe-mode
    >
      <h1 style={{ fontSize: '14px', margin: '0 0 8px', letterSpacing: '0.06em' }}>EXPERIENCE LAB — RUNTIME SAFE MODE</h1>
      <p style={{ margin: '0 0 16px', color: '#555' }}>
        Scene rendering disabled. Boot steps run lazily after mount (no module-scope registry reads).
      </p>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px' }}>
        {steps.map((step) => (
          <li key={step.id} style={{ padding: '6px 0', borderBottom: '1px solid #e5e5e5' }}>
            <span style={{ color: step.ok ? '#166534' : '#eb1c24', fontWeight: 600 }}>
              {step.ok ? 'OK' : 'FAIL'}
            </span>{' '}
            {step.label}
            {step.detail ? ` — ${step.detail}` : ''}
            {step.error ? (
              <span style={{ display: 'block', color: '#eb1c24', marginTop: '4px' }}>{step.error}</span>
            ) : null}
          </li>
        ))}
      </ul>

      {fatalError ? (
        <p style={{ color: '#eb1c24', marginBottom: '12px' }}>
          <strong>Fatal:</strong> {fatalError}
        </p>
      ) : null}

      <section style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '12px' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Runtime Boot Inspector</p>
        <div>Brand: {report.resolved.brandId}</div>
        <div>Department: {report.resolved.departmentId}</div>
        <div>Scene: {report.resolved.sceneId}</div>
        <div>Template: {report.resolvedVersions.templateId}</div>
        <div>Platform DNA: {report.resolvedVersions.platformDna}</div>
        <div>State DNA: {report.resolvedVersions.stateDna}</div>
        {report.missingObjects.length > 0 ? (
          <div style={{ color: '#eb1c24', marginTop: '8px' }}>
            Missing: {report.missingObjects.join(', ')}
          </div>
        ) : null}
        {report.fallbacksUsed.length > 0 ? (
          <div style={{ marginTop: '8px' }}>Fallbacks: {report.fallbacksUsed.join(' · ')}</div>
        ) : null}
        {report.warnings.length > 0 ? (
          <ul style={{ margin: '8px 0 0', paddingLeft: '18px', color: '#666' }}>
            {report.warnings.map((w: string) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
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
